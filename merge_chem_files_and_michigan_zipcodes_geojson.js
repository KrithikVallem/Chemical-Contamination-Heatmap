// not finished - to do

// Set this file up so that it is future-compatible
// make it so that someone can:
// 1: run the python scripts to make all the csv's
// 2: run this script on the folder of csv's (this file is on the same level as the folder of csv's, not in the folder itself) 
//    to get a giant geojson object with the csv data now spread among zipcodes
// 3: substitue new geojson for old geojson, and heatmap will automatically update itself

/*
I think this is the best way to organize my new data:
for each zipcode in the geojson, add to the properties section - see this for an example: http://code.minnpost.com/simple-map-d3/example-data/mn-county-2010.geo.json
also can see the properties field in the actual michigan zipcodes geojson
so basically, in there, add a new field chemical_contaminants as an empty object {}
then, get names of all the chemicals, and make them fields in there, and set them to empty objects
then, get all years that data is present for aross all chemicals, and set the object to have the years as keys
and the values at those keys should be set to 0 (aka no contaminant present)
then go through all the csv's and push the rows to their appropriate positions in the geojson, setting the chemical amount as you go
example path: geojson.properties.ZCTA5CE10 = "48168"
, so geojson.properties.chemical_contaminants["1-butanol"] = { 2013:0, 2014:1.3, 2018: 999.99 }
*/

/*
This might go badly though due to the large size of the geojson file, and it might have to be reloaded every time user picks new chemical
Converting to topojson using mapshaper helps, but its still a 4mb file
also the d3 simple maps library is old and needs bower to install which may cause issues
I think the react simple maps approach is the best one
And I can make the slider stuff myself with js and event listeners
*/

const fetch = require("node-fetch");
const fs = require('fs');
const parse = require('csv-parse/lib/sync')

// folder with the csv's
const folder_name = "chem_files";

async function get_geojson() {
    let geojson = await fetch("https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/mi_michigan_zip_codes_geo.min.json");
    geojson = await geojson.json();
    return geojson;
}

function filesFunc() {
    const files = fs.readdirSync(__dirname)
    const chem_files = fs.readdirSync("chem_files")
    console.log(chem_files);
}

async function make_chemicals_json() {
    const chemicals_json = {};

    // csv's are stored in the chem_files folder
    const chem_files = fs.readdirSync(folder_name);

    // initialize each chemical_name with {}
    for (let file of chem_files) {
        // file names have the components separated by underscores
        let [ chemical_name ] = file.split("_");
        chemicals_json[chemical_name] = {};
    }
    // add the year keys to each chemical's object
    for (let file of chem_files) {
        let [ chemical_name, year ] = file.split("_");
        chemicals_json[chemical_name][year] = {};
    }


    // second pass to actually add data
    for (let file of chem_files) {
        let [ chemical_name ] = file.split("_");

        let fileContent = fs.readFileSync(`${folder_name}/${file}`, "utf-8");
        let rows = parse(fileContent, { columns: true });

        rows.forEach(row => {
            // make the variable names nicer to work with
            let {
                CollectionDate: year,
                ZIPCODE: zipcode,
                AnalyticalResultValue: value
            } = row;

            chemicals_json[chemical_name][year][zipcode] = value;
        })
    }
    console.log(chemicals_json)

    return chemicals_json;
}

async function main() {
    //filesFunc();
    const chemicals_json = make_chemicals_json();
}

main()
