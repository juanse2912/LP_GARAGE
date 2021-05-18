const create = require("mathjs").create;
const all = require("mathjs").all;
const math = create(all, {number:'BigNumber',precision:14});
module.exports.math = math;
/**
 * Input parameter that is used to instanciate a part subclass
 * @typedef {object} inputParameter
 * @property {string} alias The alias with which this parameter is defined in the scope
 * @property {?string} units The units in which the value must be stored in the scope
 * @property {(string|number)} value The value given to this parameter
 */
/**
 * Constant value required for part formulas
 * @typedef {object} constant
 * @property {string} alias The alias with which the constant is defined in the scope
 * @property {value} value The value of the constant
 */
/**
 * Formula of part
 * @typedef {object} formula
 * @property {string} alias
 * @property {string} formula
 */
/**
 * Parameters, constants and formulas of a part
 * @typedef {object} partProperties
 * @property {...inputParameter} inputParameters
 * @property {...constant} constants
 * @property {...formula} formulas
 */



/**
 * Abrstract base for parts and subparts
 * Extending members must implement the static method `fromJSON` which
 * must allow deseralization into a subclass member from a JSON document.
 */
class Part {
    /**
     * 
     * @param {object} scope A JSON structure that is common for the vehicle parts and subparts
     * @param {partProperties} partProperties 
     */
    constructor(scope, partProperties) {
        this.scope = scope;
        this.partProperties = partProperties
        //Add input parameters to the scope
        for (let param in partProperties.inputParameters) {
            let alias = partProperties.inputParameters[param].alias;
            if (partProperties.inputParameters[param].hasOwnProperty("units")) {
                this.scope[alias] = math
                    .unit(partProperties.inputParameters[param].value)
                    .to(partProperties.inputParameters[param].units)
            } else {
                this.scope[alias] = math
                    .number(partProperties.inputParameters[param].value)
            }
        }
        //Add constants to the scope
        for (let c in partProperties.constants) {
            let alias = partProperties.constants[c].alias;
            this.scope[alias] = partProperties.constants[c].value;
        }
        this.calculate()
    }
    /**
     * Executes the part calculations defined on the partProperties
     */
    calculate() {
        for (let f in this.partProperties.formulas) {
            let alias = this.partProperties.formulas[f].alias;
            let formula = this.partProperties.formulas[f].formula;
            //console.debug("formula", this.partProperties.formulas[f])
            math.evaluate( `${alias} = ${formula}`, this.scope)
        }
    }

    /**
     * Permits updating a set of individual properties by its name
     * @param {Map<string,any>} valueMap A map with the properties and values to be updated
     */
     updateValues(valueMap) {
        for (let [key, value] of valueMap) {
            if(this.partProperties.inputParameters.hasOwnProperty(key)) {
                let alias = this.partProperties.inputParameters[key].alias;
                let units = this.partProperties.inputParameters[key].units;
                this.partProperties.inputParameters[key].value = value;
                if (units) {
                    this.scope[alias] = math.unit(value).to(units)
                } else {
                    this.scope[alias] = math.number(value);
                }
            } else {
                console.warn("Invalid value for this part: " + key)
            }
        }
     }
    /**
     * Serializes ths part to JSON including input parameters and formula results
     * @returns {object} JSON Serialized part
     */
    toJSON() {
        let ip = this.partProperties.inputParameters;
        let formulas = this.partProperties.formulas;
        let result = {};
        for (let p in ip){
            result[p] = ip[p].value.toString();
        }

        for (let f in formulas) {
            result[f] = this.scope[formulas[f].alias].toString();
        }
        return result;
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