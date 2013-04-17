function line(R,sx,sy,tx,ty,attr){
	return R.path("M"+sx+" "+sy+"L"+tx+" "+ty).attr(attr);
};

function maxDigit(num){
	var res = 1;
	num = parseInt(num/10);
	while(num>0){
		num = parseInt(num/10);
		res*=10;
	}
	return res;
};