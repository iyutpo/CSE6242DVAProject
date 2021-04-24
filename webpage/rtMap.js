var data = d3.csv('./data/combined_data1.csv');
var us = d3.json('./data/us-states.json');
console.log(data, us);
tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

var width = 960;
var height = 500;
var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

var startDate = new Date("2020-01-01");
var endDate = new Date("2021-01-26");

var lowColor = '#f9f9f9'
var highColor = '#bc2a66'

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Load in my states data!
d3.csv("./data/combined_data1.csv"). then(function(data) {
    // console.log(data, typeof(data));
	var rtMeans = [];
	data.forEach(function (d) {
	    rtMeans.push(parseFloat(d.Rt_mean));
    });

    console.log(rtMeans);

    // Load GeoJSON data and merge with states data
    d3.json("./data/us-states.json").then(function(json) {
        svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style('fill', 'black')


    });
});
















