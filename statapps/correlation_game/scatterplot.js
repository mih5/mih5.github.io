
( function () {

d3.scatterplot = function() {

	//VARIABLES FOR scatterplot OBJECT
	var width = 1,
		height = 1
		// functions for calculating data
		regression = calcRegressionData,
		duration = 600,
		targetCorrelation = 0.5;
	
		
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
				stats = calcStats(data, targetCorrelation),
				position1 = d3.min(data, function(d) {return d.x;} ) - stats[4].stat,
				position2 = d3.max(data, function(d) {return d.x;} ) + stats[4].stat
				position3 = d3.min(data, function(d) {return d.y;} ) - stats[5].stat
				position4 = d3.max(data, function(d) {return d.y;} ) + stats[5].stat;
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
			stats = calcStats(data, targetCorrelation);
			
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
			
			var statData = [stats[7],stats[6],stats[8]];
			
			
			var regressionData =  [options[0] ? calcRegressionData(data, stats, position1, position2)[0] : [],
									options[1] ? calcRegressionData(data, stats, position1, position2)[2] : [],
									options[2] ? calcRegressionData(data, stats, position1, position2)[1] : []];
			
	
			
				
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
					.attr("stroke-dasharray",function(d,i) {return i==0 ? "5,5" : "1,0"});
		
					
			
			//---------------------STATISTICS DISPLAY----------------------------------------
			
			g.select(".statBox").remove();
			
			var statBox = g.append("g").attr("transform", "translate(230,-15)").attr("class","statBox");
			
			statBox.append("rect")
				.attr("height", 35)
				.attr("width", width-220)
				.attr("fill", "white")
				.attr("fill-opacity", 0.5);
			
			statBox.select("rect").attr("height", 15*3+5);
			
			//DATA JOIN
			var statDisplayPlot = statBox.selectAll(".statDisplayPlot").data(statData);
			
			//UPDATE
			statDisplayPlot
				.text(function(d) { return d.name+":	"+Math.round(d.stat*100)/100;});
			
			//ENTER
			statDisplayPlot.enter()
					.append("text")
						.attr("class","statDisplayPlot")
						.attr("x",width-220)
						.attr("y", function(d, i) {return i*15+15;})
						.attr("text-anchor", "end")
						.attr("fill", function(d) {return d.color;})
						.attr("font-family", "Arial, sans-serif")
						.text(function(d) { return d.name+": "+Math.round(d.stat*100)/100;});
			
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
				.attr("class", "axis")
				.attr("font-family","Arial,sans-serif")
				.attr("font-size",20)
				.attr("x", width)
				.attr("y", height-5)
				.style("text-anchor", "end")
				.text("X");
			
			g.append("text")
				.attr("class", "axis")
				.attr("font-family","Arial,sans-serif")
				.attr("font-size",20)
				.attr("x",0)
				.attr("y",20)
				.attr("transform", "rotate(-90)")
				.style("text-anchor","end")
				.text("Y");
			
			
			//---------------------------WIN CONDITION-----------------------------------
			
			var condition = Math.abs(stats[6].stat-stats[7].stat)<0.075 ? [true] : [];
			
			var winScreen = g.selectAll(".winScreen").data(condition);
			
			winScreen.exit().remove();
			
			var winScreenEnter = winScreen.enter()
				.append("g")
				.attr("class","winScreen");
			
			winScreenEnter.append("rect")
					.attr("x",-margin.left)
					.attr("y",-margin.top)
					.attr("width",width+margin.left+margin.right)
					.attr("height",height+margin.top+margin.bottom)
					.attr("fill","white")
					.attr("fill-opacity", 0)
					.transition().duration(duration*3)
					.attr("fill-opacity",0.9); 
					
			winScreenEnter.append("text")
				.attr("y",height/2)
				.attr("x",width/2)
				.attr("text-anchor","middle")
				.text("You got it!")
				.attr("font-family","sans-serif")
				.attr("font-size", 20);
					
			
			
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
	
	scatterplot.targetCorrelation = function(x) {
		if (!arguments.length) return targetCorrelation;
		targetCorrelation = x;
		return scatterplot;
	};
	
	
	return scatterplot;
};

//UTILITY FUNCTIONS

// Function for calculating all the statistics
function calcStats(data, targetCorrelation){
var slope = regressionCoefficent(data, function(d) {return d.x;}, function(d) {return d.y;}),
	intercept = regressionIntercept(slope, data),
	corr = correlationCalculate(data, function(d) {return d.x;}, function(d) {return d.y;});
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
		name: "your correlation",
		color:  Math.abs(corr-targetCorrelation)<0.15 ? (Math.abs(corr-targetCorrelation)<0.075 ? "green" : "#FF9900") : "red"
		},
		{
		stat: targetCorrelation,
		name: "target correlation",
		color: "black"
		},
		{
		stat: (25-difficulty*10)-iter,
		name: "moves left",
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
				[ {x: (position1), y: stats[3].stat-(slope * (stats[2].stat-position1))},
				{x: (position2), y: stats[3].stat-(slope * (stats[2].stat-position2))}
				],
				[ {x: (position1), y: stats[3].stat},
				{x: (position2), y: stats[3].stat}
				],
				[ {x: stats[2].stat, y: position3},
				{x: stats[2].stat, y: position4}
				]
			];
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