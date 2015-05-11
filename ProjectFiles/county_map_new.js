

// Various formatters.
var formatNumber = d3.format(",d"),
  formatChange = d3.format("+,d"),
  formatDate = d3.time.format("%B %d, %Y"),
  formatTime = d3.time.format("%I:%M %p");

// data across years
var extant = [];

var width = 960,
    height = 500;

var rateById = d3.map(),
  popById = d3.map(),
  nameById = d3.map();

var quantize = d3.scale.quantize()
    .domain([0, 10000])
    // .range(['#0075B4', '#70B5DC']);
    .range(d3.range(9).map(function(i) { 
      // console.log("q" + i + "-9");
      return "q" + i + "-9"; }));

var path = d3.geo.path();

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .direction('n')
  .html(function(d) {
    return nameById.get(d.id) + "<br/>Income change: " + (rateById.get(d.id)).toFixed(0) + "" 
    // "<br/>Population change: " + (popById.get(d.id)*100).toFixed(2) + "%" 
 });
    
svg.call(tip);

var legend = d3.select("#map-legend").
  append("svg:svg").
  attr("width", 160).
  attr("height", 10)
for (var i = 0; i <= 7; i++) {
  legend.append("svg:rect").
  attr("x", i*20).
  attr("height", 10).
  attr("width", 20).
  attr("class", "q" + i + "-9 ");//color
};

var nation = crossfilter(),
  all = nation.groupAll(),
  per_cap = nation.dimension(function(d) { return d.Mortgage; }),
  per_caps = per_cap.group();
  population = nation.dimension(function(d) { return d.Bank; }),
  populations = population.group();

queue()
    .defer(d3.json, "us.json")
    .defer(d3.csv, "LatestfileforCholo.csv", function(d) {
        
      for(var propertyName in d) {
        // console.log(propertyName);
        
        if (propertyName != "State" && propertyName != 'name') {
          d[propertyName] = +d[propertyName];
        };
        
      }

      nation.add([d]);
      extant.push(d.id);

      rateById.set(d.id, d.Mortgage);
      popById.set(d.id, d);
      nameById.set(d.id, d.State);
    })
    .await(ready);

function ready(error, us) {
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("class", function(d) { return quantize(rateById.get(d.id)); })
      .attr("id", function(d) { return d.id; })
      .attr("d", path)
      .on('mouseover',tip.show)
      .on('mouseout', tip.hide)
      .on('click',update);

 function update(d){
          console.log(" -- ",popById.get(d.id));
          x= popById.get(d.id);
          cr(x);
          // bottombar(x);
           // cur = d.name;
           // updateScatterPlot(d.name ,color(d.name), pre, cur);
           // updateBarChart(d.name, color(d.name), pre, cur);
           // pre = cur;
        }

  var charts = [
      
    // barChart(true)
    //   .dimension(population)
    //   .group(populations)
    // .x(d3.scale.linear()
    //   .domain([0, 30000])
    //   .range([0, 900])),

    barChart(true)
      .dimension(per_cap)
      .group(per_caps)
    .x(d3.scale.linear()
      .domain([0, 30000])
      .range([0, 900]))

  ];

  var chart = d3.selectAll(".chart")
    .data(charts)
    .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  renderAll();

  // barChart
  function barChart(percent) {
    if (!barChart.id) barChart.id = 0;

    percent = typeof percent !== 'undefined' ? percent : false;
    // var formatAsPercentage = d3.format(".0%");
    
    var axis = d3.svg.axis().orient("bottom");
    // if (percent == true) {
      // axis.tickFormat(formatAsPercentage);}
      
    
    var margin = {top: 10, right: 10, bottom: 20, left: 10},
      x,
      y = d3.scale.linear().range([50, 0]),
      id = barChart.id++,
      brush = d3.svg.brush(),
      brushDirty,
      dimension,
      group,
      round;

    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];

      try {
        y.domain([0, group.top(1)[0].value]);
      }
      catch(err) {
        window.reset
      } 

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          div.select(".title").append("a")
              .attr("href", "javascript:reset(" + id + ")")
              .attr("class", "reset")
              .text("reset")
              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));

      var selected = [];

      dimension.filterRange(extent).top(Infinity).forEach(function(d) {
        selected.push(d.id)
      });
      svg.attr("class", "states")
        .selectAll("path")
          .attr("class", function(d) { if (selected.indexOf(d.id) >= 0) {return "q8-9"} else if (extant.indexOf(d.id) >= 0) {return "q5-9"} else {return null;}});

    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts.forEach(function (c) {
      c.filter(null);
    })
    renderAll();
    svg.attr("class", "states")
      .selectAll("path")
        .attr("class", function(d) { return quantize(rateById.get(d.id)); });
  };



  function cr(data) {
    var dats=[]
    console.log(" i am in CR");

    var arr = Object.keys(data).map(function (key) {return data[key]});
    // var arr = _.values(data)
    // var array = $.map(data, function(value, index) { return [value]; });
    // for (i=0;i <data.length; i++)
    // {
    
    // var oddArray=arr.filter(isNumeric);
    console.log(arr);
    // }
    bottombar(arr);
    // data.forEach(function(d) {
      // dats=[
      // {"name":"Mortgage", value: d.Mortgage}

      // ]
      // console.log("i am in for each");
      // console.log(" -- ",dats);
      // d.Credit card
        // d.date = parseDate(d.date);
    }    // d.value = +d.value;
    
  
  // cr(data);

