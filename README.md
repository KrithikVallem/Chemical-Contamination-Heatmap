# Chemical Contamination Heatmap
 Chemical Contamination Heatmap for Michigan EcoData

## todo:
* recombine the csv's for each chemical into one single csv across all years of data for that chemical
* or even have just one giant csv and load data for every chemical at once (use python to make this since the csv's don't currently have the chemical names in each row)
* actually get the heatmap working
* maybe try to find a way to have multiple chemicals on the heatmap at once?, might not work though due to color limitations

## new todo (non-plotly.js):
* First use the geojson from fetch/actual file converted to topojson (5 times smaller)
* use that geojson to make the map
* csv data is not in the json file, but I should use a python script to add it into the geojson file
* then I can simply use https://github.com/MinnPost/simple-map-d3 
* or https://d3plus.org/ 
* or https://www.anychart.com/blog/2020/05/06/javascript-choropleth-map-tutorial/
* or https://www.react-simple-maps.io/examples/usa-counties-choropleth-quantize/
* ____
* else
* first construct a map using preexisting geojson
* then use the csv's to add data and coloring to the map
