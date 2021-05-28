const math = require("./part").math;
const Part = require("./part").Part;

class EnginePower extends Part {
    constructor(engine, intakeAirPressure, intakeAirTemperature) {
        /**
         * @type partProperties
         */
        let partProperties = {
            "inputParameters": {
                "intakeAirPressure": {
                    "alias":"PA",
                    "units":"kPa",
                    "value": intakeAirPressure
                },
                "intakeAirTemperature":{
                    "alias":"TA",
                    "units":"K",
                    "value":intakeAirTemperature
                }
            },
            "formulas":{
                "airDensity": {
                    "alias":"pA",
                    "formula":"PA/(CA*TA)"
                },
                "compressionPressure":{
                    "alias":"PC",
                    "formula":"(PA*(Vh+VC)^k)/VC^k"
                },
                "compressionTemperature":{
                    "alias":"TC",
                    "formula":"(TA*(Vh+VC)^(k-1))/VC^(k-1)"
                },
                "airMass":{
                    "alias":"ma",
                    "formula":"((nV*Vh*n*pA)/200)/60s"
                },
                "fuelMass":{
                    "alias":"mc",
                    "formula":"ma/afr"
                },
                "contributedHeat":{
                    "alias":"Qap",
                    "formula":"mc*LHV"
                },
                "combustionTemperature":{
                    "alias":"Tz",
                    "formula":"(1 K)*(Qap/(cev*ma)) + TC"
                },
                "combustionPressure":{
                    "alias":"Pz",
                    "formula":"(Tz*PC)/TC"
                },
                "pressureDifferential":{
                    "alias":"l1",
                    "formula":"Pz/PC"
                }
            }
        }
        super(engine.scope, partProperties)
        this.engine = engine;
        this.scope = engine.scope
        this.partProperties = partProperties;
    }

    static fromJSON(engine, j) {
        return new EnginePower(engine, j.intakeAirPressure, j.intakeAirTemperature)
    }
}

class EngineForces extends Part {
    constructor(eng, pistonDiameter, R, L) {
        /**
         * @type partProperties
         */
        let partProperties = {
            "inputParameters":{
                "pistonDiameter":{
                    "alias":"dp",
                    "units":"mm",
                    "value": pistonDiameter
                },
                "bore":{
                    "alias":"R",
                    "units":"mm",
                    "value":R
                },
                "stroke":{
                    "alias":"L",
                    "units":"mm",
                    "value":L
                }
            },
            "formulas":{

            }
        }
        super(eng.scope, partProperties);
        this.engine = eng;
        this.scope = eng.scope;       
    }

    static fromJSON(engine, j) {
        return new EngineForces(engine, j.pistonDiameter, j.R, j.L);
    }

}


const SUBPARTS = new Map();
SUBPARTS.set("EnginePower",EnginePower);
SUBPARTS.set("EngineForces", EngineForces)


class Engine extends Part {

    constructor(vehicle, displacement, cylinders, compressionRatio, maxPower, rpmMaxPower, intakeType){
        let engineProperties = {
            "inputParameters": {
                "displacement": {
                    "value": displacement,
                    "alias": "VH",
                    "units": "m^3"
                },
                "cylinders": {
                    "value":cylinders,
                    "alias":"NC"
                },
                "compressionRatio":{
                    "value":compressionRatio,
                    "alias":"RC",
                },
                "maxPower":{
                    "value":maxPower,
                    "alias":"MP",
                    "units":"hp"
                },
                "rpmMaxPower":{
                    "alias":"n",
                    "value":rpmMaxPower
                }
            },
            "constants":{
                "airConstant": {
                    "alias":"CA",
                    "value": math.unit("0.287 kJ/(kg K)")
                },
                "adiabaticConstant":{
                    "alias":"k",
                    "value": math.number(1.40)
                },
                "airFuelRelation": {
                    "alias":"afr",
                    "value":math.number(14.7)
                },
                "fuelCalorificPower":{
                    "alias":"LHV",
                    "value":math.unit("44000 kJ/kg")
                },
                "especificHeat":{
                    "alias":"cev",
                    "value":math.unit("0.718 kJ/kg")
                },
                "policompressionCoefficient":{
                    "alias":"n1",
                    "value":1.3
                },
                "poliexpanssionCoefficient":{
                    "alias":"n2",
                    "value":1.3
                },
                "fuelVolumetriPerformance": {
                    "alias":"nV",
                    "value": math.number(intakeType=="N" ? 95 : 100)
                }
            }, 
            "formulas":{
                "unitaryDisplacement":{
                    "alias":"Vh",
                    "formula":"VH/NC"
                },
                "combustionChamberVolume":{
                    "alias":"VC",
                    "formula":"Vh/(RC - 1)"
                }
            }
        }

        super(vehicle.scope, engineProperties)
        this.scope = vehicle.scope;
        this.intakeType = intakeType;
        this.parts = {};
    }
    
    updateValues(valueMap) {
        if (valueMap.has("intakeType")) {
            this.intakeType = valueMap.get("intakeType")
            valueMap.delete("intakeType")
        }
        super.updateValues(valueMap);
    }

    static fromJSON(vehicle, j) {
        let engine = new Engine(vehicle, j.displacement, j.cylinders, j.compressionRatio, j.maxPower, j.rpmMaxPower, j.intakeType);
        for( let [partName, classH] of SUBPARTS) {
            if(j[partName]) {
                engine.parts[partName] = classH.fromJSON(engine, j[partName]);
            }
        }
        return engine;
    }

    toJSON(includeSubparts) {
        let result = super.toJSON();
        result["intakeType"] = this.intakeType;
        if (includeSubparts) {
            for (let partName in this.parts) {
                result[partName] = this.parts[partName].toJSON();
            }
        }
        return result;
    }

    addPart(partName, j) {
        let partClass = SUBPARTS.get(partName);
        if (partClass) {
            this.parts[partName] = partClass.fromJSON(this, j);
        } else {
            throw new Error("Invalid part name: " + partName);
        }
    }

    getPart(partName) {
        return this.parts[partName];
    }
    
}

module.exports.Engine = Engine;