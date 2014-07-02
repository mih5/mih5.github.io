
( function () {

d3.scatterplot = function() {

	//VARIABLES FOR scatterplot OBJECT
	var width = 1,
		height = 1;
	
		
	function scatterplot(g) {
		//g is an array of objects
		//if we're only plotting one scatterplot, there will be only one object in this array
		
		g.each(function(d,i) {
			//each object d in array g will have properties:
			// 	.data, the data
			//	.options, options for display
			
			var data = d.data,
				options = d.options,
				stats = calcStats(data);
				
			//initialize scales for chart
			var xScale = d3.scale.linear()
				.range([0,width])
				.domain([d3.min(data, function(d) {return d.x;} ) - 2, d3.max(data, function(d) {return d.x;} ) + 2 ]);
			
			var yScale = d3.scale.linear()
				.range([height,0])
				.domain([d3.min(data, function(d) {return d.y;} ) - 2, d3.max(data, function(d) {return d.y;} ) + 2]);
					
			function mousemove() {
				var coords = [d3.mouse(this)[0] - margin.left, d3.mouse(this)[1] - margin.top]
				cursor.attr("transform", "translate(" + coords + ")");
			}
			
			function mousedown() {
				var point = d3.mouse(this),
					datapoint = {x: xScale.invert(point[0]- margin.left), y: yScale.invert(point[1] - margin.top), color: "blue"},
					n = data.push(datapoint);	
				cursor.select("text").remove();
				updateChart(data);
			}
			
		});
		
	
	}

	//METHODS FOR scatterplot OBJECT
	
	
	return scatterplot;
};

//UTILITY FUNCTIONS

// Function for calculating all the statistics
function calcStats(data){
var slope = regressionCoefficent(data, function(d) {return d.x;}, function(d) {return d.y;});
var intercept = regressionIntercept(slope, data);
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
		stat: Math.round(correlationCalculate(data, function(d) {return d.x;}, function(d) {return d.y;})*100)/100,
		name: "your correlation",
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
function calcRegressionData (data, stats, sdX, position1, position2) {
	return [{x: (position1), y: stats[0].stat*(position1)+stats[1].stat},
			{x: (position2), y: stats[0].stat*(position2)+stats[1].stat}];
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