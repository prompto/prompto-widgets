function Period(data) {
    var names = ["years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
    for(var i=0;i<names.length; i++) {
        this[names[i]] = data[i] || null;
    }
    return this;
}

Period.parse = function (text) {
    var data = [];
    var steps = "YMWDHM.S";
    var value = null;
    var lastStep = -1;
    var isNeg = false;
    var inPeriod = false;
    var inTime = false;
    var inMillis = false;

    var Exception = function() {};

    try {
        for(var i=0;i<text.length;i++) {
            var c = text[i];
            // leading 'P' is mandatory
            if (!inPeriod) {
                if (c === 'P') {
                    inPeriod = true;
                    continue;
                } else {
                    throw new Exception();
                }
            }
            // check for time section
            if (c === 'T') {
                if (!inTime) {
                    inTime = true;
                    continue;
                } else {
                    throw new Exception();
                }
            }
            // check for value type
            var step = inTime ? steps.indexOf(c, 4) : steps.indexOf(c);
            if (step >= 0) {
                if (step <= lastStep) {
                    throw new Exception();
                } else if (step > 3 && !inTime) {
                    throw new Exception();
                } else if (value === null) {
                    throw new Exception();
                } else if (step === 6) { // milliseconds '.'
                    inMillis = true;
                } else if (step === 7 && !inMillis) {
                    step = 6;
                }
                data[step] = value;
                lastStep = step;
                value = null;
                continue;
            }
            if (c === '-') {
                if (value != null) {
                    throw new Exception();
                }
                if (isNeg || inMillis) {
                    throw new Exception();
                }
                isNeg = true;
            }
            if (c < '0' || c > '9') {
                throw new Exception();
            }
            if (value!=null) {
                value *= 10;
                value += c - '0';
            } else {
                value = c - '0';
                if (isNeg) {
                    value = -value;
                    isNeg = false;
                }
            }
        }
        // must terminate by a value type
        if (value != null) {
            throw new Error("Failed parsing period literal: " + text);
        }
        return new Period(data);
    } catch(e) {
        throw new Error("Failed parsing period literal: " + text);
    }
};


Period.prototype.equals = function(obj) {
    return this.years === obj.years &&
        this.months === obj.months &&
        this.weeks === obj.weeks &&
        this.days === obj.days &&
        this.hours === obj.hours &&
        this.minutes === obj.minutes &&
        this.seconds === obj.seconds &&
        this.milliseconds === obj.milliseconds;
};


Period.prototype.minus = function() {
    var data = [];
    data[0] = -this.years;
    data[1] = -this.months;
    data[2] = -this.weeks;
    data[3] = -this.days;
    data[4] = -this.hours;
    data[5] = -this.minutes;
    data[6] = -this.seconds;
    data[7] = -this.milliseconds;
    return new Period(data);
};

Period.prototype.add = function(period) {
    var data = [];
    data[0] = this.years + period.years;
    data[1] = this.months + period.months;
    data[2] = this.weeks + period.weeks;
    data[3] = this.days + period.days;
    data[4] = this.hours + period.hours;
    data[5] = this.minutes + period.minutes;
    var seconds = (this.seconds + period.seconds) + ((this.milliseconds + period.milliseconds)/1000.0);
    data[6] = Math.floor(seconds);
    var milliseconds = Math.round(( seconds * 1000 ) % 1000);
    data[7] = Math.floor(Math.abs(milliseconds));
    return new Period(data);
};


Period.prototype.subtract = function(period) {
    var data = [];
    data[0] = this.years - period.years;
    data[1] = this.months - period.months;
    data[2] = this.weeks - period.weeks;
    data[3] = this.days - period.days;
    data[4] = this.hours - period.hours;
    data[5] = this.minutes - period.minutes;
    var seconds = (this.seconds + this.milliseconds/1000.0) - (period.seconds + period.milliseconds/1000.0);
    data[6] = Math.floor(seconds);
    var milliseconds = Math.round(( seconds * 1000 ) % 1000);
    data[7] = Math.floor(Math.abs(milliseconds));
    return new Period(data);
};


Period.prototype.multiply = function(value) {
    var count = value;
    if (count === 0) {
        return new Period([]);
    } else if (count === 1) {
        return this;
    } else {
        var data = [];
        data[0] = this.years * count;
        data[1] = this.months * count;
        data[2] = this.weeks * count;
        data[3] = this.days * count;
        data[4] = this.hours * count;
        data[5] = this.minutes * count;
        var seconds = (this.seconds + this.milliseconds/1000.0) * count;
        data[6] = Math.floor(seconds);
        var milliseconds = Math.round(( seconds * 1000 ) % 1000);
        data[7] = Math.floor(Math.abs(milliseconds));
        return new Period(data);
    }
};

Period.prototype.toString = function() {
    var s = "P";
    if (this.years) {
        s += this.years;
        s += "Y";
    }
    if (this.months) {
        s += this.months;
        s += "M";
    }
    if (this.weeks) {
        s += this.weeks;
        s += "W";
    }
    if (this.days) {
        s += this.days;
        s += "D";
    }
    if (this.hours || this.minutes || this.seconds || this.milliseconds) {
        s += "T";
        if (this.hours) {
            s += this.hours;
            s += "H";
        }
        if (this.minutes) {
            s += this.minutes;
            s += "M";
        }
        if (this.seconds || this.milliseconds) {
            s += this.seconds;
            if (this.milliseconds) {
                s += ".";
                s += ("000" + this.milliseconds).slice(-3);
            }
            s += "S";
        }
    }
    return s;
};

Period.prototype.totalMilliseconds = function() {
    return this.milliseconds + (this.seconds * 1000) + (this.minutes * 60 * 1000) + (this.hours * 60 * 60 * 1000)
        + (this.days * 24 * 60 * 60 * 1000) + (this.weeks * 7 * 24 * 60 * 60 * 1000) + (this.months * (365 / 12) * 24 * 60 * 60 * 1000)
        + (this.years * 365 * 24 * 60 * 60 * 1000)
};

Period.prototype.getText = Period.prototype.toString;
Period.prototype.toDocument = Period.prototype.toString;
Period.prototype.toJson = function() { return JSON.stringify(this.toString()); };

export default Period;
