function GenderPie(container, config, data) {
	this.container = container || "holder";// DOM node id
	this.defaults = {};
	this.defaults.width = 600;
	this.defaults.height = 600;
	this.defaults.centerX = 300;
	this.defaults.centerY = 300;
	this.defaults.radius = 50;
	this.defaults.lineWidth = 30;
	this.defaults.lineColor = [];
	this.defaults.labelTextStyle = {
		stroke : "#FFFFFF",
		"font-size" : 14
	};
	this.defaults.labelText = [ 'aaa', 'bbb' ];
	this.defaults.labelOffset = 50;
	this.defaults.labelDataStyle = {
		stroke : "#FFFFFF",
		"font-size" : 14
	}

	this.raphael = Raphael(container, this.defaults.width, this.defaults.height);
	this.setConfig(config);
	this.setData(data);
};

GenderPie.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

GenderPie.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

GenderPie.prototype.clear = function() {
	this.raphael.clear();
};

GenderPie.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	var conf = self.defaults;
	var R = self.raphael, r = conf.radius, data = self.data, colors = conf.lineColor, ox = self.defaults.centerX, oy = self.defaults.centerY, param = {
		stroke : "#000",
		"stroke-width" : conf.lineWidth
	};

	var sum = 0;
	for ( var i = 0; i < data.length; i++) {
		sum += data[i];
	}

	R.customAttributes.arc = function(arc_config) {
		var value = arc_config.value, total = arc_config.total, r = arc_config.radius,
		title = arc_config.title;

		var alpha = 360 / total * value, a = (90 - alpha) * Math.PI / 180, x = ox
				+ r * Math.cos(a), y = oy - r * Math.sin(a), color = arc_config.color
				|| "hsb(".concat(Math.round(r) / 200, ",", value / total,
						", .75)"), path;
		if (total == value) {
			path = [ [ "M", ox, oy - r ],
					[ "A", r, r, 0, 1, 1, ox - 0.01, oy - r ] ];
		} else {
			path = [ [ "M", ox, oy - r ],
					[ "A", r, r, 0, +(alpha > 180), 1, x, y ] ];
		}

		return {
			path : path,
			stroke : color,
			title:title
		};
	};

	var part_1 = R.path().attr(param).attr({
		arc : [ {
			value : sum,
			total : sum,
			radius : r,
			color : colors.length > 0 ? colors[0] : null,
			title: conf.labelText[1]+":"+(data[1]/sum*100).toFixed(2)+"%"
		} ]
	});
	// part_1.mouseover(function(){
	// console.log('aaa');
	// });
	var part_2 = R.path().attr(param).attr({
		arc : [ {
			value : data[0],
			total : sum,
			radius : r,
			color : colors.length > 0 ? colors[1] : null,
			title: conf.labelText[0]+":"+(data[0]/sum*100).toFixed(2)+"%"
		} ]
	}).rotate(180*(1/4-data[0]/sum),ox,oy);

	var alpha = 180 / sum * data[0], offset = conf.labelOffset, a = (90 - alpha)
			* Math.PI / 180, x = ox + (r + offset) * Math.cos(a), y = oy
			- (r + offset) * Math.sin(a),
		text1 = conf.labelText[0],
		ix = ox + (r)*Math.cos(45*Math.PI/180)-7,
		iy = oy - (r)*Math.sin(45*Math.PI/180)-48;
	var img_1 = R.image(conf.labelImage[0],ix,iy,50,50).toBack();
	var text_1 = R.text(ox+r+offset, oy-20, text1).attr(conf.labelTextStyle);
	var text_1_data = R.text(ox+r+offset, oy, (data[0]/sum*100).toFixed(0)+"%")
						.attr(conf.labelDataStyle)
							.attr({fill:colors[1]});
							
	alpha = 180 / sum * data[1], a = (90 - alpha) * Math.PI / 180, x = ox
			- (r + offset) * Math.cos(a), y = oy - (r + offset) * Math.sin(a),
			text2 = conf.labelText[1],
			ix = ox - (r)*Math.cos(45*Math.PI/180)-50,
			iy = oy - (r)*Math.sin(45*Math.PI/180)+100;
	//var img_2 = R.image(conf.labelImage[1],ox-r-offset/2,oy+r-offset+15,50,50).toBack();
	var img_2 = R.image(conf.labelImage[1],ix,iy,50,50).toBack();
	var text_2 = R.text(ox-r-offset, oy-20, text2)
					.attr(conf.labelTextStyle);
	var text_2_data = R.text(ox-r-offset, oy, (data[1]/sum*100).toFixed(0)+"%")
						.attr(conf.labelDataStyle)
							.attr({fill:colors[0]});

	var center_img = R.image('http://img04.taobaocdn.com/tps/i4/T1xmPDXh8nXXaDpu6k-59-61.png',
		ox-30,oy-30,60,60);
};