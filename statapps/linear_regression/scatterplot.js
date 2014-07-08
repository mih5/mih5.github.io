
( function () {

d3.scatterplot = function() {

	//VARIABLES FOR scatterplot OBJECT
	var width = 1,
		height = 1
		// functions for calculating data
		regression = calcRegressionData,
		residuals = calcResidualData
		duration = 600;
	
		
	function scatterplot(g) {
		//g is an array of objects
		//if we're only plotting one scatterplot, there will be only one object in this array
		
		g.each(function(d,i) {
			
			// ---------------DATA-------------------------------
			// each object d in array g will have properties:
			// 	.data, the data
			//	.options, options for display
			var data = d.data,
				options = d.options,
				stats = calcStats(data),
				position1 = d3.min(data, function(d) {return d.x;} ) - stats[4].stat,
				position2 = d3.max(data, function(d) {return d.x;} ) + stats[4].stat;
			//---------------------------------------------------

			//initialize scales for chart
			
			var xScale = d3.scale.linear()
				.range([0,width])
				.domain([d3.min(data, function(d) {return d.x;} ) - stats[4].stat, d3.max(data, function(d) {return d.x;} ) + stats[4].stat ]);
			
			var yScale = d3.scale.linear()
				.range([height,0])
				.domain([d3.min(data, function(d) {return d.y;} ) - stats[5].stat, d3.max(data, function(d) {return d.y;} ) + stats[5].stat]);
					
					
			
			if (d.newPoints) {
				
				var stuff= d.newPoints.map(function(d) {return {x: xScale.invert(d.x), y: yScale.invert(d.y), color: "blue"};});
				data = data.concat(stuff);
			}			
			
			//update statistics
			stats = calcStats(data);
			
			var line = d3.svg.line()
				.x(function(d) { return xScale(d.x); })
				.y(function(d) { return yScale(d.y); })
				.interpolate("linear");

			//define X axis
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");
			  
			//define Y axis
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left");
			
			//----------------------CALCULATE THE DATA---------------------------------
			
			var statData = [stats[1],stats[0]];
			
			if (options[1]) {
				var residualData = calcResidualData(data, stats);
				statData.push(stats[7]);
			}
			else {
				var residualData = [];
			}
			
			if (options[0]){
				if (options[2]){
					var regressionData = calcRegressionData(data, stats, position1, position2);
					statData.push(stats[4],stats[5],stats[6]);
				}
				else{
					var regressionData = [calcRegressionData(data, stats, position1, position2)[0]];
				}
			}
			else {
				if (options [2]){
					var regressionData = [[],calcRegressionData(data, stats, position1, position2)[1]];
					statData.push(stats[4],stats[5],stats[6]);
				}
				else{
					var regressionData = [];
				}
			}
			
			
				
			//---------------------SCATTERPLOT POINTS---------------------------------
			
			//DATA JOIN
			var points = g.selectAll(".points").data(data);

			//UPDATE
			points.transition().duration(duration)
				.attr("transform",function(d){return "translate("+xScale(d.x)+","+yScale(d.y)+")";});
				
			//EXIT 
			points.exit().remove();
			
			//ENTER
			points.enter().append("g")
					.attr("class","points")
					.attr("transform",function(d){return "translate("+xScale(d.x)+","+yScale(d.y)+")";})
				.append("circle")
					.attr("fill",function(d) {return d.color})
					.attr("fill-opacity",0)
					.attr("r",0)
				.transition().ease("elastic").duration(duration)
					.attr("fill-opacity",0.5)
					.attr("r",5);
			
			//----------------------REGRESSION LINE-----------------------------------
			
			// DATA JOIN
			// regressionData is passed to the .data method as an array so that .enter() gives each path the two points
			var regressionLine = g.selectAll(".regressionLine").data(regressionData);
			
			regressionLine.exit().remove();
			
			//UPDATE
			regressionLine.transition().ease("elastic").duration(duration).attr("d",line);
			
			// ENTER
			regressionLine
					.enter()
				.append("path")
					.attr("class","regressionLine")
					.attr("d", line).attr("stroke","steelblue")
					.attr("stroke-width",1.5)
					.attr("stroke-dasharray", function(d,i) {return i==0 ? "1, 0": "5, 5"});
			
			//----------------------RESIDUAL LINES-----------------------------------------
			
			//DATA JOIN
			var residualLines = g.selectAll(".residuals").data(residualData);
			
			//UPDATE
			residualLines.transition().ease("elastic").duration(duration).attr("d",line);
			
			//EXIT
			residualLines.exit().remove();
			
			//ENTER
			residualLines.enter().append("path")
					.attr("class", "residuals")
					.attr("d", line)
					.attr("stroke","steelblue")
					.attr("stroke-width",1.5)
					.attr("fill-opacity",0)
					.transition().duration(duration)
					.attr("fill-opacity",1);
				
					
			
			//---------------------STATISTICS DISPLAY----------------------------------------
			
			
			g.select(".statBox").remove();
			
			var statBox = g.append("g").attr("transform", "translate(270,-15)").attr("class","statBox");
			
			statBox.append("rect")
				.attr("height", 35)
				.attr("width", 150)
				.attr("fill", "white")
				.attr("fill-opacity", 0.5);
			
			statBox.select("rect").attr("height", 15*statData.length+5);
			
			//DATA JOIN
			var statDisplayPlot = statBox.selectAll(".statDisplayPlot").data(statData);
			
			//UPDATE
			statDisplayPlot.text(function(d) { return d.name+":	"+Math.round(d.stat*100)/100;});
			
			//ENTER
			statDisplayPlot.enter()
					.append("text")
						.attr("class","statDisplayPlot")
						.attr("x",125)
						.attr("y", function(d, i) {return i*15+15;})
						.attr("text-anchor", "end")
						.attr("font-family", "Arial, sans-serif")
						.text(function(d) { return d.name+":	"+Math.round(d.stat*100)/100;});
			
			//----------------------AXES---------------------------------------------------
			
			//Remove previous axes
			g.selectAll(".axis").remove();
			
			//Create X axis
			g.append("g")
				.attr("class","axis")
				.attr("transform", "translate(0," + height + ")")
				.transition()
				.duration(duration)
				.call(xAxis);
			
			//Create Y axis
			g.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0,0)")
				.transition()
				.duration(duration)
				.call(yAxis);		
				
				
			g.append("text")
				.attr("font-family","Arial,sans-serif")
				.attr("font-size",20)
				.attr("class","axis")
				.attr("x", width)
				.attr("y", height-5)
				.style("text-anchor", "end")
				.text("X");
			
			g.append("text")
				.attr("font-family","Arial,sans-serif")
				.attr("font-size",20)
				.attr("class","axis")
				.attr("x",0)
				.attr("y",20)
				.attr("transform", "rotate(-90)")
				.style("text-anchor","end")
				.text("Y");
			
			
		});
		
	
	}

	//METHODS FOR scatterplot OBJECT
	
	scatterplot.width = function(x) {
		if (!arguments.length) return width;
		width = x;
		return scatterplot;
	};

	scatterplot.height = function(x) {
		if (!arguments.length) return height;
		height = x;
		return scatterplot;
	};
	
	
	return scatterplot;
};

//UTILITY FUNCTIONS

// Function for calculating all the statistics
function calcStats(data){
var slope = regressionCoefficent(data, function(d) {return d.x;}, function(d) {return d.y;});
var intercept = regressionIntercept(slope, data);
var corr = correlationCalculate(data, function(d) {return d.x;}, function(d) {return d.y;});
return [
		{
		stat: slope,
		name: "slope",
		color: "#FF0000"
		},
		{
		stat: intercept,
		name: "intercept",
		color: "black"
		},
		{
		stat: Math.round(mean(data, function(d) {return d.x;})*100)/100,
		name: "mean of X",
		color: "black"
		},
		{
		stat: Math.round(mean(data, function(d) {return d.y;})*100)/100,
		name: "mean of Y",
		color: "black"
		},
		{
		stat: Math.round(sd(data, function(d) {return d.x;} )*100)/100,
		name: "SD of X",
		color: "black"
		},
		{
		stat: Math.round(sd(data, function(d) {return d.y;} )*100)/100,
		name: "SD of Y",
		color: "black"
		},
		{
		stat: Math.round(corr*100)/100,
		name: "correlation",
		color: "black"
		},
		{
		stat: Math.round(Math.pow(corr,2)*100)/100,
		name: "R-squared",
		color: "black"
		}
	];
}

// A function which calculates Pearson's corrected population SD
function sd(x, f) {
	var n = x.length;
	if (n < 1) return NaN;
	if (n === 1) return 0;
	
	var meanX = mean(x, f);
	
	var sumOfSquares = 0;
	
	for (var i = 0; i < n; i++){
		var value = f.call(x, x[i], i);
		sumOfSquares = sumOfSquares + Math.pow((value - meanX), 2);
	}
	
	return Math.sqrt(sumOfSquares / (n-1));
	
}

//A function which calculates the mean
function mean(array, f){
	var n = array.length;
	var sum = 0;
	for (var i = 0; i < n; i++){
		sum = sum + f.call(array, array[i], i);
	}
	return sum / n;
}

//uses http://mathworld.wolfram.com/LeastSquaresFitting.html

//A function which calculates the regression coefficient
function regressionCoefficent (array, f1, f2){
	var n = array.length;
	var SS_XX = 0;
	for (var i = 0; i < n; i++){
		SS_XX = SS_XX + Math.pow(f1.call(array, array[i], i),2);
	}
	SS_XX = SS_XX - n * Math.pow(mean(array, f1),2);
	var SS_XY = 0;
	for (var i = 0; i < n; i++){
		SS_XY = SS_XY + (f1.call(array, array[i], i))*(f2.call(array, array[i], i));
	}
	SS_XY = SS_XY - n*(mean(array, f1))*(mean(array,f2));
	return SS_XY/SS_XX;
}

//A function which calculates the intercept of a regression line
function regressionIntercept (coefficient,data){
			return mean(data, function(d) {return d.y;})-coefficient*mean(data, function(d) {return d.x;});
}

// A function which calculates the endpoints of the regression line
function calcRegressionData (data, stats, position1, position2) {
	var slope = stats[5].stat/stats[4].stat*(stats[6].stat && stats[6].stat / Math.abs(stats[6].stat));
	return [
				[{x: (position1), y: stats[0].stat*(position1)+stats[1].stat},
				{x: (position2), y: stats[0].stat*(position2)+stats[1].stat}],
				[ {x: (position1), y: stats[3].stat-(slope * (stats[2].stat-position1))},
				{x: (position2), y: stats[3].stat-(slope * (stats[2].stat-position2))}
				]
			];
}

// A function which calculates the endpoints of the residuals
function calcResidualData (data, stats){
	var n = data.length;
	var dataArray = [];
	for (var i = 0; i < n; i++){
		var segment = [{x: data[i].x, y: data[i].y}, {x: data[i].x, y: stats[0].stat*data[i].x + stats[1].stat}];
		dataArray.push(segment);
	}
	return dataArray;
}

// A function which calculates the correlation
function correlationCalculate(array, f1, f2){
	var n = array.length;
	var meanX = mean (array, f1);
	var meanY = mean (array, f2);
	var sdX = sd(array, f1);
	var sdY = sd(array, f2);
	var sum = 0;
	for (var i = 0; i < n; i++){
		var a = (f1.call(array, array[i], i) - meanX) / sdX;
		var b = (f2.call(array, array[i], i) - meanY) / sdY;
		sum = sum + (a * b);
	}

	return sum / (n-1);
}

})();