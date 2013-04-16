function Bubble(container, config, data) {
	this.container = container || "holder";// DOM node id
	this.defaults = {};
	this.defaults.width = 600;
	this.defaults.height = 400;
	this.defaults.centerX = 300;
	this.defaults.centerY = 300;
	this.defaults.radius = 30;
	this.defaults.lineWidth = 30;
	this.defaults.lineColor = [];
	this.defaults.labelTextStyle = {
		stroke : "#FFFFFF",
		"font-size" : 14
	};
	this.defaults.labelText = [ 'aaa', 'bbb' ];
	this.defaults.labelOffset = 10;
	this.defaults.labelDataStyle = {
		fill : "#FFFFFF",
		"font-size" : 14
	}; 
	this.defaults.lineTitle = [ 'aaa', 'bbb' ];
	
	this.defaults.marginLeft = 40;
	this.defaults.marginBottom = 40;
	this.defaults.marginTop = 40;
	this.defaults.marginRight = 40;
	
	this.defaults.minRadius = 20;
	this.defaults.maxRadius = 80;	
	
	this.defaults.boxLineWidth = 2;

	this.setConfig(config);
	this.setData(data);
};

Bubble.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

Bubble.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

Bubble.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	var conf = self.defaults;
	var R = Raphael(self.container, conf.width, conf.height), 
		r = conf.radius, 
		data = self.data, 
		colors = conf.lineColor, 
		ox = 0, 
		oy = 0, 
		offset = conf.labelOffset,
		param = {
			stroke : "#fff",
			"stroke-width" : conf.boxLineWidth
		};

	var box = R.rect(0, 0, conf.width, conf.height).attr(param);

	var sum = 0,max = 0;
	for(var i=0;i<data.length;i++){
		sum += data[i];
		max = data[i]>max?data[i]:max;
	}
	var avg = sum/data.length;
	
	var circles = [], bg_circles = [], data_labels = [], categories = [];
	var xStart = conf.marginLeft,
		xEnd	= conf.marginRight,
		xAxis = {
			interval : (conf.width-xStart-xEnd) / (data.length>1?(data.length-1):1),
			length: conf.width-xStart-xEnd
		},
		yStart = conf.marginTop,
		yEnd = conf.marginBottom,
		yAxis = {
			interval : (conf.width-yStart-yEnd) / (data.length>1?(data.length-1):1),
			length: conf.height-yStart-yEnd
		},
		color;
	for ( var i = 0; i < data.length; i++) {
		ox = xAxis.interval * i + xStart;
		oy = yAxis.length - data[i]/max * yAxis.length+yStart+yEnd;
		r = (data[i]/avg) * conf.radius;
		if(r<conf.minRadius)
			r = conf.minRadius;
		else if(r>conf.maxRadius)
			r = conf.maxRadius;
		
		color = colors[i%colors.length]||"hsb(".concat(Math.round(r) / 200, ",", data[i]/(sum-data[i]),
					", .75)");
		bg_circles[i] = R.circle(ox,oy,r)
							.attr({fill:color,
									'stroke-width':3,
										'fill-opacity':1,
											stroke:'#aaa'}).data("index",i).hide();
		circles[i] = R.circle(ox, oy, r)
						.attr({fill:color,
								'stroke-width':0,
									'fill-opacity':.85}).data("index",i).toFront();
		data_labels[i] = R.text(ox, oy-r-offset, data[i])
							.attr(conf.labelDataStyle)
								.hide();
		categories[i] = R.text(ox, oy, conf.labelText[i%conf.labelText.length])
							.attr(conf.labelTextStyle).data("index",i);
		categories[i].mouseover(function(){
			bg_circles[this.data('index')].show().toFront();
			data_labels[this.data('index')].show().toFront();
			categories[this.data('index')].show().toFront();
		});
		circles[i].mouseover(function(){
			bg_circles[this.data('index')].show().toFront();
			data_labels[this.data('index')].show().toFront();
			categories[this.data('index')].show().toFront();
		});
		bg_circles[i].mouseout(function(){
			this.hide();
			data_labels[this.data('index')].hide();
		})
	}

};