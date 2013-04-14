window.onhashchange = function() { parseHash(); };

var deferredUpdate = (function() {
    var timeout;
    return function() {
		var args = arguments;
		clearTimeout(timeout);
		stat.text("calculating...");
		return timeout = setTimeout(function() {
			update.apply(null, arguments);
		}, 10);
	};
})();


var hashish = d3.selectAll("a.hashish").datum(function() { return this.href; });
var timeouthash = false;

function parseHash() {
    var parts = location.hash.substr(1).split("/"),
		desiredFieldId = parts[0],
		desiredYear = +parts[1];

	field = fieldsById[desiredFieldId] || fields[0];
    if( parts[2] ) filename = (parts[2] == 'departements') ? 'departements' : 'regions';
    if( filename != lastfilename ) changetype();
    lastfilename = filename;
    
    years = field.years;
    year = (years.indexOf(desiredYear) > -1) ? desiredYear : years[0];
    
    changemenu();
    
    if( filename == 'departements') $('#type').removeClass('toggle-off')
    else $('#type').addClass('toggle-off')
    
	$('#dk_container_field .dk_label').html(field.name);

	if (field.id === "none") {
		$('#dk_container_year .dk_label').html('')
		reset();
		resetBar();

	} else {
		if (field.colors) colors = field.colors;

		if (field.years) {
			if (field.years.indexOf(year) === -1) year = field.years[0];
            $('#dk_container_year .dk_label').html(year);
		}
        
        if( timeouthash ) clearTimeout(timeouthash);
		timeouthash = setTimeout(function(d) {
            deferredUpdate();
            timeouthash = setTimeout(function(d) {
			    changeY(field.key.replace("%d", year), svg.transition().duration(duration))
            }, 100);
		}, 300);
        
		location.replace("#" + [field.id, year, filename].join("/"));
        
		hashish.attr("href", function(href) { return href + location.hash; });
	}
}

