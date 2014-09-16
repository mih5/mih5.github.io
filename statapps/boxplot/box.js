//An adapted version of Mike Bostock's box plot http://bl.ocks.org/mbostock/4061502

( function () {

d3.box = function() {

	//VARIABLES FOR BOX OBJECT
	var width = 1,
		height = 1,
		domain = null,
		value = Number,
		duration = 600,
		//whiskers, the function whiskers
		//when d3.box is initialized, .whisker method sets the following variable whiskers
		//to iqr(1.5)
		whiskers = boxWhiskers,
		//quartiles, the function boxQuartiles
		quartiles = boxQuartiles,
		cdf = empiricalCDF;
	
		
	function box(g) {
		//g is what?
		
		g.each(function(d,i) {
			//what is .each?
			//d.map(value) coerces elements of d to number
			d = d.map(value).sort(d3.ascending);
			var g = d3.select(this),
				n = d.length,
				min = d[0]-1.5,
				max = d[n - 1]+1.5;
			
			//Compute quartiles 
			var quartileData = d.quartiles = quartiles(d);
			
			// Compute whiskers. Must return exactly 2 elements, or null.
			// Call function whiskers
			var whiskerIndices = whiskers && whiskers.call(this, d, i),
			  whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });
			
			// Compute outliers. If no whiskers are specified, all data are "outliers".
			// We compute the outliers as indices, so that we can join across transitions!
			var outlierIndices = whiskerIndices
				? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
				: d3.range(n);			
				
			// Compute the new x-scale.
			var x1 = d3.scale.linear()
				.domain(domain && domain.call(this, d, i) || [min, max])
				.range([0, width]);
			
			// Retrieve the old x-scale, if this is an update.
			// either retrieve the old chart, or make a new scale, if this is the first time
			var x0 = this.__chart__ || d3.scale.linear()
				.domain([0, Infinity])
				.range(x1.range());

			// Stash the new scale, so we can access it later
			this.__chart__ = x1;
			
			//Histogram display
			var histData = d3.layout.histogram().bins(x1.ticks(20))(d);
			
			//compute new y-scale
			var y1 = d3.scale.linear()
				.range([height,2*height/3])
				.domain([0, d3.max(histData, function(d) { return d.y; })]);
				
			// HISTOGRAM BARS
		
			var bar = g.selectAll(".bar")
				.data(histData);
			
			bar.enter().insert("rect")
					.attr("class","bar")
					.attr("x", function(d) {return x1(d.x);})
					.attr("y", height)
					.attr("width", x1(histData[0].dx+min) - 1)
					.attr("height", function(d) { return 0; })
				.transition().duration(duration)
					.attr("y", function(d) {return y1(d.y);})
					.attr("height", function(d) { return height - y1(d.y); });
					
			bar.transition().duration(duration)
				.attr("x", function(d) {return x1(d.x);})
				.attr("width", x1(histData[0].dx+min) - 1)
				.attr("y", function(d) {return y1(d.y);})
				.attr("height", function(d) { return height - y1(d.y); });
				
			bar.exit().remove();
			
			// CENTER LINE
			
			//data join
			var center = g.selectAll("rect.center")
				.data(whiskerData ? [whiskerData] : []);
			
			//update
			center.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", function(d) {return x1(d[0]);})
				.attr("width", function(d) {return x1(d[1]-d[0]+min);});
			
			//enter
		
			center.enter().append("rect")
				.attr("class","center")
				//NOTE! take care not to write ".center"
				.attr("x", function(d) {return x1(d[0]);})
				.attr("y", height/3)
				.attr("height", 1)
				.attr("width", function(d) {return x1(d[1]-d[0]+min);})
				.style("opacity", 1e-6)
				.transition()
				  .duration(duration)
				  .style("opacity", 1);
			
			//exit
			center.exit().transition()
				.duration(duration)
				.style("opacity", 1e-6)
				.remove();
			
			// INTERQUARTILE RANGE BOX
			
			var IQbox = g.selectAll("rect.box")
				.data([quartileData]);
				
			IQbox.enter().append("rect")
				.attr("class","box")
				.attr("x", function(d) {return x1(d[0]);})
				.attr("y", height/6)
				.attr("height", height/3)
				.attr("width", function(d) {return x1(d[2]-d[0]+min);});
				
			IQbox.transition()
				.duration(duration)
				.attr("x", function(d) {return x1(d[0]);})
				.attr("width", function(d) {return x1(d[2]-d[0]+min);});
			
			// MEDIAN LINE
			
			var median = g.selectAll("rect.median")
				.data([quartileData]);

			// update
			
			median.transition().duration(duration)
				.attr("x", function(d) {return x1(d[1]);});
				
			// enter
			median.enter().append("rect")
				.attr("class","median")
				.attr("x", function(d) {return x1(d[1]);})
				.attr("y", height/6)
				.attr("height", height/3)
				.attr("width" ,1);
				
			// WHISKERS
			var whisker = g.selectAll("rect.whisker")
				.data(whiskerData || []);

			whisker.enter().append("rect")
					.attr("class", "whisker")
					.attr("x", function(d) {return x1(d);})
					.attr("y", height/6)
					.attr("height", height/3)
					.attr("width", 1)
					.style("opacity", 1e-6)
				.transition()
					.duration(duration)
					.style("opacity", 1);

			whisker.transition()
				.duration(duration)
					.attr("x", function(d) {return x1(d);})
					//.attr("y", height/4)
					.attr("height", height/3)
					.attr("width", 1)
				.style("opacity", 1);

			whisker.exit().transition()
				.duration(duration)
				.style("opacity", 1e-6)
				.remove();

			//OUTLIERS
			
			// Update outliers.
			
			var outlier = g.selectAll("circle.outlier")
				.data(outlierIndices, Number);

			outlier.enter().insert("circle")
				.attr("class", "outlier")
				.attr("r", 5)
				.attr("cx", function(i) { return x0(d[i]); } )
				.attr("cy", height/3)
				.style("opacity", 1e-6)
				.transition()
				  .duration(duration)
				  .attr("cx", function(i) { return x1(d[i]); })
				  .style("opacity", 1);

			outlier.transition()
				  .duration(duration)
				  .attr("cx", function(i) { return x1(d[i]); })
				  .style("opacity", 1);

			outlier.exit().transition()
				.duration(duration)
				.style("opacity", 1e-6)
				  .remove();
				  
			
			// Compute the tick format.
			//this leverages the formatting provided by d3's linear scales
			var format = x1.tickFormat(30);

			// Update box ticks.
			var boxTick = g.selectAll("text.box")
				.data(quartileData);

			boxTick.enter().append("text")
				.attr("class", "box")
				.attr("x", function(d) {return x1(d);})
				.attr("y", height/3)
				//bitwise AND "&"
				.attr("dy", function(d,i) {return i & 1 ? -(height/6+5) : (height/6+15);})
				.attr("text-anchor", "middle")
				.text(function(d,i) {return ["","",""][i] +" "+format(d);});

			boxTick.transition()
				.duration(duration)
				.text(function(d,i) {return ["","",""][i] +" "+format(d);})
				.attr("x", function(d) {return x1(d);});
					
					
			//WHISKER TICKS
			var whiskerTick = g.selectAll("text.whisker")
				.data(whiskerData || []);

			whiskerTick.enter().append("text")
				.attr("class", "whisker")
				.attr("x", function(d) {return x1(d);})
				.attr("y", height/3)
				//bitwise AND "&"
				.attr("dy", -(height/6+5))
				.attr("text-anchor", "middle")
				.text(format);

			whiskerTick.transition()
				.duration(duration)
				.text(format)
				.attr("x", function(d) {return x1(d);});

			whiskerTick.exit().transition()
				.duration(duration)
				.style("opacity", 1e-6)
				.remove();
					
			// AXIS
			
			g.selectAll(".axis").data([]).exit().remove();
			
			//define X axis
			var xAxis = d3.svg.axis()
				.scale(x1)
				.orient("bottom");
			
			g.append("g")
				.attr("class","axis")
				.attr("transform", "translate(0," + height + ")")
				.transition()
				.duration(duration)
				.call(xAxis);
				

			
			//------------------QUANTILE DISPLAY---------------
			
			var quantileDisplay = g.selectAll(".quantileDisplay").data([true]);
			
			quantileDisplay.text(0+"% shaded");
			
			quantileDisplay.enter().append("text")
				.attr("class","quantileDisplay")
				.attr("x",45)
				.attr("y", 3.5*height/4)
				.text(0+"% shaded");
			
			// -----------------HIGHLIGHT---------------------
			
			
			var svg = d3.select(this.parentNode).on("mousemove", mousemove);
			
			function mousemove() {
				var coords = d3.mouse(this)[0];
				chartline.attr("width", width-coords);
				quantileDisplay.text( Math.round(cdf(x1.invert(coords-margin.left),d)*10000)/100 +"% shaded" );
			}
			
			svg.select(".cursor").remove();
			
			var chartline = svg.append("rect")
				.attr("width", 500)
				.attr("height", height/2-20)
				.attr("transform","translate("+ width + "," + (margin.top+height/2+20) + ")"+" scale(" + -1 + "," + 1 + ")")
				.attr("class", "cursor");

		
		});
		
	
	}

	//METHODS FOR BOX OBJECT
	
	box.width = function(x) {
		if (!arguments.length) return width;
		width = x;
		return box;
	};

	box.height = function(x) {
		if (!arguments.length) return height;
		height = x;
		return box;
	};
	
	box.whiskers = function(x) {
		if (!arguments.length) return whiskers;
		whiskers = x;
		return box;
	};
	
	return box;
};

function boxWhiskers(d) {
  return [0, d.length - 1];
}

function boxQuartiles(d) {
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}


//empirical CDF
function empiricalCDF(quantile, dataValues){
	var n = dataValues.length;
	var count = 0;
	for (i = 0; i < n; i++){
		if (dataValues[i] < quantile){
			count ++;
		}
	}
return count/n;
}


})();