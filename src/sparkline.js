/**
 * 
 */
function Sparkline(container, config, data) {
	this.container = container || "holder";// DOM node id
	this.defaults = {};
	this.defaults.width = 100;
	this.defaults.height = 50;
	
	this.defaults.style="spline";

	this.defaults.axisStyle = {
		stroke : "#FFF",
		'stroke-width' : 1,
		fill : '#0ff'
	};
	this.defaults.axisInterval = 4;
	this.defaults.axisGridStyle = {
		stroke : "#FFF",
		'stroke-width' : 0.1,
		fill : '#0ff'
	};
	this.defaults.axisGrid2Style = {
			stroke : "#FFF",
			'stroke-width' : 0.5,
			fill : '#0ff'
		};
	this.defaults.axisLabelStyle={
		fill : "#FFFFFF",
		"font-size" : 14	
	};
	this.defaults.labelOffsetX = 10;
	this.defaults.labelOffsetY = 15;
	this.defaults.showDataLabel = true;
	this.defaults.labelDataStyle = {
		fill : "#FFFFFF",
		"font-size" : 12
	};

	this.defaults.boxLineWidth = 2;
	
	this.defaults.pointStyle = {
		fill:"#CBF400",
		stroke:'none',
		'fill-opacity':.75
	};
	this.defaults.lineStyle ={
		stroke:'#CBF400',
		'stroke-width':2
	};
	
	this.defaults.firstYGridOffset = 2;
	this.defaults.pointRadius = 5;

	this.setConfig(config);
	this.setData(data);
};

Sparkline.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

Sparkline.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

