var margin = {top: 20, right: 20, bottom: 20, left: 20};
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
	formatPercent = d3.format(".1%");

var svg = d3.select("#map").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

queue()
	.defer(d3.csv, "rt.csv")
	.defer(d3.json, "us.json")
	.await(ready);

var parseDate = d3.timeParse("%y-%m-%d");
var startDate = new Date("2020-01-09"),
	endDate = new Date("2021-01-26");

var legendText = ["", "10%", "", "15%", "", "20%", "", "25%"];
var legendColors = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"];


function ready(error, data, us) {
	console.log('us: ', us);
	var states = topojson.feature(us, us.objects.states);

	data.forEach(function(d) {
		d.date = new Date(d.date);
		d.mean = +d.mean;
		d.index = +d.index;
		d.median = +d.median;
	});

	var color = d3.scale.threshold()
		.domain([10, 12.5, 15, 17.5, 20, 22.5, 25])
		.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

	var projection = d3.geo.albersUsa()
		.translate([width / 2, height / 2]);

	var path = d3.geo.path()
		.projection(projection);

	var countyShapes = svg.selectAll(".county")
		.data(states.features)
		.enter()
		.append("path")
			.attr("class", "county")
			.attr("d", path);

	countyShapes
		.on("mouseover", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 1);
		})
		.on("mouseout", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 0);
		});

	svg.append("path")
		.datum(topojson.feature(us, us.objects.states, function(a, b) { return a !== b; }))
			.attr("class", "states")
			.attr("d", path);

	var legend = svg.append("g")
		.attr("id", "legend");

	var legenditem = legend.selectAll(".legenditem")
		.data(d3.range(8))
		.enter()
		.append("g")
			.attr("class", "legenditem")
			.attr("transform", function(d, i) { return "translate(" + i * 31 + ",0)"; });

	legenditem.append("rect")
		.attr("x", width - 240)
		.attr("y", -7)
		.attr("width", 30)
		.attr("height", 6)
		.attr("class", "rect")
		.style("fill", function(d, i) { return legendColors[i]; });

	legenditem.append("text")
		.attr("x", width - 240)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text(function(d, i) { return legendText[i]; });


	var x = d3.time.scale()
		.domain([new Date('2020-01-09'), new Date('2021-01-26')])
		.range([0, width])
		.clamp(true);

	dayCount = d3.timeDay.count(new Date('2020-01-09'), new Date('2021-01-26'))
	date = x.invert(slider);



	// var slider = d3.select(".slider")
	// 	.append("input")
	// 		.attr("type", "range")
	// 		.attr("min", 1996)
	// 		.attr("max", 2012)
	// 		.attr("step", 1)
	// 		.on("input", function() {
	// 			var year = this.value;
	// 			update(year);
	// 		});

	function update(year){
		slider.property("value", year);
		d3.select(".year").text(year);
		countyShapes.style("fill", function(d) {
			return color(d.properties.years[year][0].rate)
		});
	}
update(1996);


}

