const math = require("./part").math;
const Part = require("./part").Part;

class EnginePower extends Part {
    constructor(engine, intakeAirPressure, intakeAirTemperature) {
        /**
         * @type partProperties
         */
        let partProperties = require("./EnginePowerProperties.json")
        partProperties.inputParameters.intakeAirPressure.value = intakeAirPressure;
        partProperties.inputParameters.intakeAirTemperature.value = intakeAirTemperature;
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
        let partProperties = require("./EngineForcesProperties.json")
        partProperties.inputParameters.pistonDiameter.value = pistonDiameter;
        partProperties.inputParameters.crankshaftRadius.value = R;
        partProperties.inputParameters.connectingRodLength.value = L;
        super(eng.scope, partProperties);
        this.engine = eng;
        this.scope = eng.scope;       
    }

    static fromJSON(engine, j) {
        return new EngineForces(engine, j.pistonDiameter, j.crankshaftRadius, j.connectingRodLength);
    }

}


const SUBPARTS = new Map();
SUBPARTS.set("EnginePower",EnginePower);
SUBPARTS.set("EngineForces", EngineForces)


class Engine extends Part {

    constructor(vehicle, displacement, cylinders, compressionRatio, maxPower, rpmMaxPower, intakeType){
        let engineProperties = require("./EngineProperties.json")
        engineProperties.inputParameters.displacement.value = displacement;
        engineProperties.inputParameters.cylinders.value = cylinders
        engineProperties.inputParameters.compressionRatio.value = compressionRatio
        engineProperties.inputParameters.maxPower.value = maxPower
        engineProperties.inputParameters.rpmMaxPower.value = rpmMaxPower
        engineProperties.constants.fuelVolumetricPerformance.value = math.number(intakeType=="N" ? 95 : 100)

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