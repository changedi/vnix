function Spline(container, config, data) {
	this.container = container || "holder";// DOM node id
	this.defaults = {};
	this.defaults.width = 600;
	this.defaults.height = 400;

	this.defaults.axisStyle = {
		stroke : "#FFF",
		'stroke-width' : 1,
		fill : '#0ff'
	};
	this.defaults.axisInterval = 4;
	this.defaults.axisGridStyle = {
		stroke : "#FFF",
		'stroke-width' : 0.5,
		fill : '#0ff',
		'stroke-dasharray' : '. '
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

	this.defaults.marginLeft = 40;
	this.defaults.marginBottom = 40;
	this.defaults.marginTop = 40;
	this.defaults.marginRight = 40;

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
	
	this.defaults.firstYGridOffset = 10;
	this.defaults.pointRadius = 5;

	this.setConfig(config);
	this.setData(data);
};

Spline.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

Spline.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

Spline.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	var transformDataset = function(dataSet,axis){
		var x = [];
		for(var i=0;i<dataSet.length;i++){
			x[i] = dataSet[i][axis];
		}
		return x;
	};
	
	var conf = self.defaults;
	var R = Raphael(self.container, conf.width, conf.height), 
		data = self.data, 
		axisStyle = conf.axisStyle, 
		axisInterval = conf.axisInterval, 
		axisGridStyle = conf.axisGridStyle, 
		labelOffsetX = conf.labelOffsetX,
		labelOffsetY = conf.labelOffsetY,
		labelText = conf.labelText || transformDataset(data,'x'),
		yValue = transformDataset(data,'y');
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
	for ( var i = 0; i < yValue.length; i++) {
		sum += yValue[i];
		max = yValue[i] > max ? yValue[i] : max;
		min = yValue[i] < min ? yValue[i] : min;
	}
	var avg = sum / yValue.length;

	var innerBox = {
		width : conf.width - conf.marginLeft - conf.marginRight,
		height : conf.height - conf.marginTop - conf.marginBottom,
		ox : conf.marginLeft,
		oy : conf.height - conf.marginBottom
	}
	var xAxis = {
		interval : (innerBox.width-firstYGridOffset*2) / (data.length-1),
		line : line(R, innerBox.ox, innerBox.oy,
				(innerBox.ox + innerBox.width), innerBox.oy, axisStyle),
		labels:[]
	}, yAxis = {
		interval : innerBox.height / (axisInterval + 1),
//		line : line(R, innerBox.ox, innerBox.oy, innerBox.ox,
//				(innerBox.oy - innerBox.height), axisStyle),
		labels:[]
	};

	var xAxisGrid = {
		line : []
	};

	for ( var i = 0; i < labelText.length; i++) {
		var x = (innerBox.ox+firstYGridOffset) + xAxis.interval * (i), y = innerBox.oy
				- innerBox.height;
		xAxisGrid.line[i] = line(R, x, innerBox.oy, x, y, axisGridStyle);
		xAxis.labels[i] = R.text(x, innerBox.oy + labelOffsetX,
				labelText[i % labelText.length]).attr(axisLabelStyle);
		
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
		yAxis.labels[i] = R.text(x - labelOffsetY, y,
				(yInterval*(i+1)).toFixed(0)).attr(axisLabelStyle);
	}
	
	var dataPoints = {
		points:[],
		splines:[],
		labels:[]
	},
	rectW = xAxis.interval/2,
	maxY = max/(yInterval*(axisInterval+1))*innerBox.height;
	for (var i=0;i<yValue.length;i++){
		var rectH = yValue[i]/max * maxY;
		var x = (innerBox.ox+firstYGridOffset) + xAxis.interval * (i);
		var y = innerBox.oy - rectH;
		dataPoints.points[i] = R.circle(x,y,pointRadius).attr(pointStyle);
		dataPoints.labels[i] = R
		.text(
				innerBox.ox + xAxis.interval * (i + 1)
						- xAxis.interval / 2, y - 10, yValue[i])
		.attr(labelDataStyle).hide();
		if (showDataLabel) {
			dataPoints.labels[i].show();
		}		
	}
	var points = dataPoints.points;
	var initX = (innerBox.ox+firstYGridOffset);
	var initY = innerBox.oy-yValue[0]/max * maxY;
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
		var Y0 = Math.round(innerBox.oy - Y * yValue[i - 1]),
         	X0 = Math.round(initX + xAxis.interval * (i - .5)),
         	Y2 = Math.round(innerBox.oy - Y * yValue[i + 1]),
         	X2 = Math.round(initX + xAxis.interval * (i + 1));
		var a = getAnchors(X0, Y0, sx, sy, X2, Y2);
		p = p.concat([a.x1, a.y1, sx, sy, a.x2, a.y2]);
	}
	sx = points[i].attrs.cx;
	sy = points[i].attrs.cy;
	p = p.concat([sx,sy,sx,sy]);
	var spline = R.path().attr({path:p}).attr(lineStyle).toBack();
	
	(function(sh){
		//sh[0].style.cursor = "pointer";
		var getMaxIndex = function(x){
			var maxIndex = 0,leastNear=Number.MAX_VALUE;
			for(var i=0;i<dataPoints.labels.length;i++){
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
			maxIndex = getMaxIndex(e.x);
			if(!showDataLabel){
				for(var i=0;i<dataPoints.labels.length;i++){
					if(i!=maxIndex){
						dataPoints.labels[i].hide();
						dataPoints.points[i].animate({'opacity':pointStyle['opacity'],'r':pointRadius},10);						
					} else{
						dataPoints.labels[maxIndex].show();
						dataPoints.points[i].animate({'opacity':1,'r':1.5*pointRadius},10);
					}
				}
			}
				
		};
	})(box);
};
