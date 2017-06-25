function setupScanAnimation() {
	var svgObj = d3.select(".scan-file-animation")
	                                    .attr("width", 50)
	                                    .attr("height", 50);

    for (var i = 1; i < 6; i++) {
		var rect = svgObj.append("rect")
					.attr("x", 0)
					.attr("y", 6 * i)
					.attr("width", 0)
					.attr("height", 5)
					.transition()
					.duration(1000)
					.attr("width", 50)
					.delay(1000 * i)
							.transition()
							.duration(500)
							.attr("width", 0)
							.delay(6000)
					.each("end", repeatScanAnimation)
	}

}

function resetScanAnimation() {
	$(".scan-file-animation").empty();
}

function repeatScanAnimation() {
	resetScanAnimation();
	setupScanAnimation();
}

function setupFlowAnimation() {
	var svgObj = d3.select(".scan-flow-animation")
	                                    .attr("width", 50)
	                                    .attr("height", 50);

	var lineData = [ { "x": 25,   "y": 0}, { "x": 25,  "y": 25}, { "x": 0,  "y": 50},
						{ "x": 25,  "y": 25}, { "x": 25,  "y": 50}, { "x": 25,  "y": 25},
						{ "x": 50,  "y": 50}];

	//This is the accessor function we talked about above
	var lineFunction = d3.svg.line()
	                         .x(function(d) { return d.x; })
	                         .y(function(d) { return d.y; })
	                         .interpolate("linear");

	var lineGraph = svgObj.append("path")
	                            .attr("d", lineFunction(lineData))
	                            .attr("stroke", "#000")
	                            .attr("stroke-width", 2)
	                            .attr("fill", "none");

    var marker = svgObj.append("circle")
        .style("opacity", 0)
        .attr("class", "marker")
        .attr("fill", "#000")
        .attr("r", "3")

    marker
        .transition()
        .style("opacity", 1)
        .transition()
        .duration(2000)
        .attrTween("transform", translateAlong(lineGraph.node()))
        .transition()
        .style("opacity", 0)
		.each("end", repeatFlowAnimation)
}

function repeatFlowAnimation() {
	resetFlowAnimation();
	setupFlowAnimation();
}

function resetFlowAnimation() {
	$(".scan-flow-animation").empty();
}

function translateAlong(path) {
    var l = path.getTotalLength();
    return function(i) {
        return function(t) {
            var p = path.getPointAtLength(t * l);
            return "translate(" + p.x + "," + p.y + ")";//Move marker
        }
    }
}

// Get path start point for placing marker
function pathStartPoint(path) {
    var d = path.attr("d"),
    dsplitted = d.split(" ");
    return dsplitted[1];
}