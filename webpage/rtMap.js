


var data = d3.csv('./data/combined_data1.csv');
const us = d3.json('./data/us-states.json');
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
var millisecondsPerDay = 24 * 60 * 60 * 1000;
var availableDays = Math.ceil((endDate - startDate) / millisecondsPerDay);

d3.select("#slider")
.attr("max", availableDays)
.on("input", function() {
    update(+this.value);
});
var niceFormat = d3.timeFormat("%B %d, %Y");
var fileFormat = d3.timeFormat("%Y-%m-%d");
d3.select("#date").text(niceFormat(startDate));

var color = d3.scaleThreshold()
                .domain([0,1])
                .range(["#fff7bc", "#662506"]);



// enter code to define projection and path required for Choropleth
Promise.all([us, data]).then(
  // enter code to call ready() with required arguments
  values => (ready(null, values[0], values[1]))
);


function update(selection) {
var currentDate = new Date(+startDate + (millisecondsPerDay * selection));
let us = d3.json('us.json');
d3.select("#date").text(niceFormat(currentDate), us);
console.log("Loading file", fileFormat(currentDate));
d3.csv("./data/" + fileFormat(currentDate) + ".csv").then(function(data) {
    ready(null, us, data);
});
}

function ready(error, data, rt) {
  console.log("ready function: ", data);

  const projection = d3.geoAlbersUsa()
                      .translate([width / 2, height / 2]) // translate to center of screen
                      .scale([1000]); // scale things down so see entire US
  const path = d3.geoPath().projection(projection);

  var stateShapes = svg.selectAll(".state")
                      .data(data.features)
                      .enter()
                      .append("path")
                      .attr("class", 'state')
                      .attr('d', path)
                        .style('fill', color(data));

  stateShapes.on('mouseover', function(d) {
    tooltip.transition()
    .duration(250)
    .style("opacity", 1);
        tooltip.html("<p><strong>" + d.properties.name + "</strong></p>")
    .style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  }).on('mouseout', function (d) {
      tooltip.transition()
            .duration(250)
            .style('opacity', 0)
  });







}