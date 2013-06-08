function Radar(container, config, data) {
	this.container = container || "holder";// DOM node id
	this.defaults = {};
	this.defaults.width = 300;
	this.defaults.height = 300;
	this.defaults.boxStyle = {
		"stroke-width":1
	};
	this.defaults.axisNum = 4;
	this.defaults.centerX = 150;
	this.defaults.centerY = 130;
	this.defaults.maxRadius = 120;
	this.defaults.axisStyle = {
		'stroke-width':0.5
	};
	this.defaults.showAxisMark = true;
	this.defaults.axisMarkOffset = 10;
	this.defaults.axisRayStyle = {
		'stroke-width':0.2
	};
	this.defaults.labelOffset = 30;

	this.defaults.labelText = ['白羊', '金牛', '♊双子','巨蟹','狮子','处女',
	'天秤','天蝎','射手','摩羯','水瓶','双鱼'];
	this.defaults.labelStyle = {
		'stroke':'none',
		'font-size':12,
		'font-family':'Wingdings "MS Gothic"'
	};
	this.defaults.pointRadius = 3;
	this.defaults.pointStyle = {
		fill : '#468BE6',
		'stroke' : 'none'
	}
	this.defaults.pointLineStyle = {
		'stroke-width':0.4
	};
	this.defaults.dataLabelStyle = {
		'stroke':'none',
		'fill':'#468BE6',
		'font-size':12
	};
	this.defaults.dataLabelOffset = 8;
	this.defaults.animFactor = 1.2;

	this.defaults.rotateDeg = 15;

	this.setConfig(config);
	this.setData(data);
	
	this.raphael = Raphael(container, this.defaults.width, this.defaults.height);

};

Radar.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

Radar.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

Radar.prototype.clear = function() {
	this.raphael.clear();
};

Radar.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	var conf = self.defaults;
	var R = this.raphael,
		data = self.data,
		boxStyle = conf.boxStyle,
		axisNum = conf.axisNum,
		ox = conf.centerX,
		oy = conf.centerY,
		maxR = conf.maxRadius,
		axisStyle = conf.axisStyle,
		axisRayStyle = conf.axisRayStyle,
		axisLabels = conf.labelText,
		labelStyle = conf.labelStyle,
		pointRadius = conf.pointRadius,
		pointStyle = conf.pointStyle,
		pointLineStyle = conf.pointLineStyle,
		rotateDeg = conf.rotateDeg,
		rayX,
		rayY,
		r,
		offset = conf.labelOffset,
		animFactor = conf.animFactor,
		dataLabelStyle = conf.dataLabelStyle,
		dataLabelOffset = conf.dataLabelOffset,
		showAxisMark = conf.showAxisMark,
		axisMarkOffset = conf.axisMarkOffset;

	var box = R.rect(0, 0, conf.width, conf.height)
				.attr(boxStyle);
	var sum = 0,max = 0, min = Number.MAX_VALUE;
	for(var i=0;i<data.length;i++){
		sum += data[i];
		max = data[i]>max?data[i]:max;
		min = data[i]<min?data[i]:min;
	}
	var avg = sum/data.length;
	
	var axis = {
		interval:maxR/axisNum,
		data:[],
		label :[]
	};
	for(var i = 0;i<axisNum;i++){
		r = i * axis.interval;
		var circle = R.circle(ox,oy,r==0?1:r)
						.attr(axisStyle);
		axis.data.push(circle);
		if(showAxisMark&&r>0){
			var rectW = 20, rectH = 10;
			var axisMarkBack = R.rect(ox-rectW/2,oy-r+axisMarkOffset - rectH/2,rectW,rectH)
								.attr({'stroke':'none','fill':'#ddd'});
			var axisMark = R.text(ox,oy-r+axisMarkOffset,(max/sum*100 / axisNum * (i+1)).toFixed(0)+"%");
		}
	}

	var axisRay = {
			length:r + offset/2,
			data:[]
		},
		alpha = Math.PI / 6;
	for(var i=0;i<data.length;i++){
		rayX = ox + axisRay.length * Math.sin(alpha * (i+1));
		rayY = oy - axisRay.length * Math.cos(alpha * (i+1));
		var ray = R.path("M"+ox+" "+oy+"L"+rayX+" "+rayY)
					.attr(axisRayStyle)
						.rotate(rotateDeg,ox,oy);
		axisRay.data.push(ray);
	}

	var axisLabel = {
		length: r + offset,
		data:[]
	};
	var rotatePi = rotateDeg/180 * Math.PI;
	for(var i=0;i<axisLabels.length;i++){
		rayX = ox + axisLabel.length * Math.sin(alpha * (i+1) + rotatePi);
		rayY = oy - axisLabel.length * Math.cos(alpha * (i+1) + rotatePi);
		var label = R.text(rayX,rayY,axisLabels[i])
					.attr(labelStyle);
		axisLabel.data.push(label);
	}

	var dataShape = {
		data:[],
		lines : [],
		labels : []
	},current;
	for(var i=0;i<data.length;i++){
		var ra = (data[i]/max * r);
		rayX = ox + ra * Math.sin(alpha * (i+1) + rotatePi);
		rayY = oy - ra * Math.cos(alpha * (i+1) + rotatePi);
		var dataCircle = R.circle(rayX,rayY,pointRadius)
							.attr(pointStyle);

		dataShape.data.push(dataCircle);
		
		(function(circle,index){
			circle[0].style.cursor = "default";
			var thisR = circle.attrs.r*animFactor;
			var thisFill = circle.attrs.fill;
			var thisX = circle.attrs.cx;
			var thisY = circle.attrs.cy;
			dataShape.labels.push(R.text(thisX,thisY-thisR-dataLabelOffset,(data[i]/sum*100).toFixed(2)+"%")
					.attr(dataLabelStyle).hide());
			circle[0].onmouseover = function(){
				circle.animate({'fill-opacity':.85,r:thisR},100);
				dataShape.labels[index].show();
			};
			circle[0].onmouseout = function(){
				circle.animate({'fill-opacity':1,r:pointRadius},100);
				dataShape.labels[index].hide();
			};
		})(dataCircle, i);
		
	}
	for(var i=1;i<=data.length;i++){
		var lastX = dataShape.data[i-1].attr('cx');
		var lastY = dataShape.data[i-1].attr('cy');
		rayX = dataShape.data[i%data.length].attr('cx');
		rayY = dataShape.data[i%data.length].attr('cy');
		var dataLine = R.path("M"+lastX+" "+lastY+"L"+rayX+" "+rayY)
						.attr(pointLineStyle)
							.toBack();
		dataShape.lines.push(dataLine);
	}

};