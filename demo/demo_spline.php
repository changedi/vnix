<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>god engine x</title>
<script src="../../../js/jquery-1.6.2.min.js" type="text/javascript"
	charset="utf-8"></script>
	<script src="../../../js/highcharts.js" type="text/javascript"
	charset="utf-8"></script>
</head>
	
<body>
<script src="../../raphael-min.js" type="text/javascript" charset="utf-8"></script>
<script src="../common.js" type="text/javascript" charset="utf-8"></script>
<script src="../spline.js" type="text/javascript" charset="utf-8"></script>
<style type="text/css" media="screen">
#holder {
	-moz-border-radius: 10px;
	-webkit-border-radius: 10px;
	border: solid 1px #333;
}
body {
   	background: #333;
    color: #fff;
    font: 300 100.1% "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif;
}
p {
	text-align: center;
}
.donut{
	text-align: left;
}
</style>
<h1>vnix spline demo</h1>
<div>
	<div class="donut">spline</div>
</div>
<div id="holder"></div>
<script>
$(document).ready(function() {
	var chart = new Spline('holder', {
		showDataLabel:false
	}, [ {x:1,y:100}, 
		 {x:2,y:250},
		 {x:3,y:390},
		 {x:4,y:426},
		 {x:5,y:320},
		 {x:6,y:250},
		 {x:7,y:340},
		 {x:8,y:280},
		 {x:9,y:30}]);
	chart.draw();
});
</script>
<div>
copyright @ vnix
</div>
</body>
</html>