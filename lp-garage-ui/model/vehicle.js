const math = require("mathjs");
const Part = require("./part").Part;
const Engine = require("./engine").Engine;
const PARTS = new Map();
PARTS.set("Engine", Engine);

class Vehicle extends Part{
    constructor(id, make, model, year, weight) {
        let scope = {}
        super(scope);
        this.scope=scope;
        this.id = id;
        this.make = make;
        this.model = model;
        this.year = year;
        this.scope['weight']= math.unit(weight).to("kg");
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
        if (PARTS[partName]) {
            this.parts[partName] = PARTS[partName].fromJSON(json)
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
     * Permits updating a set of individual properties by its name
     * @param {Map<string,any>} valueMap A map with the properties and values to be updated
     */
    updateValues(valueMap) {
        for (let [key, value] of valueMap) {
            switch (key) {
                case "make": 
                    this.make = value; 
                    break;
                case "model": 
                    this.model = value; 
                    break;
                case "year": 
                    this.year = value; 
                    break;
                case "weight": 
                    this.scope['weight']= math.unit(value).to("kg");
                    for (let partName in this.parts) {
                        this.parts[partName].calculate();
                    }
                    break;
                default:
                    console.warn(`Property ${key} not available in this class`);
            }    
        }
    }


    /**
     * Serializes object to JSON Structure
     * @param {boolean} includeParts Indicates if parts should be considered on the JSON result
     * @returns 
     */
    toJSON(includeParts) {
        let res = {
            "id":this.id,
            "make":this.make,
            "model":this.model,
            "year":this.year,
            "weight":this.scope['weight'].toString()
        }
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
        let v = new Vehicle(j.id, j.make, j.model, j.year, j.weight);
        for (let [partName, classH] of PARTS) {
            if (j[partName]) {
                v.parts[partName] = classH.fromJSON(v, j[partName]);
            }
        }

        return v;
    }

}

module.exports.Vehicle = Vehicle;