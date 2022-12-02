import StrictSet from './StrictSet';
import List from './List';

// eslint-disable-next-line
function isAnInteger(o) {
    return typeof(o) === "number" && o === Math.floor(o);
}

// eslint-disable-next-line
function isADecimal(o) {
    return typeof(o) === "number" && o !== Math.floor(o);
}

// eslint-disable-next-line
function isAText(o) {
    return typeof(o) === 'string' || o instanceof String;
}

export function equalObjects(o1, o2) {
    if(Object.is(o1, o2))
        return true;
    else
        return typeof(o1)==='object' && o1.equals && o1.equals(o2);

}

// eslint-disable-next-line
TypeError.prototype.getText = function() { return 'Null reference!'; };
// eslint-disable-next-line
ReferenceError.prototype.getText = function() { return 'Null reference!'; };
// eslint-disable-next-line
RangeError.prototype.getText = function() { return 'Index out of range!'; };

if(!Object.values) {
	Object.values = function(o) {
	    var values = [];
	    for(var name in o) { values.push(o[name]); }
	    return values;
	}; 
}

// eslint-disable-next-line
Boolean.prototype.getText = Boolean.prototype.toString;
// eslint-disable-next-line
Boolean.prototype.equals = function(value) {
	return this === value;
};
// eslint-disable-next-line
Number.prototype.formatInteger = function(format) {
    var value = "000000000000" + this;
    return value.substr(value.length - format.length);
};
// eslint-disable-next-line
Number.prototype.toDecimalString = function() {
    // mimic 0.0######
    var s = this.toString();
    var i = s.indexOf('.');
    if(i>=0) {
        // fix IEEE issue
        i = s.indexOf('000000', i);
        if( i < 0)
            return s;
        else
            return s.substr(0, i);
    } else
        return s + ".0";
};
// eslint-disable-next-line
Number.prototype.getText = Number.prototype.toString;
// eslint-disable-next-line
String.prototype.hasAll = function(items) {
    if(StrictSet && items instanceof StrictSet)
        items = Array.from(items.set.values());
    for(var i=0;i<items.length;i++) {
        if(!this.includes(items[i]))
            return false;
    }
    return true;
};
// eslint-disable-next-line
String.prototype.hasAny = function(items) {
    if(StrictSet && items instanceof StrictSet)
        items = Array.from(items.set.values());
    for(var i=0;i<items.length;i++) {
        if(this.includes(items[i]))
            return true;
    }
    return false;
};
// eslint-disable-next-line
String.prototype.splitToList = function(separator) {
    return new List(false, this.split(separator));
};
// eslint-disable-next-line
String.prototype.slice1Based = function(start, last) {
    if(start) {
        if (start < 0 || start >= this.length)
            throw new RangeError();
        start = start - 1;
    } else
        start = 0;
    if(!last)
        return this.substring(start);
    if(last >= 0) {
        if(last<1 || last>this.length)
            throw new RangeError();
        return this.substring(start, last);
    } else {
        if(last<-this.length)
            throw new RangeError();
        return this.substring(start, this.length + 1 + last)
    }
};
// eslint-disable-next-line
String.prototype.getText = String.prototype.toString;
// eslint-disable-next-line
String.prototype.indexOf1Based = function(value) {
	return 1 + this.indexOf(value);
};
// eslint-disable-next-line
String.prototype.equals = function(value) {
	return this === value;
};

