const math = require("mathjs")

//math.createUnit("rpm",`${2*Math.PI} rad/min`)

class Part {
    constructor(scope) {
        this.scope = scope;
    }
    returnValue(vn, units) {
        if (this.scope[vn] && this.scope[vn] instanceof math.Unit) {
            if(units) {
                return this.scope[vn].to(units).toString();
            } else {
                return this.scope[vn].toString();
            }
        } else if(this.scope[vn]) {
            return this.scope[vn];
        }
        
    }    
}
module.exports.Part = Part;