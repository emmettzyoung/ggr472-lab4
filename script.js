/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZW1tZXR0eW91bmciLCJhIjoiY21rNGI3Y3Z4MDV3ZjNrcHk2MXFrYTlpeSJ9.nhnMjjZj_o1eyXtp_Y8Svw';

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-79.380754, 43.711979],  // starting point, longitude/latitude
    zoom: 10, // starting zoom level
    maxBounds: [
        [-80.110931, 43.425996],
        [-78.857117, 44.085612]
    ]
});


/*--------------------------------------------------------------------
ADD CONTROLS, INTERACTIVITY, AND GEOCODER
--------------------------------------------------------------------*/

// Add navigation and fullscreen controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

// Add geocoder control to the map, which allows users to search for locations in the GTA
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    region: "Ontario",
    placeholder: 'Search for a location in GTA',
    bbox: [-79.6393, 43.5810, -79.1158, 43.8554]
});

// Append the geocoder control to the div with id 'geocoder' in the HTML file, so that it appears on the map.
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// Add event listener to the return button, which flies the map back to the original center and zoom level when clicked.
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.380754, 43.711979],
        zoom: 10,
        essential: true
    });
});


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
let collisions;

fetch("https://raw.githubusercontent.com/emmettzyoung/ggr472-lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson")
    .then(response => response.json())
    .then(response => {
        console.log(response);
        collisions = response;

        map.on('load', () => {
            /*--------------------------------------------------------------------
            Step 3: CREATE BOUNDING BOX VARIABLES FOR HEXGRID
            --------------------------------------------------------------------*/

            // Get an envelope around the collision points.
            let enveloped = turf.envelope(collisions);
            // Uncommment the following code and comment out everything else to see it in the console.
            // console.log(enveloped)

            // Get the bounding box from the envelope variable previously set and increase the size by 10%.
            let bboxscaled = turf.transformScale(enveloped, 1.1);
            console.log(bboxscaled)

            // Get the max and min X and Y values and store as an array of coordinates for hexgrid arguments.
            let bboxcoords = [
                bboxscaled.geometry.coordinates[0][0][0],
                bboxscaled.geometry.coordinates[0][0][1],
                bboxscaled.geometry.coordinates[0][2][0],
                bboxscaled.geometry.coordinates[0][2][1]
            ];

            // Create a variable for cell size of 500 meters.
            let cellSide = 500;
            // Create a variable for the unit options, being meters.
            let options = { units: "meters" };

            /*--------------------------------------------------------------------
            Step 3: Part 2: CREATE HEXGRID
            --------------------------------------------------------------------*/
            // Create the variable.
            let hexgrid = turf.hexGrid(bboxcoords, cellSide, options);

            /*--------------------------------------------------------------------
            Step 4: AGGREGATE COLLISIONS BY HEXGRID
            --------------------------------------------------------------------*/
            //HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
            //      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty

            // Use .collect from turf.js to collect all points (collisions) within each hexagon.
            let collishex = turf.collect(hexgrid, collisions, '_id', 'values');

            // Create a let variable that stores the maximum number of collisions (set to 0 as default).
            let maxcollis = 0;

            // Loop through each feature (hexagon). 
            collishex.features.forEach((feature) => {
                // Create a new property column in feature collection set in collishex called COUNT.
                // Set COUNT to be equal to the length (or amount) of values in each hexagon (think len in python).
                feature.properties.COUNT = feature.properties.values.length
                // Set an if condition so that if the count is larger than maxcollis (set to 0)...
                if (feature.properties.COUNT > maxcollis) {
                    // ...then update the amount of collisions to the amount of collisions counted two lines above.
                    maxcollis = feature.properties.COUNT
                }
            });

            /*--------------------------------------------------------------------
            ADD LAYERS (HEXGRID AND COLLISIONS AS POINTS)
            --------------------------------------------------------------------*/

            // Add it as a source and then add the layer.
            map.addSource('collisions', {
                type: 'geojson',
                data: collisions
            });

            map.addSource('collishexgrid', {
                type: 'geojson',
                data: collishex
            });

            map.addLayer({
                id: 'collisions-points',
                type: 'circle',
                source: 'collisions',
                paint: {
                    'circle-color': 'white',
                    'circle-radius': 3,
                }
            });

            map.addLayer({
                id: 'collishexfill',
                type: 'fill',
                source: 'collishexgrid',
                paint: {
                    "fill-color": [
                        "step",
                        ["get", "COUNT"],
                        "#ffffff",
                        10, "#ffebf1",
                        25, "#ffa0a6",
                        maxcollis, "#ff0000"
                    ],
                    "fill-opacity": 0.8
                },
                filter: ["!=", "COUNT", 0],
            });
    })
});


// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows

/*--------------------------------------------------------------------
EVENT LISTENERS
--------------------------------------------------------------------*/

// Add an event listener that changes the layer displayed based on check box using setLayoutProperty method.
document.getElementById('layercheck').addEventListener('change', (e) => {
    const selectedLayer = document.getElementById('layer-select').value;
    map.setLayoutProperty(
        selectedLayer,
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// Add an event listener that changes the layer displayed based on the dropdown menu selection using setLayoutProperty method and also updates the legend to match the selected layer.
document.getElementById('layer-select').addEventListener('change', (event) => {
    showOnlyLayer(event.target.value);
    updateLegend(event.target.value);
});

document.getElementById('legendcheck').addEventListener('change', (e) => {
    const legend = document.getElementById('legend');
    legend.style.display = e.target.checked ? 'block' : 'none';
});

/*--------------------------------------------------------------------
HOVER EFFECTS AND POPUPS
--------------------------------------------------------------------*/

// Assign variables to keep track of the currently hovered neighbourhood, so that we can reset their feature state when the mouse leaves them
let hoveredHexigonId = null;

// Neighbourhood hover for each layer (neighbourhoods-quantile here). 
map.on('mousemove', 'collishexfill', (e) => {
    if (e.features.length > 0) {
        if (hoveredHexigonId !== null) {
            map.setFeatureState(
                { source: 'neighbourhoods', id: hoveredHexigonId },
                { hover: false }
            );
        }
        hoveredHexigonId = e.features[0].id;
        map.setFeatureState(
            { source: 'collishexfill', id: hoveredHexigonId },
            { hover: true }
        );
    }
});

map.on('mouseleave', 'collishexfill', () => {
    if (hoveredHexigonId !== null) {
        map.setFeatureState(
            { source: 'collishexfill', id: hoveredHexigonId },
            { hover: false }
        );
    }
    hoveredHexigonId = null;
});

// Add click event listeners to the neighbourhood to show popups with information about the clicked neighbourhood.
map.on('click', 'collishexfill', (e) => {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
            "<b>Collisions here</b> " + e.features[0].properties.COUNT + "<br>"
        .addTo(map));
});


/*--------------------------------------------------------------------
CREATE LEGEND IN JAVASCRIPT
--------------------------------------------------------------------*/
// Declare array variables for labels and colours
const legenditems = [
    { label: '0–100,000', colour: '#fd8d3c' },
    { label: '100,000–500,000', colour: '#fc4e2a' },
    { label: '500,000–1,000,000', colour: '#e31a1c' },
    { label: '1,000,000–5,000,000', colour: '#bd0026' },
    { label: '>5,000,000', colour: '#800026' }
];

// For each array item create a row to put the label and colour in
legenditems.forEach(({ label, colour }) => {
    const row = document.createElement('div'); // each item gets a 'row' as a div - this isn't in the legend yet, we do this later
    const colcircle = document.createElement('span'); // create span for colour circle

    colcircle.className = 'legend-colcircle'; // the colcircle will take on the shape and style properties defined in css
    colcircle.style.setProperty('--legendcolour', colour); // a custom property is used to take the colour from the array and apply it to the css class

    const text = document.createElement('span'); // create span for label text
    text.textContent = label; // set text variable to tlegend label value in array

    row.append(colcircle, text); // add circle and text to legend row
    legend.appendChild(row); // add row to legend container
});
