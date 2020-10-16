// original 20mb geojson for michigan zipcodes:
// https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json
// I used mapshaper.org to simplify it down to 3mb (11% simplicity) and 1mb(3% simplicity), can probably reduce even more later

// made using this article: https://blog.zingchart.com/how-to-make-a-choropleth-map/

const CONSTANTS = {
  geojson_path: "json_data_files/simplified_michigan_zipcodes_3_pct.geo.json",
  chemicals_data_path: "json_data_files/chemicals_data.json",
  colors: { // any css-compatible colors work here, but the chroma color scales can be found at https://colorbrewer2.org/
    lowest: chroma.brewer.PuRd[0], // used for default map background (0 contaminants found)
    highest: chroma.brewer.PuRd[chroma.brewer.PuRd.length - 1], // used for the highest contaminant amount across all zipcodes
    border: chroma.brewer.PuRd[1],
  }
}

main();

async function main() {
  // load the chemicals data once, not every time the map is regenerated
  let chemicals_data = await fetch(CONSTANTS.chemicals_data_path);
  chemicals_data = await chemicals_data.json();

  // add event listeners and stuff here later
  let chemical_name = "HAA5";
  let year = "2018";

  let styles_json = get_heatmap_colors(chemicals_data, chemical_name, year);
  make_heatmap(styles_json);
}

// zingcharts does the heavy lifting, I just provide it with the data to display
function make_heatmap(styles_json) {
  zingchart.maps.loadGeoJSON({
    id: 'michigan_zipcodes', // Give the map an id
    url: CONSTANTS.geojson_path,
    mappings: { //Recommended. Allows you to property names from the GeoJSON file to ZingChart.
      id: 'ZCTA5CE10', // zip code property name in the geojson
      name: 'ZCTA5CE10'
    },
    width: "100%",
    height: "100%",
    style: { //Optional styling options
      poly: {
        label: {
          visible: false,
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
              //"scale": true, // turned this off since it makes it slower
              "style": {
                items: styles_json,
                backgroundColor: CONSTANTS.colors.lowest,
                borderColor: CONSTANTS.colors.border,
                "label": {
                  visible: false,
                }
              },
            }
          }],
        }
      })
    }
  });
}

// makes the json object that zingcharts needs to color the data into the choropleth map
// chroma.js is used to display the color of each data point on a scale between
// the lowest and highest color based on the ratio between each value
// and the highest data value for this specific chemical and year
function get_heatmap_colors(chemicals_data, chemical_name, year) {
  let styles_json = {};

  let chemical_data_in_year = chemicals_data[chemical_name][year];
  let highest_contamination_value = Math.max(...Object.values(chemical_data_in_year));
  let contamination_data_pairs = Object.entries(chemical_data_in_year);

  for (let [ zipcode, value ] of contamination_data_pairs) {
    let fraction_of_highest = (value / highest_contamination_value);
    let scale = chroma.scale([CONSTANTS.colors.lowest, CONSTANTS.colors.highest]);
    let bg_color = scale(fraction_of_highest).hex();

    styles_json[zipcode] = {
      "backgroundColor": bg_color,
      "hover-state": {
        "border-color": "#e0e0e0",
        "border-width": 2,
        "background-color": bg_color,
      },
      "tooltip": {
        "text": `${zipcode}<br>${value}`,
      }
    }
  }
  return styles_json;
}
