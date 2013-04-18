<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>god engine x</title>
<script src="../../../js/jquery-1.6.2.min.js" type="text/javascript"
	charset="utf-8"></script>
	<script src="../../../js/highcharts.js" type="text/javascript"
	charset="utf-8"></script>
	<link rel="stylesheet" href="css/scrollbar.css" ></link>
</head>
	
<body>
<script src="../../raphael-min.js" type="text/javascript" charset="utf-8"></script>
<script src="../../base_lib.js" type="text/javascript" charset="utf-8"></script>
<script src="../common.js" type="text/javascript" charset="utf-8"></script>
<script src="../vnix.date.js" type="text/javascript" charset="utf-8"></script>
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
<h1>vnix column demo</h1>
<div>
	<div class="donut">column</div>
</div>
<div id="holder"></div>
<script>
$(document).ready(function() {
	var lunar = new LunarDate();
	var date = new Date();
	$.getJSON("date.json",function(result){
		 console.log(lunar.isChineseFestival(date.getTime(),result));
	});
	console.log(date.getTime());
	console.log(lunar.getLunarDate(date.getTime()));
	console.log(lunar.isWeekend(date.getTime()));
	
});
</script>
<div>
copyright @ vnix
</div>
</body>
</html>