//UTILITY FUNCTIONS

//random normal
function rnorm(num_samples, mean, sd) {
	var func = d3.random.normal();
	var samples = [];
	for (var i = 0; i < num_samples; i++ ){
		samples[i]=func(mean,sd);
	}
	return samples;
}

//mean
function mean(x, f){

	var n = x.length;

	var sum = 0;
	
	for (var i = 0; i < n; i++){
		sum = sum + f.call(x, x[i], i);
	}
	
	return sum / n;
}

//standard deviation - uncorrected population
function sd(x, f) {
	var n = x.length;
	if (n < 1) return NaN;
	if (n === 1) return 0;
	
	var meanX = mean(x, f);
	
	var sumOfSquares = 0;
	
	for (var i = 0; i < n; i++){
		var value = f.call(x, x[i], i);
		sumOfSquares = sumOfSquares + Math.pow(value - meanX, 2);
	}
	
	return Math.sqrt(sumOfSquares / n);
	
}

//correlation

function cor(array, f1, f2){

	var n = array.length;
	
	var meanX = mean (array, f1);
	
	var meanY = mean (array, f2);
	
	var sdX = sd(array, f1);
	
	var sdY = sd(array, f2);
	
	var sum = 0;
	for (var i = 0; i < n; i++){
		var a = (f1.call(array, array[i], i) - meanX) / sdX;
		var b = (f2.call(array, array[i], i) - meanY) / sdY;
		sum = sum + a * b;
	}

	return sum / (n-1);
}