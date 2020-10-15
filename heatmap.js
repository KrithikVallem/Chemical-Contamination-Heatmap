// geojson for michigan zipcodes:
// https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json
main();

async function main() {
  const michigan_zipcodes_geojson_url = "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json";
  const michigan_zipcodes_geojson = await get_michigan_zipcodes_geojson(michigan_zipcodes_geojson_url);

  makeHeatmap("1,1-dichloroethane", michigan_zipcodes_geojson);
}

// the geojson file is MASSIVE, so make sure to only load it one time
// not every time the user changes the map
async function get_michigan_zipcodes_geojson(url) {
  let geojson = await fetch(url);
  geojson = await geojson.json();
  return geojson;
}