Sparkline.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	
	var conf = self.defaults;
	var R = Raphael(self.container, conf.width, conf.height), 
		style = conf.style,
		data = self.data, 
		axisStyle = conf.axisStyle, 
		axisInterval = conf.axisInterval, 
		axisGridStyle = conf.axisGridStyle, 
		axisGrid2Style = conf.axisGrid2Style,
		labelOffsetX = conf.labelOffsetX,
		labelOffsetY = conf.labelOffsetY,
		labelDataStyle = conf.labelDataStyle,
		pointStyle = conf.pointStyle,
		showDataLabel = conf.showDataLabel,
		axisLabelStyle = conf.axisLabelStyle,
		firstYGridOffset = conf.firstYGridOffset,
		pointRadius = conf.pointRadius,
		lineStyle = conf.lineStyle,
		param = {
				'fill':'#fff',
				'opacity':0,
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
		width : conf.width,
		height : conf.height,
		ox : 0,
		oy : conf.height
	}
	var xAxis = {
		interval : (innerBox.width-firstYGridOffset*2) / (data.length-1),
		line : line(R, innerBox.ox, innerBox.oy,
				(innerBox.ox + innerBox.width), innerBox.oy, axisStyle),
		labels:[]
	}, yAxis = {
		interval : innerBox.height / (axisInterval + 1),
		labels:[]
	};

	var xAxisGrid = {
		line : []
	};

	for ( var i = 0; i < data.length; i++) {
		var x = (innerBox.ox+firstYGridOffset) + xAxis.interval * (i), y = innerBox.oy
				- innerBox.height;
		xAxisGrid.line[i] = line(R, x, innerBox.oy, x, y, axisGrid2Style).hide();
		
	}

	var yAxisGrid = {
		line : []
	};

	var yInterval = maxDigit(max);
	if(yInterval==1){
		yInterval = parseInt(max / axisInterval);
	}
	for ( var i = 0; i < axisInterval; i++) {
		var x = innerBox.ox, y = innerBox.oy - yAxis.interval * (i + 1);
		yAxisGrid.line[i] = line(R, x, y, x + innerBox.width, y, axisGridStyle);
	}
	
	var dataPoints = {
		points:[],
		lines:[],
		rects:[]
	},
	rectW = xAxis.interval/2,
	maxY = max/(yInterval*(axisInterval+1))*innerBox.height;
	for (var i=0;i<data.length;i++){
		var rectH = data[i]/max * maxY;
		var x = (innerBox.ox+firstYGridOffset) + xAxis.interval * (i);
		var y = innerBox.oy - rectH;
		dataPoints.points[i] = R.circle(x,y,pointRadius).attr(pointStyle).hide();
	}
	var points = dataPoints.points;
	if(style=='spline'){
		var initX = (innerBox.ox+firstYGridOffset);
		var initY = innerBox.oy-data[0]/max * maxY;
		var Y = maxY / max;
		var p = ["M", initX, initY, "C", initX, initY];
		var getAnchors = function(p1x, p1y, p2x, p2y, p3x, p3y) {
	        var l1 = (p2x - p1x) / 2,
	        l2 = (p3x - p2x) / 2,
	        a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
	        b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
		    a = p1y < p2y ? Math.PI - a : a;
		    b = p3y < p2y ? Math.PI - b : b;
		    var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
		        dx1 = l1 * Math.sin(alpha + a),
		        dy1 = l1 * Math.cos(alpha + a),
		        dx2 = l2 * Math.sin(alpha + b),
		        dy2 = l2 * Math.cos(alpha + b);
		    return {
		        x1: p2x - dx1,
		        y1: p2y + dy1,
		        x2: p2x + dx2,
		        y2: p2y + dy2
		    };
		};
		for (var i=1;i<points.length-1;i++){
			var sx = points[i].attrs.cx;
			var sy = points[i].attrs.cy;
			var Y0 = Math.round(innerBox.oy - Y * data[i - 1]),
	         	X0 = Math.round(initX + xAxis.interval * (i - .5)),
	         	Y2 = Math.round(innerBox.oy - Y * data[i + 1]),
	         	X2 = Math.round(initX + xAxis.interval * (i + 1));
			var a = getAnchors(X0, Y0, sx, sy, X2, Y2);
			p = p.concat([a.x1, a.y1, sx, sy, a.x2, a.y2]);
		}
		sx = points[i].attrs.cx;
		sy = points[i].attrs.cy;
		p = p.concat([sx,sy,sx,sy]);
		var spline = R.path().attr({path:p}).attr(lineStyle).toBack();
	} else if(style=='line'){
		for(var i=0;i<points.length-1;i++){
			var sx = points[i].attrs.cx;
			var sy = points[i].attrs.cy;
			var tx = points[i+1].attrs.cx;
			var ty = points[i+1].attrs.cy;
			dataPoints.lines[i] = line(R,sx,sy,tx,ty,lineStyle).toBack();
		}
	} else if(style=='bar'){
		var interval = innerBox.width/data.length;
		rectW = interval/5 * 4;
		for (var i=0;i<data.length;i++){
			var rectH = data[i]/max * maxY;
			var x = (innerBox.ox) + interval * (i);
			var y = innerBox.oy - rectH;
			dataPoints.rects[i] = R.rect(x,y,rectW,rectH).attr(pointStyle);
		}
	}
	(function(sh){
		//sh[0].style.cursor = "pointer";
		var getMaxIndex = function(x){
			var maxIndex = 0,leastNear=Number.MAX_VALUE;
			for(var i=0;i<dataPoints.points.length;i++){
				var dist = Math.abs(dataPoints.points[i].attrs.cx-x);
				if(dist<leastNear){
					leastNear = dist;
					maxIndex = i;
				}
			}
			return maxIndex;
		};
		var maxIndex;
		sh[0].onmousemove = function(e){
			maxIndex = getMaxIndex(e.x-10);
			if(!showDataLabel){
				for(var i=0;i<dataPoints.points.length;i++){
					if(i!=maxIndex){
						xAxisGrid.line[i].hide();
						dataPoints.points[i].animate({'opacity':pointStyle['opacity'],'r':pointRadius},10);						
					} else{
						if(style!='bar'){
							xAxisGrid.line[i].show();
						}
						dataPoints.points[i].animate({'opacity':1,'r':1.5*pointRadius},10);
					}
				}
			}
				
		};
	})(box);
};