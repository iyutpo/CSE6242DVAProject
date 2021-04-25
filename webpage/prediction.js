
var alldata = d3.csv('./data/combined_feb21_prediction.csv');
var usmap = d3.json('./data/us.json');
var defaultGame = 'CPI';
console.log(usmap)
// enter code to define margin and dimensions for svg
var w = 1400,
    h = 700;
var margin = {top: 10, right: 100, bottom: 30, left: 30},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// enter code to create svg
svg = d3.select("div#container")
            .append("svg")
            .style("background-color","#c9e8fd")
            .attr("viewBox", "0 0 " + w + " " + h);

// enter code to create color scale
var redColors = ["#ffffe5", "#fff7bd", "#fde391", "#fdc44f", "#fb9b2a", "#ec6f15",
    "#cc4c02", '#993504', '#662606', '#332505'];
var quantileScale = d3.scaleQuantile().range(redColors);

// enter code to define tooltip
var tooltip = d3.select("body")
                .append("div")
                .style("height", "70px")
                .style("width", "240px")
                .style("position", "absolute")
                .style('visibility', 'hidden')
                .attr('id', 'tooltip')
                .style("background-color", "grey")
                .html('<div id="tipDiv">Country: </div>');

// enter code to define projection and path required for Choropleth
var projection = d3.geoAlbersUsa().translate([w/2, h/2]);
var path = d3.geoPath().projection(projection);

// define any other global variables

Promise.all([usmap, alldata]).then(
    // enter code to call ready() with required arguments
    values => (ready(null, values[0], values[1]))
);

// this function should be called once the data from files have been read
function ready(error, usmap, alldata) {
    // enter code to extract all unique metrics from alldata
    var metrics = ['CPI', 'Housing Price', 'Unemployment Rate'];


    // enter code to append the game options to the dropdown
    d3.select('#selectButton')
      .selectAll('myOptions')
      .data(metrics)
      .enter()
      .append('option')
      .text(function(d) { return d; })
      .attr('value', function(d) { return d; });

    createMapAndLegend(usmap, alldata, defaultGame);


    // event listener legend when selection changes. Call createMapAndLegend() with required arguments.
    d3.select('#selectButton').on('change', function(d) {
        createMapAndLegend(usmap, alldata, d3.select(this).node().value);
    })

    // create Choropleth with default option. Call createMapAndLegend() with required arguments.
    createMapAndLegend(usmap, alldata, defaultGame);
}

// this function should create a Choropleth and legend using the world and alldata arguments for a selectedMetric
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(usmap, alldata, selectedMetric){
    let ratingDict = {}, numUsersDict = {}, allColors = [], numOfUsers = [], usefulColors = [];

    for (let i = 0; i < usmap.features.length; i++){
                usmap.features[i].properties.CPI = [];
                usmap.features[i].properties.RE = [];
                usmap.features[i].properties.UR = [];
                usmap.features[i].properties.CPI_predict = [];
                usmap.features[i].properties.RE_predict = [];
                usmap.features[i].properties.UR_predict = [];
        for (let j = 0; j < alldata.length; j++) {
            if (usmap.features[i].properties.name === alldata[j].state) {
                usmap.features[i].properties.CPI.push(alldata[j].CPI_12mo);
                usmap.features[i].properties.RE.push(alldata[j].Re_price);
                usmap.features[i].properties.UR.push(alldata[j].Ur_rate);
                usmap.features[i].properties.CPI_predict.push(alldata[j].CPI_12mo_predict);
                usmap.features[i].properties.RE_predict.push(alldata[j].Re_price_predict);
                usmap.features[i].properties.UR_predict.push(alldata[j].Ur_rate_predict);
            }
        }
    }

    console.log('see here: ', selectedMetric, allColors, usmap.features);

    var appending = svg.selectAll('path')
                       .data(usmap.features)
    appending.enter()
             .append('path')
             .on('mouseover', function(data, i) {
                 COUNTY = data.properties.name;
                 METRIC_NAME = d3.select('#selectButton').node().value;
                 if (METRIC_NAME === 'CPI') {
                     REAL_METRIC_VALUE = data.properties.CPI;
                     PREDICT_METRIC_VALUE = data.properties.CPI_predict;
                 } else if (METRIC_NAME === 'Housing Price') {
                     REAL_METRIC_VALUE = data.properties.RE;
                     PREDICT_METRIC_VALUE = data.properties.RE_predict;
                 } else if (METRIC_NAME === 'Unemployment Rate') {
                     REAL_METRIC_VALUE = data.properties.UR;
                     PREDICT_METRIC_VALUE = data.properties.UR_predict;
                 }
                 document.getElementById('tipDiv')
                     .innerText = (
                         'County: ' + COUNTY + '\n' +
                         'Actual ' + METRIC_NAME + ' is: ' + parseFloat(REAL_METRIC_VALUE).toFixed(2) + '\n' +
                         'Predicted ' + METRIC_NAME + ' is: ' + parseFloat(PREDICT_METRIC_VALUE).toFixed(2) + '\n') +
                        'Prediction Error is: ' + (Math.abs(REAL_METRIC_VALUE - PREDICT_METRIC_VALUE)).toFixed(2);

                 tooltip.style('visibility', 'visible');
                 var tipSVG = d3.select('#tipDiv')
                                .append('svg');
                 tipSVG.append('rect')
                       .data(data)
                       .attr('fill', 'steelblue')
                       .attr("y", 10)
                       .attr("height", 30)
                       .transition()
                       .duration(100)
                       .attr("width", 100);
             })
            .on('mouseout', function(d, i, n) {
                return tooltip.style('visibility', 'hidden');
            })
            .on('mousemove', function(){
                return tooltip.style("top", (d3.event.pageY-20)+"px")
                    .style("left",(d3.event.pageX-50)+"px").style('visibility', 'visible');
            })
    appending.transition()
             .duration(200)
             .attr('d', path)
             .attr('fill', function(d, i) {
                 switch (selectedMetric) {
                     case 'CPI':
                         quantileScale.domain([0.4, 2]);
                         return d.properties.CPI ? quantileScale(d.properties.CPI) : 'grey';
                     case 'Housing Price':
                         quantileScale.domain([110000, 700000])
                         return d.properties.RE ? quantileScale(d.properties.RE) : 'grey';
                     case 'Unemployment Rate':
                         quantileScale.domain([2, 15])
                         return d.properties.UR ? quantileScale(d.properties.UR) : 'grey';
                 }}
                 )
    appending.exit().remove();
    svg.append('g')
       .attr('class', 'legendQuant')
       .attr("transform","translate("+ (width + 800) + ",20)");

    if (selectedMetric !== 'Housing Price') {
        var legend = d3.legendColor()
                   .labelFormat(d3.format('.2f'))
                   .useClass(true)
                   .shape('rect')
                   .orient('vertical')
                   .scale(quantileScale);
    } else {
        var legend = d3.legendColor()
                   .labelFormat(d3.format('c'))
                   .useClass(true)
                   .shape('rect')
                   .orient('vertical')
                   .scale(quantileScale);
    }

    svg.select('.legendQuant').call(legend);
    svg.selectAll('.swatch')
        .style('fill', function(d, i) {
            return redColors[i];
        })
}
