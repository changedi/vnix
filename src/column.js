function Column(container, config, data) {
	this.container = container || "holder";// DOM node id
	this.defaults = {};
	this.defaults.width = 600;
	this.defaults.height = 400;

	this.defaults.axisStyle = {
		stroke : "#000",
		'stroke-width' : 1,
		fill : '#0ff'
	};
	this.defaults.yAxisStyle = {
			stroke : "#000",
			'stroke-width' : 1,
			fill : '#0ff'
		};
	this.defaults.axisInterval = 4;
	this.defaults.axisGridStyle = {
		stroke : "#000",
		'stroke-width' : 0.5,
		fill : '#0ff',
		'stroke-dasharray' : '. '
	};
	this.defaults.axisLabelStyle={
		fill : "#000",
		"font-size" : 14	
	};
	this.defaults.labelText = [ 'aaa', 'bbb' ];
	this.defaults.labelOffsetX = 10;
	this.defaults.labelOffsetY = 15;
	this.defaults.showDataLabel = true;
	this.defaults.showYAxis = true;
	this.defaults.labelDataStyle = {
		fill : "#000",
		"font-size" : 12
	};
	this.defaults.lineTitle = [ 'aaa', 'bbb' ];

	this.defaults.marginLeft = 40;
	this.defaults.marginBottom = 40;
	this.defaults.marginTop = 40;
	this.defaults.marginRight = 40;

	this.defaults.boxLineWidth = 2;
	
	this.defaults.rectStyle = {
		fill:"#CBF400",
		stroke:'none',
		'fill-opacity':.75
	}

	this.setConfig(config);
	this.setData(data);

	this.raphael = Raphael(container, this.defaults.width, this.defaults.height);

};

Column.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

Column.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

Column.prototype.clear = function() {
	this.raphael.clear();
};

Column.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	var conf = self.defaults;
	var R = self.raphael, 
		data = self.data, 
		axisStyle = conf.axisStyle, 
		axisInterval = conf.axisInterval, 
		axisGridStyle = conf.axisGridStyle, 
		labelOffsetX = conf.labelOffsetX,
		labelOffsetY = conf.labelOffsetY,
		labelText = conf.labelText,
		labelDataStyle = conf.labelDataStyle,
		rectStyle = conf.rectStyle,
		showDataLabel = conf.showDataLabel,
		showYAxis = conf.showYAxis,
		yAxisStyle = conf.yAxisStyle,
		axisLabelStyle = conf.axisLabelStyle,
		param = {
			stroke : "#fff",
			"stroke-width" : conf.boxLineWidth
		};

	var box = R.rect(0, 0, conf.width, conf.height).attr(param);

	var sum = 0, max = 0, min = Number.MAX_VALUE;
	for ( var i = 0; i < data.length; i++) {
		sum += data[i];
		max = data[i] > max ? data[i] : max;
		min = data[i] < min ? data[i] : min;
	}
	var avg = sum / data.length;

	var innerBox = {
		width : conf.width - conf.marginLeft - conf.marginRight,
		height : conf.height - conf.marginTop - conf.marginBottom,
		ox : conf.marginLeft,
		oy : conf.height - conf.marginBottom
	}
	var xAxis = {
		interval : innerBox.width / (data.length),
		line : line(R, innerBox.ox, innerBox.oy,
				(innerBox.ox + innerBox.width), innerBox.oy, axisStyle),
		labels:[]
	}, yAxis = {
		interval : innerBox.height / (axisInterval),
		line : function(){
						if(showYAxis){
							return line(R, innerBox.ox, innerBox.oy, innerBox.ox,
									(innerBox.oy - innerBox.height), yAxisStyle)
						}
						else
							return null
		 		}(),
		labels:[]
	};

	var xAxisGrid = {
		line : []
	};

	for ( var i = 0; i < data.length; i++) {
		var x = innerBox.ox + xAxis.interval * (i + 1), y = innerBox.oy
				- innerBox.height;
		// xAxisGrid.line[i] = line(R, x, innerBox.oy, x, y, axisGridStyle);
		xAxis.labels[i] = R.text(x - xAxis.interval / 2,
				innerBox.oy + labelOffsetX, labelText[i % labelText.length])
				.attr(axisLabelStyle);
		
	}

	var yAxisGrid = {
		line : []
	};

	var yInterval = maxDigit(max);
	// var tmp = Math.round(max/(axisInterval*yInterval));
	// if(tmp<max/(axisInterval*yInterval)){
	// 	tmp = tmp+0.5;
	// }
	var tmp = max/yInterval-Math.floor(max/yInterval);
	if(tmp<0.5){
		tmp = (0.5+Math.floor(max/yInterval))/axisInterval;
	} else{
		tmp = (1+Math.floor(max/yInterval))/axisInterval;
	}
	yInterval = tmp*yInterval;
	for ( var i = 0; i < axisInterval; i++) {
		var x = innerBox.ox, y = innerBox.oy - yAxis.interval * (i + 1);
		yAxisGrid.line[i] = line(R, x, y, x + innerBox.width, y, axisGridStyle);
		if(showYAxis){
			yAxis.labels[i] = R.text(x - labelOffsetY, y,
			 		(yInterval*(i+1)).toFixed(0)).attr(axisLabelStyle);
		}
	}

	var tooltipStyle = {
		font: '12px Helvetica, Arial', 
		fill: "#fff"
	};

	var dataRect = {
		rect:[],
		labels:[],
		tooltips:[],
		frames:[]
	},
	rectW = xAxis.interval/5*3,
	maxY = max/(yInterval*(axisInterval))*innerBox.height,
	pos,tx,ty;
	for (var i=0;i<data.length;i++){
		var rectH = data[i]/max * maxY;
		var x = innerBox.ox + xAxis.interval * (i + 1) - xAxis.interval / 2 - rectW/2;
		var y = innerBox.oy - rectH;
		dataRect.rect[i] = R.rect(x,y,rectW,rectH).attr(rectStyle);
		dataRect.labels[i] = R
		.text(
				innerBox.ox + xAxis.interval * (i + 1)
						- xAxis.interval / 2, y - 10, (data[i]/sum*100).toFixed(2)+'%')
		.attr(labelDataStyle).hide();
		if (showDataLabel) {
			dataRect.labels[i].show();
		}

		ty = innerBox.oy-rectH/2;
		if(i==data.length-1){
			pos = "left";
			tx = x;
		} else{
			pos = "right";
			tx = x+rectW;
		}
		
		var tooltips = R.set();
		tooltips.push(R.text(tx,ty,(data[i]/sum*100).toFixed(2)+'%').attr(tooltipStyle).hide());
		//tooltips.push(R.text(60,27,'bb').attr(tooltipStyle));
		var frame = R.popup(tx, ty, tooltips, pos).attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7}).hide();
		dataRect.tooltips.push(tooltips);
		dataRect.frames.push(frame);

		(function(sh,index){
			sh[0].style.cursor = "pointer";
			sh[0].onmouseover = function(){
				sh.animate({'fill-opacity':1},200);
				dataRect.frames[index].show().toFront();
				dataRect.tooltips[index][0].show().toFront();
				if(!showDataLabel)
					dataRect.labels[index].show();
			};
			sh[0].onmouseout = function(){
				sh.animate({'fill-opacity':.75},200);
				dataRect.frames[index].hide();
				dataRect.tooltips[index][0].hide();
				if(!showDataLabel)
					dataRect.labels[index].hide();
			}
		})(dataRect.rect[i],i);
		
	}

};