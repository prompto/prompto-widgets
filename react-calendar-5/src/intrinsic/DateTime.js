import LocalDate from "./LocalDate";
import LocalTime from "./LocalTime";
import Period from "./Period";

function DateTime(date, tzOffset) {
    this.date = date;
    // can't just use native Date since it's tzOffset is bound to the running location
    this.tzOffset = tzOffset;
    return this;
}

DateTime.now = function() {
    var now = new Date();
    return new DateTime(now, now.getTimezoneOffset());
};

DateTime.parse = function(text) {
    var year = parseInt(text.substring(0,4));
    text = text.substring(4);
    var month = 1;
    var day = 1;
    if(text[0] === '-') {
        text = text.substring(1); // skip "-"
        month = parseInt(text.substring(0,2));
        text = text.substring(2);
        if(text[0] === '-') {
            text = text.substring(1); // skip "-"
            day = parseInt(text.substring(0,2));
            text = text.substring(2);
        }
    }
    var hour = 0;
    var minute = 0;
    var second = 0;
    var milli = 0;
    if(text[0] === 'T') {
        text = text.substring(1); // skip "T"
        hour = parseInt(text.substring(0,2));
        text = text.substring(2);
        if(text[0] === ':') {
            text = text.substring(1); // skip ":"
            minute = parseInt(text.substring(0,2));
            text = text.substring(2);
            if(text[0] === ':') {
                text = text.substring(1); // skip ":"
                second = parseInt(text.substring(0, 2));
                text = text.substring(2);
                if (text[0] === '.') {
                    text = text.substring(1); // skip "."
                    milli = parseInt(text.substring(0, 3));
                    text = text.substring(3);
                }
            }
        }
    }
    var date = new Date(Date.UTC(year, month-1, day, hour, minute, second, milli));
    var tzOffset = 0; // in seconds
    if(text[0] === '+' || text[0] === '-') {
        var sign = text[0] === '+' ? 1 : -1;
        text = text.substring(1); // skip "+/-"
        tzOffset = parseInt(text.substring(0, 2)) * 60 * 60;
        text = text.substring(2);
        if (text[0] === ':') {
            text = text.substring(1); // skip ":"
            tzOffset += parseInt(text.substring(0, 2)) * 60;
        }
        tzOffset *= sign;
   }
    return new DateTime(date, tzOffset);
};


DateTime.fromDateAndTime = function (date, time) {
    var date_ = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    var tzOffset = 0; // in seconds
    return new DateTime(date_, tzOffset);
};


DateTime.prototype.addPeriod = function (period) {
    var date = new Date();
    var year = this.date.getUTCFullYear() + (period.years || 0);
    date.setUTCFullYear(year);
    var month = this.date.getUTCMonth() + (period.months || 0);
    date.setUTCMonth(month);
    var day = this.date.getUTCDate() + ((period.weeks || 0) * 7) + (period.days || 0);
    date.setUTCDate(day);
    var hour = this.date.getUTCHours() + (period.hours || 0);
    date.setUTCHours(hour);
    var minute = this.date.getUTCMinutes() + (period.minutes || 0);
    date.setUTCMinutes(minute);
    var second = this.date.getUTCSeconds() + (period.seconds || 0);
    date.setUTCSeconds(second);
    var milliseconds = this.date.getUTCMilliseconds() + (period.milliseconds || 0);
    date.setUTCMilliseconds(milliseconds);
    return new DateTime(date, this.tzOffset);
};


DateTime.prototype.subtractDateTime = function(dateTime) {
    var thisValue = this.date.valueOf() + this.tzOffset*1000;
    var otherValue = dateTime.date.valueOf() + dateTime.tzOffset*1000;
    var numDays = ( thisValue - otherValue)/(24*60*60*1000);
    var data = [];
    data[3] = Math.floor(numDays);
    data[4] = this.date.getUTCHours() - dateTime.date.getUTCHours();
    data[5] = this.date.getUTCMinutes() - dateTime.date.getUTCMinutes();
    data[6] = this.date.getUTCSeconds() - dateTime.date.getUTCSeconds();
    data[7] = this.date.getUTCMilliseconds() - dateTime.date.getUTCMilliseconds();
    return new Period(data);
};


