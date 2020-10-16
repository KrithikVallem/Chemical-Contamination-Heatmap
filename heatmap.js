// original 20mb geojson for michigan zipcodes:
// https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json
// I used mapshaper.org to simplify it down to 3mb (11% simplicity) and 1mb(3% simplicity), can probably reduce even more later

// made using this article: https://blog.zingchart.com/how-to-make-a-choropleth-map/

// try making a year slider like this: https://www.zingchart.com/gallery/timeline-style-map-with-slider-input

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
  let chemicals_data = await fetch(CONSTANTS.chemicals_data_path); // maybe I should just put the json as a variable directly in this file?
  chemicals_data = await chemicals_data.json();

  // add event listeners and stuff here later for actual dropdown
  let select_btn = document.querySelector("#select_btn");
  select_btn.onclick = () => {
    let [chemical_name, year] = get_new_chemical_or_year(chemicals_data);
    let styles_json = get_heatmap_colors(chemicals_data, chemical_name, year);
    make_heatmap(styles_json, chemical_name, year);
  }
}

// this is currently just a simple number selection because I'm lazy,
// I'll make it into a nice dropdown later with the other subteam members
function get_new_chemical_or_year(chemicals_data) {
  let chemicals_msg = "Enter the number corresponding to the chemical you want data for:\n";  
  let chemical_names = Object.keys(chemicals_data);
  chemical_names.forEach((chemical, index) => {
    chemicals_msg += `${index}: ${chemical}\n`;
  })
  let chosen_chemical_num = prompt(chemicals_msg);
  let chosen_chemical = chemical_names[chosen_chemical_num];

  let years_msg = "Enter the number corresponding to the year you want data for:\n";
  let years = Object.keys(chemicals_data[chosen_chemical]);
  years.forEach((year, index) => {
    years_msg += `${index}: ${year}\n`;
  })
  let chosen_year_num = prompt(years_msg);
  let chosen_year = years[chosen_year_num];

  return [chosen_chemical, chosen_year];
}

// zingcharts does the heavy lifting, I just provide it with the data to display
// if you want to display data for a new chemical or year, modify the styles_json that is passed in
// the chemical_name and year are only passed in here to make the heatmap title, they won't change the heatmap's data
// you need to pass the new chemical_name and year into the get_heatmap_colors function to change the actual heatmap
function make_heatmap(styles_json, chemical_name, year) {
  zingchart.maps.loadGeoJSON({
    id: 'michigan_zipcodes', // Give the map an id
    url: CONSTANTS.geojson_path,
    mappings: { //Recommended. Allows you to property names from the GeoJSON file to ZingChart.
      id: 'ZCTA5CE10', // zip code property name in the geojson
      name: 'ZCTA5CE10',
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
          "title": {  
            "text": `${chemical_name} ${year}`,  
            "font-size": 16,
            "font-weight": "bold"
          }, 
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
  // convert every data value to a float from a string
  // it'll still work if everything is a string, but I want to be sure that nothing gets screwed up
  for (let key in chemical_data_in_year) {
    chemical_data_in_year[key] = parseFloat(chemical_data_in_year[key]);
  }

  let highest_contamination_value = Math.max(...Object.values(chemical_data_in_year));
  let contamination_data_pairs = Object.entries(chemical_data_in_year);

  for (let [ zipcode, value ] of contamination_data_pairs) {
    let fraction_of_highest = (value / highest_contamination_value);
    let scale = chroma.scale([CONSTANTS.colors.lowest, CONSTANTS.colors.highest]);
    let bg_color = scale(fraction_of_highest).hex();

    styles_json[zipcode] = {
      "backgroundColor": bg_color,
      "hover-state": {
        "border-color": "#e0e0e0", // todo, change this to some variable
        "border-width": 2,
        "background-color": bg_color,
      },
      "tooltip": { // the thing that shows up on hover
        "text": `${zipcode}<br>${value}`,
      }
    }
  }
  return styles_json;
}
