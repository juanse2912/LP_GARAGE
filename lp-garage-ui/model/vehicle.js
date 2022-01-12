const math = require("./part").math;
const Part = require("./part").Part;
const Engine = require("./engine").Engine;
const Suspenssion = require("./suspenssion").Suspenssion;
const Brakes = require("./brakes").Brakes;

const PARTS = new Map();
PARTS.set("Engine", Engine);
PARTS.set("Suspenssion", Suspenssion)
PARTS.set("Brakes", Brakes);

class Vehicle extends Part{
    constructor(id, make, model, year, weight,tireWidth, tireAspectRatio, wheelRim) {
        let partProperties = {
            "inputParameters":{
                "weight":{
                    "alias":"wt",
                    "units":"kg",
                    "value":weight
                },
                tireWidth:{
                    "alias":"TW",
                    "units":"mm",
                    "value":tireWidth
                },
                tireAspectRatio:{
                    "alias":"AR",
                    "value":tireAspectRatio
                },
                wheelRim:{
                    "alias":"WR",
                    "units":"in",
                    "value":wheelRim
                }
            }
        }
        let scope = {}
        super(scope, partProperties);
        this.scope=scope;
        this.id = id;
        this.make = make;
        this.model = model;
        this.year = year;
        this.parts = {};
        
    }

    /**
     * Adds a part based on a JSON structure and returns its serialized form.
     * @param {string} partName The name of the part being added
     * @param {any} json A JSON object with the data of the part
     * @returns The resulting JSON representation of the added part
     * @throws {Error} When the name of the part is not present on the PARTS constant
     */
    addPart(partName, json) {
        if (PARTS.has(partName)) {
            this.parts[partName] = PARTS.get(partName).fromJSON(this, json)
            return this.parts[partName].toJSON(false);
        } else {
            throw new Error(`Invalid part name: ${partName}`);
        }
    }
    /**
     * Returns a part instance by its name
     * @param {string} partName the name of the part to be returned
     * @returns {Part}
     */
    getPart(partName) {
        if (this.parts[partName]) {
            return this.parts[partName];
        } else {
            return null;
        }
        
    }

    /**
     * Permits updating a set of properties
     * @override
     * @param {Map<string,any>} valueMap The values to be updated
     */
    updateValues(valueMap) {
        let localProps = ["id", "make", "model", "year"];
        for (let p of localProps) {
            if (valueMap.has(p)) {
                if(p!="id") { //ID can't be updated
                    this[p] = valueMap.get(p);
                }
                valueMap.delete(p)
            }
        }
        super.updateValues(valueMap);
    }



    /**
     * Serializes object to JSON Structure
     * @override
     * @param {boolean} includeParts Indicates if parts should be considered on the JSON result
     * @returns 
     */
    toJSON(includeParts) {
        let res = super.toJSON()
        
        res["id"] = this.id;
        res["make"] = this.make;
        res["model"] = this.model;
        res["year"] = this.year
        
        if (includeParts) {
            for(let part in this.parts) {
                res[part] = this.parts[part].toJSON(true)
            }
        }
        return res;
    }
    /**
     * Deseralizes a Vehicle with its parts from a JSON document
     * @param {VehicleData} j 
     * @returns Vehicle
     */
    static fromJSON(j) {
        let v = new Vehicle(j.id, j.make, j.model, j.year, j.weight, j.tireWidth, j.tireAspectRatio, j.wheelRim);
        for (let [partName, classH] of PARTS) {
            if (j[partName]) {
                v.parts[partName] = classH.fromJSON(v, j[partName]);
            }
        }

        return v;
    }

}

module.exports.Vehicle = Vehicle;