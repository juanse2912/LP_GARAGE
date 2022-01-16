
const math = require("./part").math;
const Part = require("./part").Part;



class Suspenssion extends Part {

    constructor(
        vehicle, 
        AxleWeight, 
        ArmShockDistance, 
        lowerControlArmLenght, 
        shockAngle, 
        suspendedWeights,
        WireSpringDiameter, 
        outerSpringDiameter, 
        mediumSpringDiameter, 
        elasticityCoefficient, 
        coilsNumber, 
        pitchSpring,
        radialDeformation
    ) {
        let SuspenssionProperties = require("./SuspensionProperties.json")
        SuspenssionProperties.inputParameters.AxleWeight.value = AxleWeight;
        SuspenssionProperties.inputParameters.ArmShockDistance.value = ArmShockDistance;
        SuspenssionProperties.inputParameters.lowerControlArmLenght.value = lowerControlArmLenght;
        SuspenssionProperties.inputParameters.shockAngle.value = shockAngle;
        SuspenssionProperties.inputParameters.suspendedWeights.value = suspendedWeights;
        SuspenssionProperties.inputParameters.WireSpringDiameter.value = WireSpringDiameter;
        SuspenssionProperties.inputParameters.outerSpringDiameter.value = outerSpringDiameter;
        SuspenssionProperties.inputParameters.mediumSpringDiameter.value = mediumSpringDiameter;
        SuspenssionProperties.inputParameters.elasticityCoefficient.value = elasticityCoefficient;
        SuspenssionProperties.inputParameters.coilsNumber.value = coilsNumber;
        SuspenssionProperties.inputParameters.pitchSpring.value = pitchSpring;
        SuspenssionProperties.inputParameters.radialDeformation.value = radialDeformation;

        super(vehicle.scope, SuspenssionProperties)
        this.scope = vehicle.scope;
        this.parts = {};
    }

    static fromJSON(vehicle, j) {
        let s = new Suspenssion(
            vehicle, 
            j.AxleWeight,
            j.ArmShockDistance, 
            j.lowerControlArmLenght, 
            j.shockAngle, 
            j.suspendedWeights,
            j.WireSpringDiameter, 
            j.outerSpringDiameter, 
            j.mediumSpringDiameter, 
            j.elasticityCoefficient, 
            j.coilsNumber, 
            j.pitchSpring,
            j.radialDeformation)
  
        return s;
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

module.exports.Suspenssion = Suspenssion;

    