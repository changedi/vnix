function Donut(container, config, data) {
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

	this.setConfig(config);
	this.setData(data);
};

Donut.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

Donut.prototype.setData = function(data) {
	if (!data) {
		throw new Error("Please set which data to represent.");
	}
	this.data = data;
};

Donut.prototype.draw = function() {
	var self = this;
	if (!self.container) {
		throw new Error("Please set which DOM node to render.");
	}
	var conf = self.defaults;
	var R = Raphael(self.container, conf.width, conf.height), r = conf.radius, data = self.data, colors = conf.lineColor, ox = self.defaults.centerX, oy = self.defaults.centerY, param = {
		stroke : "#000",
		"stroke-width" : conf.lineWidth
	};

	var sum = 0;
	for ( var i = 0; i < data.length; i++) {
		sum += data[i];
	}

	R.customAttributes.arc = function(arc_config) {
		var value = arc_config.value, total = arc_config.total, r = arc_config.radius;

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
			stroke : color
		};
	};

	var part_1 = R.path().attr(param).attr({
		arc : [ {
			value : sum,
			total : sum,
			radius : r,
			color : colors.length > 0 ? colors[0] : null
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
			color : colors.length > 0 ? colors[1] : null
		} ]
	});

	var alpha = 180 / sum * data[0], offset = conf.labelOffset, a = (90 - alpha)
			* Math.PI / 180, x = ox + (r + offset) * Math.cos(a), y = oy
			- (r + offset) * Math.sin(a);
	var text_1 = R.text(x, y, conf.labelText[0]).attr(conf.labelTextStyle);
	alpha = 180 / sum * data[1], a = (90 - alpha) * Math.PI / 180, x = ox
			- (r + offset) * Math.cos(a), y = oy - (r + offset) * Math.sin(a);
	var text_2 = R.text(x, y, conf.labelText[1]).attr(conf.labelTextStyle);

};