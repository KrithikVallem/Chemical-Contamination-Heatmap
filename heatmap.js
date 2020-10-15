// original 20mb geojson for michigan zipcodes:
// https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json
// I used mapshaper.org to simplify it down to 3mb (11% simplicity) and 1mb(3% simplicity), can probably reduce even more later

// made using this article: https://blog.zingchart.com/how-to-make-a-choropleth-map/
// 

main();

function main() {
  makeHeatmap();
}

function makeHeatmap() {
  
  zingchart.maps.loadGeoJSON({
    id: 'michigan_zipcodes', // Give the map an id
    url: "json_data_files/simplified_michigan_zipcodes_3_pct.geo.json",
    mappings: { //Recommended. Allows you to property names from the GeoJSON file to ZingChart.
      id: 'ZCTA5CE10', // zip code property name in the geojson
      name: 'ZCTA5CE10'
    },
    style: { //Optional styling options
      poly: {
        label: {
          visible: false, // hides zipcodes from appearing when page initially loads, but doesn't stop it from showing up when map is manipulated by user
        }
      }
    },
    callback: function() { // Function called when GeoJSON is loaded
        
        zingchart.render({
          id: 'heatmap',
          data: {
            "shapes": [{
              "type": "zingchart.maps", // Set shape to map type
              "options": {
                "name": "michigan_zipcodes", // Reference to the id set in loadGeoJSON()
              }
            }],
          }
        })
    }
  });
}

// async function main() {
//   const michigan_zipcodes_geojson_url = "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json";
//   const michigan_zipcodes_geojson = await get_michigan_zipcodes_geojson(michigan_zipcodes_geojson_url);

//   makeHeatmap("1,1-dichloroethane", michigan_zipcodes_geojson);
// }

// // the geojson file is MASSIVE, so make sure to only load it one time
// // not every time the user changes the map
// async function get_michigan_zipcodes_geojson(url) {
//   let geojson = await fetch(url);
//   geojson = await geojson.json();
//   return geojson;
// }
