const math = require("./part").math;
const Part = require("./part").Part;


class Brakes extends Part {

    constructor(vehicle, wheelbase, trackWidth, frontAxleWeightLeveled, rearAxleElevationHeight, frontAxleWeightWithRearAxleElevated, frontAxleWeigh, rearAxleWeight, brakePumpPistonDiameter, numberOfCaliperPiston, caliperPistonDiameter, padFrictionCoefficient, padWidth, speedBeforeBraking, appliedForceInBrakePedal, tireFrictionCoefficient){
        let brakesGeneralProperties = require("./BrakesGeneralProperties.json")
        brakesGeneralProperties.inputParameters.wheelbase.value = wheelbase;
        brakesGeneralProperties.inputParameters.trackWidth.value = trackWidth
        brakesGeneralProperties.inputParameters.frontAxleWeightLeveled.value = frontAxleWeightLeveled
        brakesGeneralProperties.inputParameters.rearAxleElevationHeight.value = rearAxleElevationHeight
        brakesGeneralProperties.inputParameters.frontAxleWeightWithRearAxleElevated.value = frontAxleWeightWithRearAxleElevated
        brakesGeneralProperties.inputParameters.rearAxleWeight.value = rearAxleWeight
        brakesGeneralProperties.inputParameters.brakePumpPistonDiameter.value = brakePumpPistonDiameter
        brakesGeneralProperties.inputParameters.numberOfCaliperPiston.value = numberOfCaliperPiston
        brakesGeneralProperties.inputParameters.caliperPistonDiameter.value = caliperPistonDiameter
        brakesGeneralProperties.inputParameters.padFrictionCoefficient.value = padFrictionCoefficient
        brakesGeneralProperties.inputParameters.padWidth.value = padWidth
        brakesGeneralProperties.inputParameters.speedBeforeBraking.value = speedBeforeBraking
        brakesGeneralProperties.inputParameters.appliedForceInBrakePedal.value = appliedForceInBrakePedal
        brakesGeneralProperties.inputParameters.tireFrictionCoefficient.value = tireFrictionCoefficient
        //brakesGeneralProperties.inputParameters.actualDistanceOfBraking.value = actualDistanceOfBraking;
        super(vehicle, brakesGeneralProperties);
        this.scope = vehicle.scope;

    }
    
    static fromJSON(vehicle, j) {
        let brakes = new Brakes(
            vehicle, 
            j.wheelbase, 
            j.trackWidth, 
            j.frontAxleWeightLeveled, 
            j.rearAxleElevationHeight, 
            j.frontAxleWeightWithRearAxleElevated, 
            j.frontAxleWeigh, 
            j.rearAxleWeight, 
            j.brakePumpPistonDiameter, 
            j.numberOfCaliperPiston, 
            j.caliperPistonDiameter, 
            j.padFrictionCoefficient, 
            j.padWidth, 
            j.speedBeforeBraking, 
            j.appliedForceInBrakePedal, 
            j.tireFrictionCoefficient
        );

    }

    toJSON(includeSubparts) {
        let result = super.toJSON();
        return result;
    }


}

module.exports.Brakes = Brakes;