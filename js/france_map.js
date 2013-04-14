
function init() {
    map = d3.select("#map");
    map.selectAll(".layer").remove();
    
    layer = map.selectAll(".layer").data([0]).enter().append("g").attr("class", "layer"),
    spacials = layer.append("g").attr("id", "spacials").attr('transform', 'translate(' + (width * .4) + ',0)').selectAll("path").data(features, function(d) { return d.id })
    
    spacials
        .enter().append("path")
        .attr("class", "spacial").attr("id", function(d, i) { return d.id; })
        .attr("fill", "black").attr("d", path)
        .on('mouseover', function(d) {
            d3.select(this).style('opacity', .8).style('stroke-width', 1.5)
            this.parentNode.appendChild(this);
        })
        .on('mouseout', function(d) {
            d3.select(this).style('opacity', 1).style('stroke-width', .5)
        })
        
    spacials.exit().remove();

	parseHash();
}

function reset() {
	stat.text("");
	body.classed("updating", false);

	features = carto.features(topology, geometries);
	path = d3.geo.path().projection(proj);

	spacials.data(features).transition().duration(duration).ease("linear").attr("fill", "gray").attr("d", path);
}

var timeoutplay = false;

function update() {
	var start = Date.now();
    
    scaled = !$('#scaled').hasClass('toggle-off');
    play = !$('#play').hasClass('toggle-off');
    animating = true;
    
	body.classed("updating", true);
    d3.select('#dk_container_year .dk_label').style('color', '#FAF23F');

    if(!field) return;

	var key = field.key.replace("%d", year),
		value = function(d) {
            if (!d.properties || !d.properties[key]) console.log('no data for: ' + d.id);
			else return +d.properties[key];
		},
		values = spacials.data().map(value).filter(function(n) {
			return !isNaN(n);
		}).sort(d3.ascending),
		lo = values[0],
		hi = values[values.length - 1];

	var color = d3.scale.linear().range(colors).domain(lo < 0 ? [lo, 0, hi] : [lo, d3.mean(values), hi]);

	if (scaled) {
		// normalize to positive numbers
		var scale = d3.scale.linear().domain([lo, hi]).range([1, 100]);

		// use scale
		carto.value(function(d) { return scale(value(d)); });
        
		// project
		features = carto(topology, geometries).features;
        
        // update the data
        spacials.data(features)
	}

	spacials.transition().duration(duration).ease("linear")
        .attr("fill", function(d) { return color(value(d)); })
        .attr("d", scaled ? carto.path : path)

	var delta = (Date.now() - start) / 1000;
	stat.text(["calculé en", delta.toFixed(1), "secondes"].join(" "));
	body.classed("updating", false);

	if (play && year < 2010) {
        if( timeoutplay ) clearTimeout(timeoutplay)
		timeoutplay = setTimeout(function() {
            year++;
            $('#dk_container_year .dk_label').html(year)
            location.replace("#" + [field.id, year, filename].join("/"));
			//location.hash = "#" + [field.id, year,filename].join("/");
			parseHash();
			//update();
			//changeY(field.key.replace("%d", year), svg.transition().duration(duration));
		}, duration + delay * values.length + 1000);
	}

	var timeoutspacials = false;
	setTimeout(function() {
		spacials.on('mouseover', function(d) {
            if( animating ) return;
			var mouse = d3.mouse(d3.select('#map')[0][0])
			d3.select(this).style('opacity', .8).style('stroke', color(value(d))).style('stroke-width', 1.5)
			d3.select('#spacialcontent')
                .html((d.properties.num > 0 ? '[' + d.properties.num + '] ' : '') + d.id + ' <span class="value">(' + d3.format(",")(d.properties[key]) + ')</span> &nbsp;'
                +'<span style="color:' + color(value(d)) + '">&#9608;</span>').style('top', mouse[1] + 'px')
                .style('left', mouse[0] + 'px')
                .style('opacity', 1)
            this.parentNode.appendChild(this);
			if (timeoutspacials) clearTimeout(timeoutspacials);
		}).on('mouseout', function(d) {
            if( animating ) return;
			d3.select(this).transition().duration(100).delay(200).style('opacity', 1).style('stroke', '#666').style('stroke-width', .5)
			if (timeoutspacials) clearTimeout(timeoutspacials);
			timeoutspacials = setTimeout(function() {
				d3.select('#spacialcontent').transition().duration(100).style('opacity', 1e-6)
			}, 400)
		})
        animating = false;
        d3.select('#dk_container_year .dk_label').transition().duration(600).style('color', 'white');
	}, duration)
}
