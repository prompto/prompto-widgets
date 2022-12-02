import StrictSet from './StrictSet';
import { NotMutableError } from './NativeError';
import { equalObjects } from './Utils';

function List(mutable, items) {
    Array.call(this);
    if(items)
        this.addItems(items);
	this.mutable = mutable;
	return this;
}

List.prototype = Object.create(Array.prototype);
List.prototype.constructor = List;

List.prototype.toArray = function() {
    return Array.from(this);
};

List.prototype.addItems = function(items) {
    if(typeof(StrictSet) !== 'undefined' && items instanceof StrictSet)
    	items = Array.from(items.set.values());
	this.push.apply(this, items);
	return this; // enable fluid API
};

List.prototype.add = function(items) {
    if(typeof(StrictSet) !== 'undefined' && items instanceof StrictSet)
        items = Array.from(items.set.values());
    var result = new List(false, this);
    result.addItems(items);
    return result;
};


List.prototype.remove = function(items) {
	var excluded = (typeof(StrictSet) !== 'undefined' && items instanceof StrictSet) ? items : new Set(items);
    var remaining = this.filter(function(item) { return !excluded.has(item); });
    return new List(false, remaining);
};


List.prototype.sorted = function(sortFunction) {
    var sorted = Array.from(this).sort(sortFunction);
    return new List(false, sorted);
};

List.prototype.filtered = function(filterFunction) {
    var filtered = this.filter(filterFunction);
    return new List(false, filtered);
};


List.prototype.item = function(idx) {
    if(idx==null)
        throw new ReferenceError();
    else if(idx<1 || idx>this.length)
        throw new RangeError();
    else
        return this[idx-1];
};

List.prototype.getItem = function (idx, create) {
    if(idx==null)
        throw new ReferenceError();
    else if(idx<1 || idx>this.length)
        throw new RangeError();
    else {
        if(!this[idx - 1] && create)
            this[idx - 1] = new Document();
        return this[idx - 1] || null;
    }
};

List.prototype.setItem = function (idx, value) {
    if(!this.mutable)
        throw new NotMutableError();
    else if(idx==null)
        throw new ReferenceError();
    else if(idx<1 || idx>this.length)
        throw new RangeError();
    else
        this[idx-1] = value;
};


List.prototype.has = function(item, noCheckEquals) {
    var set = new StrictSet(this);
    return set.has(item, noCheckEquals);
};


List.prototype.hasAll = function(items, noCheckEquals) {
    var set = new StrictSet(this);
    return set.hasAll(items, noCheckEquals);
};


List.prototype.hasAny = function(items, noCheckEquals) {
    var set = new StrictSet(this);
    return set.hasAny(items, noCheckEquals);
};


List.prototype.slice1Based = function(start, last) {
    if(start) {
        if (start < 0 || start >= this.length)
            throw new RangeError();
        start = start - 1;
    } else
        start = 0;
    if(!last)
        return new List(false, this.slice(start));
    if(last >= 0) {
        if(last<=start || last>= this.length - 1)
            throw new RangeError();
        return new List(false, this.slice(start, last));
    } else {
        // TODO check Range
        return new List(false, this.slice(start, 1 + last));
    }
};


List.prototype.iterate = function (fn, instance) {
    if(instance)
    	fn = fn.bind(instance);
    var self = this;
    return {
        length: self.length,
        iterator: function() {
            var idx = 0;
            return {
                hasNext: function() { return idx < self.length; },
                next: function() { return fn(self[idx++]); }
            };
        },
        toArray: function() {
        	var array = [];
        	var iterator = this.iterator();
        	while(iterator.hasNext())
        		array.push(iterator.next());
        	return array;
        },
        getText: function() {
        	return this.toArray().join(", ");
        }
    }
};


List.prototype.collectStorables = function(storablesToAdd) {
    this.forEach(function(item) {
        if(item && item.collectStorables)
            item.collectStorables(storablesToAdd);
    }, this);
};


List.prototype.collectDbIds = function(idsToDelete) {
	this.forEach(function(item) {
		item.collectDbIds(idsToDelete);
	}, this);
};


List.prototype.equals = function(o) {
    o = o || null;
    if(this===o) {
        return true;
    }
    if(!(o instanceof List) || this.length !== o.length) {
        return false;
    }
    for(var i=0;i<this.length;i++) {
        if(!equalObjects(this[i], o[i])) {
            return false;
        }
    }
    return true;
};

List.prototype.toString = function() {
	return "[" + this.join(", ") + "]";
};

List.prototype.getText = List.prototype.toString;

(function() {
    var $isArray = Array.isArray;
    Array.isArray = function(obj) {
        return $isArray(obj) || obj instanceof List;
    }
    var $concat = Array.prototype.concat;
    // eslint-disable-next-line
    Array.prototype.concat = function() {
        for(var i=0; i<arguments.length; i++) {
            if(arguments[i] instanceof List)
                arguments[i] = Array.from(arguments[i]);
        }
        return $concat.apply(this, arguments);
    }
})();

export default List;
