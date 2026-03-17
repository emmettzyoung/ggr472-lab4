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
    style: 'mapbox://styles/mapbox/standard',
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
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
                    'circle-color': '#000000',
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


