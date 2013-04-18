/**
 * 
 * @param date
 */
function LunarDate(config,data){
	this.mode = 1;
	
	this.lunarYears = [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,  
	      	           0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,  
	    	           0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,  
	    	           0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,  
	    	           0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,  
	    	           0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,  
	    	           0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,  
	    	           0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,  
	    	           0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,  
	    	           0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,  
	    	           0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,  
	    	           0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,  
	    	           0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,  
	    	           0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,  
	    	           0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0];
	this.year = 0;
	this.month = 0;
	this.day = 0;
	this.leap = false;
	this.chineseNumber = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
	this.baseDate = -2206425952000;  
	
	this.setConfig(config);
}

LunarDate.prototype.setConfig = function(config) {
	var prop;
	if (config) {
		for (prop in config) {
			if (config.hasOwnProperty(prop)) {
				this.defaults[prop] = config[prop];
			}
		}
	}
};

LunarDate.prototype.getLunarDate = function(time){
	if(!time){
		throw new Error("Please set which time in millis to transform.");
	}
	var self = this;
	
	function yearDays(y) {  
        var i, sum = 348;  
        for (i = 0x8000; i > 0x8; i >>= 1) {  
            if ((self.lunarYears[y - 1900] & i) != 0) sum += 1;  
        }  
        return (sum + leapDays(y));  
    }
	
	function leapDays(y) {  
        if (leapMonth(y) != 0) {  
            if ((self.lunarYears[y - 1900] & 0x10000) != 0)  
                return 30;  
            else  
                return 29;  
        } else  
            return 0;  
    }  
	
    function leapMonth(y) {  
        return parseInt(self.lunarYears[y - 1900] & 0xf);  
    }  
  
    //====== 传回农历 y年m月的总天数  
    function monthDays(y, m) {  
        if ((self.lunarYears[y - 1900] & (0x10000 >> m)) == 0)  
            return 29;  
        else  
            return 30;  
    }  
    
    //====== 传入 月日的offset 传回干支, 0=甲子  
    function cyclicalm(num) {  
        var Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];  
        var Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];  
        return (Gan[num % 10] + Zhi[num % 12]);  
    }  
	
	var yearCyl, monCyl, dayCyl;
	var leap_month = 0;
	var offset = parseInt((time - self.baseDate)/(86400 * 1000)); 
	dayCyl = offset + 40;  
    monCyl = 14; 
	
    //offset是当年的第几天  
    var iYear, daysOfYear = 0;  
    for (iYear = 1900; iYear < 2050 && offset > 0; iYear++) {  
        daysOfYear = yearDays(iYear);  
        offset -= daysOfYear;  
        monCyl += 12;  
    }  
    if (offset < 0) {  
        offset += daysOfYear;  
        iYear--;  
        monCyl -= 12;  
    }  
    //农历年份  
    this.year = iYear;  

    yearCyl = iYear - 1864;  
    leap_month = leapMonth(iYear); //闰哪个月,1-12  
    this.leap = false; 
    
  //用当年的天数offset,逐个减去每月（农历）的天数，求出当天是本月的第几天  
    var iMonth, daysOfMonth = 0;  
    for (iMonth = 1; iMonth < 13 && offset > 0; iMonth++) {  
        //闰月  
        if (leap_month > 0 && iMonth == (leap_month + 1) && !this.leap) {  
            --iMonth;  
            this.leap = true;  
            daysOfMonth = leapDays(this.year);  
        } else  
            daysOfMonth = monthDays(this.year, iMonth);  

        offset -= daysOfMonth;  
        //解除闰月  
        if (this.leap && iMonth == (leap_month + 1)) this.leap = false;  
        if (!this.leap) monCyl++;  
    }  
    //offset为0时，并且刚才计算的月份是闰月，要校正  
    if (offset == 0 && leap_month > 0 && iMonth == leap_month + 1) {  
        if (this.leap) {  
        	this.leap = false;  
        } else {  
        	this.leap = true;  
            --iMonth;  
            --monCyl;  
        }  
    }  
    //offset小于0时，也要校正  
    if (offset < 0) {  
        offset += daysOfMonth;  
        --iMonth;  
        --monCyl;  
    }  
    this.month = iMonth;  
    this.day = offset + 1;  
    return self.chineseNumber[this.month - 1] + "月" + this.getChinaDayString(this.day);
};

LunarDate.prototype.getChinaDayString = function(day) {  
    var chineseTen = ["初", "十", "廿", "卅"];  
    var n = day % 10 == 0 ? 9 : day % 10 - 1;  
    if (day > 30)  
        return "";  
    if (day == 10)  
        return "初十";  
    else  
        return chineseTen[parseInt(day / 10)] + this.chineseNumber[n];  
}  

LunarDate.prototype.isChineseFestival = function(time,map){
	var date = this.getLunarDate(time);
	for(var key in map){
		if(key==date){
			return true;
		}
	}
	return false;
}

LunarDate.prototype.isWeekend = function(time){
	var date = new Date(time);
	if(date.getDay()==0||date.getDay()==6){
		return true;
	}
	return false;
}