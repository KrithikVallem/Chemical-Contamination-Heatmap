const CONSTANTS = {
    michigan_zipcodes_geojson_url: "https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json",
};

// the geojson file is MASSIVE, so make sure to only load it one time
// not every time the user changes the map
async function get_michigan_zipcodes_geojson(url) {
    let geojson = await fetch(url);
    geojson = await geojson.json();
    return geojson;
}

async function makeChoropleth(geojson) {
    var usMap = SimpleMapD3({
        container: '#heatmap',
        data: geojson,
        tooltipOn: false,
        styles: {
          stroke: '#EDEDED',
          fill: '#232323'
        }
      });
}

async function main() {
    const geojson = await get_michigan_zipcodes_geojson(CONSTANTS.michigan_zipcodes_geojson_url);
    console.log(geojson);

    makeChoropleth(geojson);
}

main();
