const math = require("./part").math;
const Part = require("./part").Part;



class Suspension extends Part {

    constructor(vehicle, AxleWeight, TireTension, ArmShockDistance, lowerControlArmLenght, shockAngle, suspendedWeights,WireSpringDiameter, outerSpringDiameter, mediumSpringDiameter, elasticityCoefficient, coilsNumber, pitchSpring) {
        let SuspensionProperties = require("./SuspensionProperties.json")
        SuspensionProperties.inputParameters.AxleWeight.value = AxleWeight;
        SuspensionProperties.inputParameters.ArmShockDistance.value = ArmShockDistance;
        SuspensionProperties.inputParameters.lowerControlArmLenght.value = lowerControlArmLenght;
        SuspensionProperties.inputParameters.shockAngle.value = shockAngle;
        SuspensionProperties.inputParameters.suspendedWeights.value = suspendedWeights;
        SuspensionProperties.inputParameters.WireSpringDiameter.value = WireSpringDiameter;
        SuspensionProperties.inputParameters.outerSpringDiameter.value = outerSpringDiameter;
        SuspensionProperties.inputParameters.mediumSpringDiameter.value = mediumSpringDiameter;
        SuspensionProperties.inputParameters.elasticityCoefficient.value = elasticityCoefficient;
        SuspensionProperties.inputParameters.coilsNumber.value = coilsNumber;
        SuspensionProperties.inputParameters.pitchSpring.value = pitchSpring;
        SuspensionProperties.inputParameters.radialDeformation.value = pitchSpring;

        super(vehicle.scope, SuspensionProperties)
        this.scope = vehicle.scope;
        this.parts = {};
    }

    static fromJSON(vehicle, j) {
        let Suspension = new Suspension(vehicle, AxleWeight, TireTension, ArmShockDistance, lowerControlArmLenght, shockAngle, suspendedWeights,WireSpringDiameter, outerSpringDiameter, mediumSpringDiameter, elasticityCoefficient, coilsNumber, pitchSpring);
        for( let [partName, classH] of SUBPARTS) {
            if(j[partName]) {
                Suspension.parts[partName] = classH.fromJSON(Suspension, j[partName]);
            }
        }
        return Suspension;
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

module.exports.Suspension = Suspension;

    