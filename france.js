
    var filename = 'departements',
        mapname = filename+'.topojson',
        dataname = filename+'.csv',
        play = false;

    if (!document.createElementNS) document.getElementsByTagName("form")[0].style.display = "none";

    window.onhashchange = function() { parseHash(); };

	var colors = generic_color = colorbrewer.RdYlBu[3].reverse().map(function(rgb) { return d3.hsl(rgb); });

    var percent = (function() {
          var fmt = d3.format(".2f");
          return function(n) { return fmt(n) + "%"; };
        })(),
        forms = {
            'departements': [
              {name: "Explorer les départements", id: "none"},
              {name: "Demographie > Naissance", id: "demographie_naissance", key: "demographie_naissance_%d", years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010], colors: colorbrewer.PuRd[3].map(function(rgb) { return d3.hsl(rgb); }) },
            ],
            'regions': [
              {name: "Explorer les régions", id: "none"},
              {name: "Demographie > Naissance", id: "demographie_naissance", key: "demographie_naissance_%d", years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010], colors: colorbrewer.PuRd[3].map(function(rgb) { return d3.hsl(rgb); }) },
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
        years = [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,'(2005-2011)'],
        fieldsById = d3.nest().key(function(d) { return d.id; }).rollup(function(d) { return d[0]; }).map(fields),
        field = fields[0],
        year = years[0];

    var body = d3.select("body"),
        stat = d3.select("#status");

    var fieldSelect = d3.select("#field")
      .on("change", function(e) {
        //play = false;
        field = fields[this.selectedIndex];
        location.hash = "#" + [field.id, year].join("/");
      });

    fieldSelect.selectAll("option")
      .data(fields)
      .enter()
      .append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.name; });

    var yearSelect = d3.select("#year")
      .on("change", function(e) {
        year = years[this.selectedIndex];
        location.hash = "#" + [field.id, year].join("/");
      });

    yearSelect.selectAll("option")
      .data(years)
      .enter()
      .append("option")
        .attr("value", function(y) { return y; })
        .text(function(y) { return y; });

    var map = d3.select("#map");
    var mwidth = parseInt(d3.select("#map").style('width')),
        mheight = parseInt(d3.select("#map").style('height'));
    /* v3
        var proj = d3.geo.albers()
        .center([0, 46])
        //.origin([0, 46])
        .rotate([2, 0])
        .parallels([50, 60])
        .scale(2600)
        .translate([width / 2, height / 2]);*/
    var proj = d3.geo.albers().translate([mwidth / 2, mheight / 2]).origin([2,46]).scale(5400*mheight/1060);
    //var proj = d3.geo.mercator().translate([mwidth / 2, mheight / 2])//.origin([2,46]).scale(5400*mheight/1060);
    var path = d3.geo.path().projection(proj);
    
    var topology,
        geometries,
        rawData,
        dataById = {},
        value = function(d) {
            if( !d.properties || !d.properties[key] ) console.log('no data for: '+d.id);
            else return +d.properties[key];
          },
        carto = d3.cartogram()
          .projection(proj)
          .properties(function(d) {
            return dataById[d.id];
          })
          .value(function(d) {
            return +d.properties[field];
          });

    var margin = {top: 5, right: 20, bottom: 90, left: 80},
        angle = 320,
        duration = 750,
        delay = 20,
        width = parseInt(d3.select("#bar").style('width')) - margin.left - margin.right,
        height = parseInt(d3.select("#bar").style('height')) - margin.top - margin.bottom,
        themap;    
    
    var layer = map.append("g").attr("id", "layer"),
        spacial = layer.append("g").attr("id", "spacial")
            .attr('transform', 'translate('+(width*.4)+',0)')
            .selectAll("path");

    
    var formatPercent = d3.format(""),
        x = d3.scale.ordinal().rangeRoundBands([0, width], .1, 1),
        y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formatPercent);

    var svg = d3.select("#bar").append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var url = ["data", mapname].join("/");
    
    d3.json(url, function(topo) {
      topology = topo;
      geometries = topology.objects.france.geometries;
      d3.csv("data/"+dataname, function(data) {
        rawData = data;
        dataById = d3.nest().key(function(d) { return d.NAME; }).rollup(function(d) { return d[0]; }).map(data);
        initBar(data);
        init();
      });
    });

    function init() {
      var features = carto.features(topology, geometries),
          path = d3.geo.path()
            .projection(proj);

      spacial = spacial.data(features)
        .enter()
        .append("path")
          .attr("class", "region")
          .attr("id", function(d,i) { return d.id; })
          .attr("fill", "black")
          .attr("d", path);

      spacial.append("title");

      parseHash();
      
      over();
    }

    function reset() {
      stat.text("");
      body.classed("updating", false);

      var features = carto.features(topology, geometries),
          path = d3.geo.path()
            .projection(proj);

      spacial.data(features)
        .transition()
          .duration(duration)
          .ease("linear")
          .attr("fill", "gray")
          .attr("d", path);

      spacial.select("title")
        .text(function(d,i) { return d.id; });

    }
    
    function over() {
        setTimeout(function() {
          spacial
            .on('mouseover', function(d) {
                d3.select(this)
                    .style('opacity', .8)
                    .style('stroke', color(value(d)))
                    .style('stroke-width', 1.5)
                d3.select('#spacialcontent').html(d.id+(d.properties.num>0?' ['+d.properties.num+']':''));
            })
            .on('mouseout', function(d) {
                d3.select(this).transition().duration(100).delay(200)
                    .style('opacity', 1)
                    .style('stroke', '#666')
                    .style('stroke-width', .5)
            })
      }, duration)
    }

    function update() {
      var start = Date.now();
      
      body.classed("updating", true);

      var key = field.key.replace("%d", year),
          fmt = (typeof field.format === "function")
            ? field.format
            : d3.format(field.format || ","),
          values = spacial.data()
            .map(value)
            .filter(function(n) {
              return !isNaN(n);
            })
            .sort(d3.ascending),
          lo = values[0],
          hi = values[values.length - 1];

      var color = d3.scale.linear()
        .range(colors)
        .domain(lo < 0
          ? [lo, 0, hi]
          : [lo, d3.mean(values), hi]);

      // normalize the scale to positive numbers
      var scale = d3.scale.linear()
        .domain([lo, hi])
        // was range([1, 1000])
        .range([1, 100]);

      // tell the cartogram to use the scaled values
      carto.value(function(d) { return scale(value(d)); });

      // generate the new features, pre-projected
      var features = carto(topology, geometries).features;
    
      // update the data
      spacial.data(features)
        .select("title")
          .text(function(d,i) {
            return [d.id, fmt(value(d))].join(": ");
          });

      spacial.transition()
        .duration(duration)
        .ease("linear")
        .attr("fill", function(d) {
          return color(value(d));
        })
        .attr("d", carto.path)
      
      var delta = (Date.now() - start) / 1000;
      stat.text(["calculé en", delta.toFixed(1), "secondes"].join(" "));
      body.classed("updating", false);
      
      if( play && year < 2010 ) {
          year++;
          //yearSelect.selectAll("option").attr("disabled", "disabled")
          yearSelect.property("selectedIndex", years.indexOf(year)).attr("disabled", null);
          
          setTimeout(function() {
              //location.hash = "#" + [field.id, year].join("/");
              //parseHash();
              update();
              changeY(field.key.replace("%d", year),svg.transition().duration(duration));
          }, duration+delay*values.length);
      }
      
      over();
    }

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

    var hashish = d3.selectAll("a.hashish")
      .datum(function() {
        return this.href;
      });

    function parseHash() {
      var parts = location.hash.substr(1).split("/"),
          desiredFieldId = parts[0],
          desiredYear = +parts[1];

      field = fieldsById[desiredFieldId] || fields[0];
      year = (years.indexOf(desiredYear) > -1) ? desiredYear : years[0];

      fieldSelect.property("selectedIndex", fields.indexOf(field));

      if (field.id === "none") {
        yearSelect.attr("disabled", "disabled");
        reset();
        resetBar();
        
      } else {
		if( field.colors ) colors = field.colors;
		
        if (field.years) {
          if (field.years.indexOf(year) === -1) year = field.years[0];
          yearSelect.selectAll("option").attr("disabled", function(y) { return (field.years.indexOf(y) === -1) ? "disabled" : null; });
        } 
        else yearSelect.selectAll("option").attr("disabled", null);

        yearSelect.property("selectedIndex", years.indexOf(year)).attr("disabled", null);

        deferredUpdate();
        //changeY(field.key.replace("%d", year))
        setTimeout(function(d) { changeY(field.key.replace("%d", year), svg.transition().duration(duration)) }, 100);
        location.replace("#" + [field.id, year].join("/"));

        hashish.attr("href", function(href) { return href + location.hash; });
      }
    }

    function initBar(data){
        
        data.forEach(function(d) { for( var k in d ) if( k != 'NAME' ) d[k] = +d[k]; });
        
        x.domain(data.map(function(d) { return d.NAME; }));
        y.domain([0, 0]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.selectAll("text")
            .style("text-anchor","end")
            .attr("transform", function(d) { return "translate(" + -13 + ", " + 10 + ") rotate("+angle+")" });

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .attr("class","y label")
            .style("text-anchor", "end")
            .text("");

        svg.selectAll(".bar")
            .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.NAME); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(0); })
            .attr("height", function(d) { return height - y(0); });

        d3.select("input").on("change", function() { sortX(svg.transition().duration(duration)); });

    /*
      var sortTimeout = setTimeout(function() {
        d3.select("input").property("checked", true).each(change);
      }, 2000);
    */

    }
      function sortX(transition) {
        //clearTimeout(sortTimeout);

        var colName = field.key.replace("%d", year);
        var data = [];
        svg.selectAll(".bar").each(function(d){data.push(d);});

        var x0 = x.domain(data.sort(document.getElementById('check').checked
            ? function(a, b) { return b[colName] - a[colName]; }
            : function(a, b) { return d3.ascending(a.NAME, b.NAME); })
            .map(function(d) { return d.NAME; }))
            .copy();

        transition.selectAll(".bar")
            .delay(function(d, i) { return i * delay; })
            .attr("x", function(d) { return x0(d.NAME); });

        transition.select(".x.axis")
            .call(xAxis)
          .selectAll("g")
            .delay(function(d, i) { return i * delay; });

        transition.select(".x.axis").selectAll("text")
          .style("text-anchor","end")
          .attr("transform", function(d) { return "translate(" + -13 + ", " + 10 + ") rotate("+angle+")" });
      }

      function changeY(colNames, transition) {

        var data = [];
        
        svg.selectAll(".bar").each(function(d){data.push(d);});
        var domain = [0, d3.max(data, function(d) { return d[colNames]; })];
        var y0 = y.domain(domain).copy();

        var duration = 450,
            transition = svg.transition().duration(duration),
            delay = function(d, i) { return i * delay; },
            color = d3.scale.linear().range(colors).domain([domain[0], domain[1]/2, domain[1]]);

        transition.selectAll(".bar")
            .delay(delay)
            .attr("y", function(d) { return y0(d[colNames]); })
            .attr("height", function(d) { return height - y0(d[colNames])})
            .style("fill", function(d) { return color(d[colNames]); })
            //.transition().delay(function(d,i) { return delay(d,i)+duration; }).("end", sortX);
        
        setTimeout(function() { sortX(transition); }, delay*data.length);
        
        transition.select(".y.axis")
            .call(yAxis)
          .selectAll("g")
            .delay(delay);

         transition.select(".y.label")
          .style("text-anchor", "end")
          .text(colNames);

      }


      function resetBar() {
        var y0 =  y.domain([0, 0]).copy();

        var transition = svg.transition().duration(duration),
            delay = function(d, i) { return i * delay; };

        transition.selectAll(".bar")
            .delay(delay)
            .attr("y", function(d) { return y0(0); })
            .attr("height", function(d) { return height - y0(0)});

        transition.select(".y.axis")
            .call(yAxis)
          .selectAll("g")
            .delay(delay)
            ;

         transition.select(".y.label")
           .style("text-anchor", "end")
          .text("");

      }