DateTime.prototype.subtractPeriod = function(period) {
    var date = new Date();
    var year = this.date.getUTCFullYear() - (period.years || 0);
    date.setUTCFullYear(year);
    var month = this.date.getUTCMonth() - (period.months || 0);
    date.setUTCMonth(month);
    var day = this.date.getUTCDate() - ((period.weeks || 0) * 7) - (period.days || 0);
    date.setUTCDate(day);
    var hour = this.date.getUTCHours() - (period.hours || 0);
    date.setUTCHours(hour);
    var minute = this.date.getUTCMinutes() - (period.minutes || 0);
    date.setUTCMinutes(minute);
    var second = this.date.getUTCSeconds() - (period.seconds || 0);
    date.setUTCSeconds(second);
    var milliseconds = this.date.getUTCMilliseconds() - (period.milliseconds || 0);
    date.setUTCMilliseconds(milliseconds);
    return new DateTime(date, this.tzOffset);
};



DateTime.prototype.toString = function() {
    var s = ("0000" + this.date.getUTCFullYear()).slice(-4);
    s += "-";
    s += ("00" + (this.date.getUTCMonth() + 1)).slice(-2);
    s += "-";
    s += ("00" + this.date.getUTCDate()).slice(-2);
    s += "T";
    s += ("00" + this.date.getUTCHours()).slice(-2);
    s += ":";
    s += ("00" + this.date.getUTCMinutes()).slice(-2);
    s += ":";
    s += ("00" + this.date.getUTCSeconds()).slice(-2);
    s += ".";
    s += ("000" + this.date.getUTCMilliseconds()).slice(-3);
    if(this.tzOffset === 0)
        return s + "Z";
    var offset = this.tzOffset;
    if (offset > 0)
        s += "+";
    else {
        offset = -offset;
        s += "-";
    }
    s += ("00" + Math.floor(offset / 3600)).slice(-2);
    s += ":";
    s += ("00" + Math.floor((offset % 3600) / 60)).slice(-2);
    return s;
};


DateTime.prototype.getText = DateTime.prototype.toString;
DateTime.prototype.toDocument = DateTime.prototype.toString;
DateTime.prototype.toJson = function() { return JSON.stringify(this.toString()); };


DateTime.prototype.equals = function(value) {
    return value instanceof DateTime && this.date.valueOf() === value.date.valueOf() && this.tzOffset === value.tzOffset;
};

DateTime.prototype.gt = function(other) {
    return other instanceof DateTime && this.compareTo(other.date, other.tzOffset) > 0;
};


DateTime.prototype.gte = function(other) {
    return other instanceof DateTime && this.compareTo(other.date, other.tzOffset) >= 0;
};


DateTime.prototype.lt = function(other) {
    return other instanceof DateTime && this.compareTo(other.date, other.tzOffset) < 0;
};


DateTime.prototype.lte = function(other) {
    return other instanceof DateTime && this.compareTo(other.date, other.tzOffset) <= 0;
};


DateTime.prototype.compareTo = function(date, tzOffset) {
    var a = this.date.valueOf() + this.tzOffset*60000;
    var b = date.valueOf() + tzOffset*60000;
    return a > b ? 1 : (a === b ? 0 : -1);
};


DateTime.prototype.getYear = function() {
    return this.date.getUTCFullYear();
};

DateTime.prototype.getMonth = function() {
    return this.date.getUTCMonth() + 1;
};


DateTime.prototype.getDayOfMonth = function() {
    return this.date.getUTCDate();
};


DateTime.prototype.getDayOfYear = function() {
    var first = new Date(this.date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var numDays = (this - first) / (24 * 60 * 60 * 1000);
    return 1 + Math.floor(numDays);
};

DateTime.prototype.getHour = function() {
    return this.date.getUTCHours();
};


DateTime.prototype.getMinute = function() {
    return this.date.getUTCMinutes();
};


DateTime.prototype.getSecond = function() {
    return this.date.getUTCSeconds();
};


DateTime.prototype.getMillisecond = function() {
    return this.date.getUTCMilliseconds();
};

DateTime.prototype.getTzOffset = function() {
    return this.date.tzOffset;
};

DateTime.prototype.getTzName = function() {
    return "Z";
};

DateTime.prototype.getDate = function() {
    var epoch = this.date.valueOf();
    epoch = epoch - ( epoch % ( 24 * 60 * 60 * 1000 ));
    return new LocalDate(new Date(epoch));
};


DateTime.prototype.getTime = function() {
	var epoch = this.date.valueOf();
	epoch = epoch % ( 24 * 60 * 60 * 1000 );
    return new LocalTime(new Date(epoch));
};

DateTime.prototype.toJsonNode = function() {
    return this.toString();
};

export default DateTime;
