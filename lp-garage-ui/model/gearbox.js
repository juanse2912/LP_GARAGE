const math = require("./part").math;
const Part = require("./part").Part;


class Gearbox extends Part {

    constructor(vehicle, tyrewidth, tyreprofile, tyrerim, diffratio, rpmMaxPower, firstgearratio, secondgearratio, thirdgearratio, fourthgearratio, fithgearratio, sixthgearratio, reversegearratio, piniongearteeth, crowngearteeth, newtyrewidth, newtyreprofile, newtyrerim, firstgearz1, firstgearz2, secondgearz1, secondgearz2, thirdgearz1, thirdgearz2, fourthgearz1, fourthgearz2, fithgearz1, fithgearz2, sixthgearz1, sixthgearz2, reversegearz1, reversegearz2){
        let gearboxProperties = require("./GearboxProperties.json")
        gearboxProperties.inputParameters.tyrewidth.value = tyrewidth
        gearboxProperties.inputParameters.tyreprofile.value = tyreprofile
        gearboxProperties.inputParameters.tyrerim.value = tyrerim
        gearboxProperties.inputParameters.diffratio.value = diffratio
        gearboxProperties.inputParameters.rpmMaxPower.value = rpmMaxPower
        gearboxProperties.inputParameters.firstgearratio.value = firstgearratio
        gearboxProperties.inputParameters.secondgearratio.value = secondgearratio
        gearboxProperties.inputParameters.thirdgearratio.value = thirdgearratio
        gearboxProperties.inputParameters.fourthgearratio.value = fourthgearratio
        gearboxProperties.inputParameters.fithgearratio.value = fithgearratio
        gearboxProperties.inputParameters.sixthgearratio.value = sixthgearratio
        gearboxProperties.inputParameters.reversegearratio.value = reversegearratio
        gearboxProperties.inputParameters.piniongearteeth.value = piniongearteeth
        gearboxProperties.inputParameters.crowngearteeth.value = crowngearteeth
        gearboxProperties.inputParameters.newtyrewidth.value = newtyrewidth
        gearboxProperties.inputParameters.newtyreprofile.value = newtyreprofile
        gearboxProperties.inputParameters.newtyrerim.value = newtyrerim
        gearboxProperties.inputParameters.firstgearz1.value = firstgearz1
        gearboxProperties.inputParameters.firstgearz2.value = firstgearz2
        gearboxProperties.inputParameters.secondgearz1.value = secondgearz1
        gearboxProperties.inputParameters.secondgearz2.value = secondgearz2
        gearboxProperties.inputParameters.thirdgearz1.value = thirdgearz1
        gearboxProperties.inputParameters.thirdgearz2.value = thirdgearz2
        gearboxProperties.inputParameters.fourthgearz1.value = fourthgearz1
        gearboxProperties.inputParameters.fourthgearz2.value = fourthgearz2
        gearboxProperties.inputParameters.fithgearz1.value = fithgearz1
        gearboxProperties.inputParameters.fithgearz2.value = fithgearz2
        gearboxProperties.inputParameters.sixthgearz1.value = sixthgearz1
        gearboxProperties.inputParameters.sixthgearz2.value = sixthgearz2
        gearboxProperties.inputParameters.reversegearz1.value = reversegearz1
        gearboxProperties.inputParameters.reversegearz2.value = reversegearz2

        super(vehicle.scope, GearboxProperties)
        this.scope = vehicle.scope;
        this.parts = {};
    }
    


    static fromJSON(vehicle, j) {
        let gearbox = new Gearbox(vehicle, j.tyrewidth,j.tyreprofile, j.tyrerim, j.diffratio, j.rpmMaxPower, j.firstgearratio, j.secondgearratio, j.thirdgearratio, j.fourthgearratio, j.fithgearratio, j.sixthgearratio, j.reversegearratio, j.piniongearteeth, j.crowngearteeth, j.newtyrewidth, j.newtyreprofile, j.newtyrerim, j.firstgearz1, j.firstgearz2, j.secondgearz1, j.secondgearz2, j.thirdgearz1, j.thirdgearz2, j.fourthgearz1, j.fourthgearz2, j.fithgearz1, j.fithgearz2, j.sixthgearz1, j.sixthgearz2, j.reversegearz1, j.reversegearz2);
        for( let [partName, classH] of SUBPARTS) {
            if(j[partName]) {
                gearbox.parts[partName] = classH.fromJSON(Gearbox, j[partName]);
            }
        }
        return gearbox;
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

module.exports.Gearbox = Gearbox;