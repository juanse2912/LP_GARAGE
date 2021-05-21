const math = require('./part').math;

module.exports.unitConverter = function(value, unit) {
    if (value instanceof math.unit) {
        return value.to(unit)
    } else {
        return math.unit(value).to(unit);
    }    
}