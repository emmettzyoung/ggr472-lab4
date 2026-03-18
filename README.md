# Lab 4

# Welcome to Emmett Young's Lab 4 Repository

### In this repository, you will find the following:
- script.js: Responsible for the functionality of elements defined in the index.html file, including the map, the drop-down menu, the checkboxes, and the hover mechanics for neighbourhoods as well.
- style.css: Responsible for the styling of the body, map, buttons, headers, and text, all to ensure user experience is appealing. 
- Neighbourhoods_Clean: Houses GeoJSON files.
- Neighbourhoods_Shapefiles: Houses rough work shapefiles

### The intended use of this map:
This map is intended for those who want a quick visualization of median incomes or persons in unsuitable housing across Toronto. While this was data that I already had, I was inspired by the idea of wanting a visualization in a moment that is quick and simple, not requiring any ArcGIS computations. Through this webmap, someone can just take a screenshot and have a (mostly) full picture of incomes and unsuitable housing across the city.

### Notes of ownership:
This map and the code included should not be copied without the owner being mentioned. Please mention any code copied was written by emmettzyoung on GitHub. Additionally, use of my mapbox token for other projects is not allowed, and users trying to make use of MapBox's API must retrieve and use their own access token.

### Repository Contents
- `data/pedcyc_collision_06-21.geojson`: Data file containing point locations of road collisions involving pedestrian and cyclists between 2006 and 2021 in Toronto 
- `data/City Wards Data - 4326.geojson`: Data file containing polygons of Toronto's municipal wards, allowing for users to better understand which area of the city they are focusing on.
- `instructions/GGR472_Lab4`: Instructions document explaining steps required to complete the lab
- `index.html`: HTML file responsible for loading in necessary packages and displaying the front end code correctly, with features presented here such as buttons and headers.
- `style.css`: CSS file responsible for the styling of the body, map, buttons, headers, and text, all to ensure user experience is appealing. 
- `script.js`: JavaScript file template that is responsible for the functionality of elements defined in the index.html file, including the map, its layers, the checkboxes, and the hover mechanics for hexagons and points as well.

### A.I. Usage:
The use of Artificial Intelligence was used in this project primarily for troubleshooting with the hover mechanics for the hexagons and points. When encountering hexagons that would not go back to their original opacity after being hovered over, I used Claude in order to troubleshoot my issue. The LLM suggested to add the paramenter: "generateId: true" into my map.addSource sections. It also suggested adding "hoveredPointId = null;" and "hoveredHexigonId = null;" within their respective if statements, rather than after. After adding that, my web map worked as I intented.  