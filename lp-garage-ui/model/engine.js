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

class EngineRectification extends Part {
    constructor(eng, intendedCompressionRatio, standardCylinderDiameter, cylinderTopWear, standardCrankJornalDiameter, crankTopWear) {
        let partProperties = require("./EngineRectificationProperties.json")
        partProperties.inputParameters.intendedCompressionRatio.value = intendedCompressionRatio;
        partProperties.inputParameters.standardCylinderDiameter.value = standardCylinderDiameter;
        partProperties.inputParameters.cylinderTopWear.value = cylinderTopWear;
        partProperties.inputParameters.standardCrankJornalDiameter.value = standardCrankJornalDiameter;
        partProperties.inputParameters.crankTopWear.value = crankTopWear;
        super(eng, partProperties);
        this.engine = eng;
        this.scope = eng.scope;
    }

    static fromJSON(eng, j){ 
        return new EngineRectification(
            eng,
            j.intendedCompressionRatio,
            j.standardCylinderDiameter,
            j.cylinderTopWear,
            j.standardCrankJornalDiameter,
            j.crankTopWear
        );
    }
}

class EngineNozzles extends Part {
    constructor(
        engine,
        pretendedGasSpeedinAdmissionValve,
        admissionValvesDiameter,
        cylinderStroke,
        camshaftAdmissionOpen,
        camshaftAdmissionClose,
        camshaftEscapeOpen,
        camshaftEscapeClose
     ) {
        let partProperties = require("./EngineNozzlesProperties.json");
        partProperties.inputParameters.pretendedGasSpeedinAdmissionValve.value = pretendedGasSpeedinAdmissionValve;
        partProperties.inputParameters.admissionValvesDiameter.value = admissionValvesDiameter;
        partProperties.inputParameters.cylinderStroke.value = cylinderStroke;
        partProperties.inputParameters.camshaftAdmissionClose.value = camshaftAdmissionClose;
        partProperties.inputParameters.camshaftAdmissionOpen.value = camshaftAdmissionOpen;
        partProperties.inputParameters.camshaftEscapeOpen.value = camshaftEscapeOpen;
        partProperties.inputParameters.camshaftEscapeClose.value = camshaftEscapeClose;
        super(engine.scope, partProperties);
        this.engine = engine;
        this.scope = engine.scope;
     }

     static fromJSON(engine, j){
         return new EngineNozzles(
             engine, 
             j.pretendedGasSpeedinAdmissionValve,
             j.admissionValvesDiameter,
             j.cylinderStroke,
             j.camshaftAdmissionOpen,
             j.camshaftAdmissionClose,
             j.camshaftEscapeOpen,
             j.camshaftEscapeClose
         )
     }
}


const SUBPARTS = new Map();
SUBPARTS.set("EnginePower",EnginePower);
SUBPARTS.set("EngineForces", EngineForces);
SUBPARTS.set("EngineNozzles", EngineNozzles);
SUBPARTS.set("EngineRectification", EngineRectification);

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