function changetype () { 
    if(d3.select("#bar").length > 0) d3.select("#bar").remove();
    
    mapname = filename + '.topojson',
    dataname = filename + '.txt',
    play = true,
	scaled = true,
    animating = false,
    colors = generic_color = colorbrewer.RdYlBu[3].reverse().map(function(rgb) { return d3.hsl(rgb); }),
    percent = (function() {
    	var fmt = d3.format(".2f"); 
        return function(n) { return fmt(n) + "%"; };
    })(),
	forms = {
        'departements': [
          {name: "Sélectionner", id: "none", years: []},
          {name: "Démographie > Naissance", id: "demographie_naissance", key: "demographie_naissance_%d", years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010], colors: colorbrewer.PuRd[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Divers > Bises", id: "bises", key: "bises_%d", years: [1,2,3,4,5], colors: colorbrewer.PuRd[3].map(function(rgb) { return d3.hsl(rgb); }) },
        ],
        'regions': [
          {name: "Sélectionner", id: "none", years: []},
          {name: "Démographie > Naissance", id: "demographie_naissance", key: "demographie_naissance_%d", years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010], colors: colorbrewer.PuRd[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Climat > Pluie (mm)", id: "climat_pluie", key: "climat_pluie_%d", years: [1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011], colors: colorbrewer.Blues[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Climat > Ensoleillement (h)", id: "climat_ensoleillement", key: "climat_ensoleillement_%d", years: [2010,2011], colors: colorbrewer.Oranges[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Climat > Vent (km/h)", id: "climat_vent", key: "climat_vent_%d", years: [2010,2011], colors: colorbrewer.BuGn[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Climat > Max Chaleur (°C)", id: "climat_chaleur", key: "climat_chaleur_%d", years: [2010,2011], colors: colorbrewer.Reds[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Climat > Min Chaleur (°C)", id: "climat_froid", key: "climat_froid_%d", years: [2010,2011], colors: colorbrewer.Purples[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Energie > Eoliennes", id: "energie_eolienne", key: "energie_eolienne_%d", years: [2012], colors: colorbrewer.Greens[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Energie > Eoliennes Puissance (MW)", id: "energie_puissance_eolienne", key: "energie_puissance_eolienne_%d", years: [2012], colors: colorbrewer.BuGn[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Energie > Photovoltaique", id: "energie_photovoltaique", key: "energie_photovoltaique_%d", years: [2012], colors: colorbrewer.Oranges[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Energie > Photovoltaique Puissance (MW)", id: "energie_puissance_photovoltaique", key: "energie_puissance_photovoltaique_%d", years: [2012], colors: colorbrewer.Reds[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Alcool > Consommation > 17 ans (%)", id: "alcool_jeunes", key: "alcool_jeunes_2005", years: [2005], colors: colorbrewer.BuPu[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Route > Morts", id: "route_morts", key: "route_morts", years: ['(2005-2011)'], colors: colorbrewer.Greys[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Route > Accidents", id: "route_accidents", key: "route_accidents", years: ['(2005-2011)'], colors: colorbrewer.YlOrRd[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Route > Blessés", id: "route_blesses", key: "route_blesses", years: ['(2005-2011)'], colors: colorbrewer.Greys[3].map(function(rgb) { return d3.hsl(rgb); }) },
          {name: "Route > Indemnes", id: "route_indemnes", key: "route_indemnes", years: ['(2005-2011)'], colors: colorbrewer.YlOrBr[3].map(function(rgb) { return d3.hsl(rgb); }) },
        ]
    },
	fields = forms[filename],
	years = [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, '(2005-2011)'],
	fieldsById = d3.nest().key(function(d) {
		return d.id;
	}).rollup(function(d) {
		return d[0];
	}).map(fields),
	field = fields[0],
	year = years[0],
    body = d3.select("body"),
	stat = d3.select("#status"),
    map = d3.select("#map"),
    mwidth = parseInt(d3.select("#map").style('width')),
	mheight = parseInt(d3.select("#map").style('height')),
    proj = d3.geo.albers().translate([mwidth / 2, mheight / 2]).origin([2, 46]).scale(5400 * mheight / 1060),
    path = d3.geo.path().projection(proj),
    dataById = {},
	carto = d3.cartogram().projection(proj).properties(function(d) {
		return dataById[d.id];
	}).value(function(d) {
		return +d.properties[field];
	}),
    margin = { top: 5, right: 20, bottom: 90, left: 80 },
	angle = 320,
	duration = 1200,
	delay = 20,
	width = parseInt(d3.select("#bar-container").style('width')) - margin.left - margin.right,
	height = parseInt(d3.select("#bar-container").style('height')) - margin.top - margin.bottom,
    formatPercent = d3.format(""),
	x = d3.scale.ordinal().rangeRoundBands([0, width], .1, 1),
	y = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(x).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(formatPercent),
    url = ["data", mapname].join("/");
    
    d3.json(url, function(topo) {
        topology = topo;
    	geometries = topology.objects.france.geometries;
    	path = d3.geo.path().projection(proj);
    	d3.tsv("data/" + dataname, function(data) {
    		rawData = data;
    		dataById = d3.nest()
                .key(function(d) { return d.NAME; })
                .rollup(function(d) { return d[0]; }).map(data);
            features = carto.features(topology, geometries);
    		initBar(data);
    		init();
    	});
    });
    
    changemenu()
}

function changemenu() {
    var foptions = d3.select("#field").selectAll("option").data(fields, function(d) { return d.id; })
    foptions
        .enter()
        .append("option")
            .attr("value", function(d) { return d.id; })
            .text(function(d) { return d.name; })
    foptions
        .exit().remove()
        
    var yoptions = d3.select("#year").selectAll("option").data(years, function(d) { return d; })
    yoptions
        .enter()
            .append("option")
            .attr("value", function(y) { return y; })
            .text(function(y) { return y; })
    yoptions
    .exit().remove()
    
    d3.selectAll('.dk_container').remove();
    $("select").dropkick();
}

var filename = lastfilename= 'regions';
changetype();





