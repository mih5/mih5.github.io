//An adapted version of Mike Bostock's box plot http://bl.ocks.org/mbostock/4061502

( function () {

d3.probTree = function() {

	//VARIABLES probTree OBJECT
	var width = 1,
		height = 1,
		trunkWidth = 1,
		duration = 300;
		
	function probTree(g) {
		
		g.each( function(d,i) {
			
			//don't quite understand why g is necessary?
			
			var root = d;
		
			var g = d3.select(this);
			
			var tree = d3.layout.tree(0) 	
				.size([width, height])
				.separation(function(a,b) {return  a.parent == b.parent ? 1 : 1;});
				
			var diagonal = d3.svg.diagonal()
				.target(function(d,i) {return {x: d.target.x, y: d.target.y};})
				.source(function(d,i) {
					var sourceWidth = d.source.probability ? d.source.probability*(1-d.target.probability)*trunkWidth : (1-d.target.probability)*trunkWidth;
					if (d.source.probability){
						return d.target.name=="B" ? {x: d.source.x-sourceWidth/2, y: d.source.y} : {x: d.source.x+sourceWidth/2, y: d.source.y};
					}
					else {
						return d.target.name=="A" ? {x: d.source.x-sourceWidth/2, y: d.source.y} : {x: d.source.x+sourceWidth/2, y: d.source.y};
					}
					})
				.projection(function(d,i) { 
				return [d.x, (height-d.y)];
				});
			
			 // Compute the new tree layout.
			var nodes = tree.nodes(d).reverse(),
				links = tree.links(nodes);
				
			// Normalize for fixed-depth.
			nodes.forEach(function(d) { d.y = d.depth * height*0.5; });

			// Declare the nodes…
			var node = g.selectAll("g.node")
				.data(nodes, function(d) { return d.id || (d.id = ++i); });
				
			// Update nodes
			
			node.select(".jointProb")
				.text(function(d) { 
							if (d.parent && d.parent.probability) {
								return "P("+d.parent.name+","+d.name+") = " + Math.round(d.parent.probability*d.probability*100)/100;
							}
							else {
								return "";
							}
						}
					);


			// Enter the nodes.
			var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "translate(" + d.x + "," + (height-d.y) + ")"; });

			nodeEnter.append("circle")
				.attr("r", function(d) { return d.value	; })
				.style("fill", function(d) { return "green"});
				
			nodeEnter.append("text")
				.attr("class", "label")
				.attr("dy", ".35em")
				.text(function(d) { return d.name; })
				.style("fill-opacity", 1);
				
			nodeEnter.append("text")
				.attr("class", "jointProb")
				.attr("y", function(d) {return  d.name=="B" ? -60 : -30;})
				.text(function(d) { 
							if (d.parent && d.parent.probability) {
								return "P("+d.parent.name+","+d.name+") = " + d.parent.probability*d.probability;
							}
							else {
								return "";
							}
						}
					);

			// Declare the links…
			var link = g.selectAll("path.link")
				.data(links, function(d) { return d.target.id; });
				
			//update links
			
			link
				.transition().duration(duration)
				.style("stroke-width", function(d) {  return   (d.source.probability || d.source.probability==0)  ?  d.source.probability*d.target.probability*trunkWidth: d.target.probability*trunkWidth;} )
				.attr("d", diagonal);

			// Enter the links.
			link.enter().insert("path", "g")
				.attr("class", "link")
				.attr("fill", "none")
				.style("stroke", "brown")
				.style("stroke-width", function(d) {return   d.source.probability ?  d.source.probability*d.target.probability*trunkWidth: d.target.probability*trunkWidth;} )
				.attr("d", diagonal);
			
		});
	
	}

	//METHODS FOR probTree OBJECT
	//uses method chaining
	
	probTree.width = function(x) {
		if (!arguments.length) return width;
		width = x;
		return probTree;
	};

	probTree.height = function(x) {
		if (!arguments.length) return height;
		height = x;
		return probTree;
	};
	
	probTree.trunkWidth = function(x) {
		if (!arguments.length) return trunkWidth;
		trunkWidth = x;
		return probTree;
	};
	
	return probTree;
};


})();