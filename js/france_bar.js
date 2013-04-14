
function initBar(data) {
    if( d3.select("#bar-container").selectAll('.bar').length > 0 ) d3.select("#bar-container").selectAll('.bar').remove();
    svg = d3.select("#bar-container").selectAll('.bar').data([0]).enter().append("svg")
        .attr('class', 'bar')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom).append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    data.forEach(function(d) { for (var k in d) if (k != 'NAME') d[k] = +d[k]; });

	x.domain(data.map(function(d,i) { return d.NAME; }));
	y.domain([0, 0]);
    
	svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    
    if(data.length > 50 ) xAxis.tickFormat(function(d,i) { return i%2 == 0 ? d: ''; })
    
	svg.select(".x.axis").selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", function(d) { return "translate(" + -13 + ", " + 10 + ") rotate(" + angle + ")" })

	svg.append("g").attr("class", "y axis").call(yAxis).append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6).attr("dy", ".71em")
        .attr("class", "y label")
        .style("text-anchor", "end").text("");

	svg.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar")
        .attr("x", function(d,i) { return x(d.NAME); })
        .attr("width", x.rangeBand()).attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return height - y(0) + 10; });
}

function sortX(transition) {
	var colName = field.key.replace("%d", year);
	var data = [];
	svg.selectAll(".bar").each(function(d) { data.push(d); });

	var x0 = x.domain(data.sort( !$('#sort').hasClass('toggle-off') ? //document.getElementById('sort').checked ?
	    function(a, b) { return b[colName] - a[colName]; } : function(a, b) { return d3.ascending(a.NAME, b.NAME); })
    .map(function(d) { return d.NAME; }))
    .copy();

	transition.selectAll(".bar")
        .delay(function(d, i) { return i * delay; })
        .attr("x", function(d) { return x0(d.NAME); });
    
	transition.select(".x.axis").call(xAxis).selectAll("g").delay(function(d, i) { return i * delay; });

	transition.select(".x.axis").selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", function(d) {
    		return "translate(" + -13 + ", " + 10 + ") rotate(" + angle + ")"
    	});
}

function changeY(name, transition) {

	var data = [],
        key = field.key.replace("%d", year),
        value = function(d) {
            if (!d[key]) console.log('no data for: ' + d.id);
    		else return +d[key];
    	},
        timeoutspacials = false;
        
	svg.selectAll(".bar")
        .each(function(d) { data.push(d); })
        .on('mouseover', function(d) {
        	var mouse = d3.mouse(d3.select('#map')[0][0])
    		d3.select(this).style('opacity', .8).style('stroke', color(value(d))).style('stroke-width', 1.5)
    		d3.select('#spacialcontent')
                .html((d.num > 0 ? '[' + d.num + '] ' : '') + d.NAME + ' <span class="value">(' + d[key] + ')</span> &nbsp;'
                +'<span style="color:' + color(value(d)) + '">&#9608;</span>').style('top', mouse[1] + 'px')
                .style('left', mouse[0] + 'px')
                .style('opacity', 1)
    		if (timeoutspacials) clearTimeout(timeoutspacials);
    	}).on('mouseout', function(d) {
    		d3.select(this).transition().duration(100).delay(200).style('opacity', 1).style('stroke-width', 0)
    		if (timeoutspacials) clearTimeout(timeoutspacials);
    		timeoutspacials = setTimeout(function() {
    			d3.select('#spacialcontent').transition().duration(100).style('opacity', 1e-6)
    		}, 400)
    	})
	var domain = [0, d3.max(data, function(d) { return d[name]; })];
	var y0 = y.domain(domain).copy();

	var duration = 450,
		transition = svg.transition().duration(duration),
		color = d3.scale.linear().range(colors).domain([domain[0], domain[1] / 2, domain[1]]);

	transition.selectAll(".bar").delay(function(d, i) { return i * delay; })
        .attr("y", function(d) { return y0(d[name]); })
        .attr("height", function(d) { return height - y0(d[name]) })
        .style("fill", function(d) { return color(d[name]); })
        
	setTimeout(function() { sortX(transition); }, delay * data.length);

	transition.select(".y.axis").call(yAxis).selectAll("g").delay(function(d, i) { return i * delay; });

	transition.select(".y.label").style("text-anchor", "end").text(name);

}


function resetBar() {
	var y0 = y.domain([0, 0]).copy();

	var transition = svg.transition().duration(duration),
		delay = function(d, i) {
			return i * delay;
		};

	transition.selectAll(".bar").delay(delay)
        .attr("y", function(d) { return y0(0); })
        .attr("height", function(d) { return height - y0(0) });

	transition.select(".y.axis").call(yAxis).selectAll("g").delay(delay);

	transition.select(".y.label").style("text-anchor", "end").text("");

}
