// 0. this is an example of an animated chloropleth map from the plotly.js documentation
// I'm using this as an example to figure out how to make the EcoData map thing work

// 1. import the csv and pass a callback
Plotly.d3.csv("https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv", function(err, rows){

  function filter_and_unpack(rows, key, year) {
  return rows.filter(row => row['year'] == year).map(row => row[key])
  }

  // 2. set up slider years (11 total years starting from 1952 and 5 year gaps between each frame)
  var frames = []
  var slider_steps = []

  var n = 11;
  var num = 1952;
  for (var i = 0; i <= n; i++) {
    // 3. make sure the data is in the correct format (get only the items with the same year and with the given key)
    var z = filter_and_unpack(rows, 'lifeExp', num)
    var locations = filter_and_unpack(rows, 'iso_alpha', num)
    // 4. fill up the frames and slider steps arrays with the neccesary data in the form of objects 
    // text might be the hover text ??
    frames[i] = {data: [{z: z, locations: locations, text: locations}], name: num}
    slider_steps.push ({
        label: num.toString(),
        method: "animate",
        args: [[num], {
            mode: "immediate",
            transition: {duration: 300},
            frame: {duration: 300}
          }
        ]
      })
    // 5. there are 5 year gaps between each slider step (1952 -> 1957)
    num = num + 5
  }

// 6. tell plotly the data to expect to make the map
var data = [{
      type: 'choropleth',
      locationmode: 'world',
      locations: frames[0].data[0].locations,
      z: frames[0].data[0].z,
      text: frames[0].data[0].locations,
      zauto: false,
      zmin: 30,
      zmax: 90

}];
// 7. set up the html for the map, specifically the geography of the map itself (this may be where to pass in the geojson)
var layout = {
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
    // 9. this controls the buttons to manage the slider
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
    // 10. this controls the actual slider
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

// 11. attach map to website
Plotly.newPlot('heatmap', data, layout).then(function() {
    Plotly.addFrames('heatmap', frames);
  });
})
