const math = require("./part").math;
const Part = require("./part").Part;

const SUBPARTS = new Map();
SUBPARTS.set("BrakesAxles",BrakesAxles);

class Brakes extends Part {

    constructor(vehicle, wheelbase, trackWidth, frontAxleWeightLeveled, rearAxleElevationHeight, frontAxleWeightWithRearAxleElevated, frontAxleWeigh, rearAxleWeight, brakePumpPistonDiameter, numberOfCaliperPiston, caliperPistonDiameter, padFrictionCoefficient, padWidth, speedBeforeBraking, actualDistanceOfBraking){
        let brakesGeneralProperties = require("./BrakesGeneralProperties.json")
        brakesGeneralProperties.inputParameters.wheelbase.value = wheelbase;
        brakesGeneralProperties.inputParameters.trackWidth.value = trackWidth
        brakesGeneralProperties.inputParameters.frontAxleWeightLeveled.value = frontAxleWeightLeveled
        brakesGeneralProperties.inputParameters.rearAxleElevationHeight.value = rearAxleElevationHeight
        brakesGeneralProperties.inputParameters.frontAxleWeightWithRearAxleElevated.value = frontAxleWeightWithRearAxleElevated
        brakesGeneralProperties.inputParameters.frontAxleWeigh.value = frontAxleWeigh;
        brakesGeneralProperties.inputParameters.rearAxleWeight.value = rearAxleWeight
        brakesGeneralProperties.inputParameters.brakePumpPistonDiameter.value = brakePumpPistonDiameter
        brakesGeneralProperties.inputParameters.numberOfCaliperPiston.value = numberOfCaliperPiston
        brakesGeneralProperties.inputParameters.caliperPistonDiameter.value = caliperPistonDiameter
        brakesGeneralProperties.inputParameters.padFrictionCoefficient.value = padFrictionCoefficient
        brakesGeneralProperties.inputParameters.padWidth.value = padWidth
        brakesGeneralProperties.inputParameters.speedBeforeBraking.value = speedBeforeBraking
        brakesGeneralProperties.inputParameters.actualDistanceOfBraking.value = actualDistanceOfBraking;

    }
    
    static fromJSON(vehicle, j) {
        let brakes = new Brakes(vehicle, j.wheelbase, j.trackWidth, j.compressionRatio, j.frontAxleWeightLeveled, j.rearAxleElevationHeight, j.frontAxleWeightWithRearAxleElevated, j.frontAxleWeigh, j.rearAxleWeight, j.brakePumpPistonDiameter, j.numberOfCaliperPiston, j.caliperPistonDiameter, j.padFrictionCoefficient, j.padWidth, j.speedBeforeBraking, j.actualDistanceOfBraking);
        for( let [partName, classH] of SUBPARTS) {
            if(j[partName]) {
                brakes.parts[partName] = classH.fromJSON(brakes, j[partName]);
            }
        }
        return brakes;
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

module.exports.Brakes = Brakes;