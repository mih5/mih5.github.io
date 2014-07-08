//An adapted version of Mike Bostock's box plot http://bl.ocks.org/mbostock/4061502

( function () {

d3.slider = function() {

	//VARIABLES slider OBJECT
	var width = 1,
		height = 1;
		
	function slider(g) {
		
		g.each( function(d,i) {
			
			var g = d3.select(this);
			
			var x = d3.scale.linear()
				.domain([0, 1])
				.range([0, width])
				.clamp(true);
			
			var brush = d3.svg.brush()
				.x(x)
				.extent([.5, 0])
				.on("brush", brushed)
				.on("brushend", brushended);
				
				
			function brushed() {
				var value = brush.extent()[0];
				
				if (d3.event.sourceEvent) { // not a programmatic event
					value = x.invert(d3.mouse(this)[0]);
					brush.extent([value, value]);
				}
				
				handle.transition().ease("elastic").duration(300).attr("transform", "translate(" + x(value) +"," +  2*height / 3 + ")")
				handle.select("circle").attr("r", 12);

				g.select("text.left")
					.text(
						function(d) {
							if (d==0){
								return "P(A) = "+Math.round(value*100)/100;
							}
							else if (d==1){
								return "P(C|A) = "+Math.round(value*100)/100;
							}
							else {
								return "P(C|B) = "+Math.round(value*100)/100;
							}
						}
					)
					
				g.select("text.right")
					.text(
						function(d) {
							if (d==0){
								return "P(B) = "+Math.round((1-value)*100)/100;
							}
							else if (d==1){
								return "P(D|A) = "+Math.round((1-value)*100)/100;
							}
							else {
								return "P(D|B) = "+Math.round((1-value)	*100)/100;
							}
						}
					)
				
				
			}
		
			function brushended() {
				var value = brush.extent()[0];
			
				handle.select("circle").attr("r", 9);
				
				if (d==0) {
					treeData[0].children[0].probability = value;
					treeData[0].children[1].probability = (1-value);
				}
				
				else if (d==1){
					treeData[0].children[0].children[0].probability = value;
					treeData[0].children[0].children[1].probability = (1-value);
				}
				
				else {
					treeData[0].children[1].children[0].probability = value;
					treeData[0].children[1].children[1].probability = (1-value);
				}
				
				plot.data(treeData).call(chart);
			}
		
			g.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + 2* height / 3 + ")")
				.call(d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.ticks(0)
					.tickSize(0)
					.tickPadding(12)
					)
				.select(".domain")
				.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
				.attr("class", "halo");
				
			
			var slider = g.append("g")
				.attr("class", "slider")
				.call(brush);
				
			slider.selectAll(".extent,.resize")
				.remove();
			
			slider.append("rect").attr("width",width).attr("height",height).attr("fill-opacity",0);
			
			var handle = slider.append("g")
				.attr("class", "handle")
				.attr("transform", "translate(0," +  2* height / 3 + ")")
				
			handle.append("circle").attr("r", 9);

					
			g.append("text")
				.attr("y", height/2.5)
				.attr("class", "left")
				.attr("font-size", 15)
				.attr("text-anchor", "start")
				.attr("font-family", "sans-serif")
				.text(
					function(d) {
						if (d==0){
							return "P(A) = "+0.5;
						}
						else if (d==1){
							return "P(C|A) = "+0.5;
						}
						else {
							return "P(C|B) = "+0.5;
						}
					}
					);
					
			
			g.append("text")
				.attr("y", height/2.5)
				.attr("x", width)
				.attr("class", "right")
				.attr("text-anchor", "end")
				.attr("font-size", 15)
				.attr("font-family", "sans-serif")
				.text(
					function(d) {
						if (d==0){
							return "P(B) = "+0.5;
						}
						else if (d==1){
							return "P(D|A) = "+0.5;
						}
						else {
							return "P(D|B) = "+0.5;
						}
					}
					);
			
			slider.call(brush.event);
			
		});
	
	}

	//METHODS FOR slider OBJECT
	
	slider.width = function(x) {
		if (!arguments.length) return width;
		width = x;
		return slider;
	};

	slider.height = function(x) {
		if (!arguments.length) return height;
		height = x;
		return slider;
	};
	
	return slider;
};


})();