function bottombar(data){

  arr = data.slice();
    data.shift();
    data.pop();
    data.pop(); 

  console.log(" i am in bottom bar",data);

  var margin = {top: 20, right: 20, bottom: 70, left: 100},
    width = 600 - margin.left - margin.right;
    // height = 300 - margin.top - margin.bottom;
  // var data= [2496, 1038, 2970, 7307, 5912, 150, 6608, 16, 270, 47, 552];
  var comp= ["Bank account ","Consumer loan","Credit card","Credit reporting","Debt collection","Money transfers"
,"Mortgage"
,"Other financial service"
,"Payday loan"
,"Prepaid card"
,"Student loan"]
// Parse the date / time
// var parseDate = d3.time.format("%Y-%m").parse;

// var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
  var x = d3.scale.linear()
     .domain([0, 10000])
     .range([0, width]);

  var bar_height= 20;
  var gap=2;
  var height = (bar_height +2*gap) * data.length;

   var  y = d3.scale.ordinal()
            .domain(d3.range(comp.length))
            // .domain(comp)
            .rangeBands([0, ((bar_height + 2 * gap) * data.length)]);
    // .rangeBands([0, height]);

// var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    // .tickFormat(d3.time.format("%Y-%m"));
labels = comp;
var yAxis = d3.svg.axis()
    .scale(y)
    // .tickValues(labels)
    .tickFormat(function (d,i) {
        console.log(comp[i]);
        return comp[i];
      }
      )
    .orient("left")
    .ticks(10);

// var svg1 = d3.select("#scatterPlot").transition();

var svg1 = d3.select("#scatterPlot")
      // .transition()
      .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// d3.csv("bar-data.csv", function(error, data) {

  console.log(" line 464 ",data);
  // x.domain([0,10]);
  // x.domain(data.map(function(d) { return d.date; }));
  // y.domain([0, d3.max(data, function(d) { return d.value; })]);
  // y.domain([0,4000])

  
  svg1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg1.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      // .text("No.of Complaints");
console.log("598",data);
console.log("598",arr);

  svg1.append("text")
        .attr("class", "title")
        .attr("x", (width + margin.left + margin.right) /2.0)
        .attr("y", -2)
        .style("text-anchor", "middle")
        .text("Number of Complaints Registered in "+arr[13]);
    


  svg1.selectAll("rect")
  // .data(function(d) { return d; })
    .data(data)
    .enter().append("rect")
    .attr("x", 0)
    .attr("y", function(d, i){
        console.log("500 ", y(i));
            return y(i);
            })
    .attr("width", function(d) {
                return x(d); })
    // .attr("y", function(d,i) { 
    //   console.log(d, " -- ",comp[i]);
    //   return comp[i]; })
    .attr("height", bar_height)
    // .attr("height", y.rangeBand())
    .style("fill","steelblue")
    .text(function(d) { 
        console.log(d);
        return d.values;}); 


// var left_width = 100;
  svg1.selectAll("text.score")
    .data(data)
    .enter().append("text")
    .attr("x", 25+ 10 / 2)
    .attr("y", function(d, i){ 
      console.log(i);
      console.log(d);
      return i*(bar_height+2*gap)+10; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "middle")
    .attr('class', 'name')
    .text(String);


  // svg.selectAll("bar")
  //     .data(data)
  //   .enter().append("rect")
  //     .style("fill", "steelblue")
  //     // .attr("x", function(d) { return x(d.date); })
  //     // .attr("width", x.rangeBand())
  //     .attr("y", function(d) { return y(d.Mortgage); })
  //     .attr("height", function(d) { return height - y(d.value); });


  



}







}