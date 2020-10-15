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

async function makeHeatmap(chemical_name, geojson) {
  // the csv url is hardcoded for now, will be changed to be dynamic later
  let csv = `${chemical_name}.csv`; // currently its the data for every year of 1,1-dichlorethene
  
  // have plotly parse the csv file into a js array of objects, then pass a callback to operate on it
  Plotly.d3.csv(csv, function(err, rows) {
    // if you wanted to filter out specific chemical names from a giant combined csv, you would do it here
      
    // a frame is each "image"/static state of the animation
    // slider_steps is what goes at each step of the slider ??
    let frames = [], slider_steps = [];

    // make a frame and slider step for each row in the data
    for (let row of rows) {
      // unpack the row object into nicely named variables
      let {
        CollectionDate: year,
        ZIPCODE: zipcode,
        AnalyticalResultValue: value,
      } = row;

      // add a frame to frames
      frames.push({
        name: year,
        data: [{ year, zipcode, value, text: zipcode}],
      });

      // add a slider step to slider_steps
      slider_steps.push({
        label: year.toString(),
        method: "animate",
        args: [[year], {
            mode: "immediate",
            transition: {duration: 300},
            frame: {duration: 300}
          }
        ]
      });
    }

    // initial data to display when map first loads
    let data = {
      type: 'choropleth',
      locationmode: 'geojson-id',
      geojson: geojson,
      featureidkey: "properties.ZCTA5CE10", // name of the zipcode field in the geojson
      locations: frames[0].data[0].zipcode,
      text: frames[0].data[0].zipcode,
      zauto: false,
      zmin: 30,
      zmax: 90
    };
console.log(geojson)

    // how you want the map to look (+ buttons and slider and all that, basically just all the html stuff)
    let layout = {
      title: 'World Life Expectency<br>1952 - 2007',
      geo:{
          scope: 'world',
          countrycolor: 'rgb(255, 255, 255)',
          showland: true,
          landcolor: 'rgb(217, 217, 217)',
          showlakes: true,
          lakecolor: 'rgb(255, 255, 255)',
          subunitcolor: 'rgb(255, 255, 255)',
          lonaxis: {},
          lataxis: {}
      },

      // controls the buttons to manage the slider animation
      updatemenus: [{
        x: 0.1,
        y: 0,
        yanchor: "top",
        xanchor: "right",
        showactive: false,
        direction: "left",
        type: "buttons",
        pad: {"t": 87, "r": 10},
        buttons: [{
          method: "animate",
          args: [null, {
            fromcurrent: true,
            transition: {
              duration: 200,
            },
            frame: {
              duration: 500
            }
          }],
          label: "Play"
        }, {
          method: "animate",
          args: [
            [null],
            {
              mode: "immediate",
              transition: {
                duration: 0
              },
              frame: {
                duration: 0
              }
            }
          ],
          label: "Pause"
        }]
      }],

      // this controls the actual slider
      sliders: [{
        active: 0,
        steps: slider_steps,
        x: 0.1,
        len: 0.9,
        xanchor: "left",
        y: 0,
        yanchor: "top",
        pad: {t: 50, b: 10},
        currentvalue: {
          visible: true,
          prefix: "Year:",
          xanchor: "right",
          font: {
            size: 20,
            color: "#666"
          }
        },
        transition: {
          duration: 300,
          easing: "cubic-in-out"
        }
      }]
    };

    // create the actual heatmap and attach it to the webpage
    Plotly.newPlot('heatmap', data, layout).then(function() {
      Plotly.addFrames('heatmap', frames);
    });
  })
}
