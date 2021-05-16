const math = require("mathjs")
const Part = require("./part").Part;

class EnginePower extends Part {
    constructor(engine, admissionAirPressure, admissionAirTemperature) {
        super(engine.scope)
        this.engine = engine;
        this.scope = engine.scope
        
        this.scope["PA"] = math.unit(admissionAirPressure).to("kPa");
        this.scope["TA"] = math.unit(admissionAirTemperature).to("K");
        this.calculate();
    }
    calculate() {
        // pA: Air density
        math.evaluate("pA = PA/(CA*TA)", this.scope);
        
        // PC: compression pressure
        math.evaluate("PC = (PA*(Vh+VC)^k)/VC^k", this.scope);

        //TC: compression temperature
        math.evaluate("TC = (TA*(Vh+VC)^(k-1))/VC^(k-1)", this.scope);

        // ma: Air mass
        math.evaluate("ma = ((nV*Vh*n*pA)/200)/60s", this.scope);

        // mc: fuel mass
        math.evaluate("mc = ma/afr", this.scope);

        // Qap: Contributed heat
        math.evaluate("Qap = mc*LHV", this.scope);

        // Tz: Combustion temperature
        math.evaluate("Tz = (1 K)*(Qap/(cev*ma)) + TC", this.scope);

        // Pz: Combustion pressure
        math.evaluate("Pz = (Tz*PC)/TC", this.scope);

        // l1: Pressure differential 
        math.evaluate("l1 = Pz/PC", this.scope);        

    }

    /**
     * Permits updating a set of individual properties by its name
     * @param {Map<string,any>} valueMap A map with the properties and values to be updated
     */
     updateValues(valueMap) {
         for (let [key, value] of valueMap) {
            switch (key) {
                case "admissionAirPressure":
                    this.scope["PA"] = math.unit(value).to("kPa");
                    break;
                case "admissionAirTemperature":
                    this.scope["TA"] = math.unit(value).to("K"); 
                    break;
                default:
                    console.warn(`Property ${key} not available in this class`);
            }
         }
         this.calculate()
     }

    static fromJSON(engine, j) {
        return new EnginePower(engine, j.admissionAirPressure, j.admissionAirTemperature)
    }

    toJSON() {
        return {
            'admissionAirPressure':this.returnValue("PA"),
            'admissionAirTemperature':this.returnValue("TA"),
            'unitaryDisplacement':this.returnValue("Vh"),
            "combustionChamberVolume":this.returnValue("VC"),
            "airDensity":this.returnValue("pA"),
            "compressionPressure":this.returnValue("PC"),
            "compressionTemperature":this.returnValue("TC"),
            "airMass":this.returnValue("ma"),
            "fuelMass":this.returnValue("mc"),
            "contributedHeat":this.returnValue("Qap"),
            "combustionTemperature":this.returnValue("Tz"),
            "combustionPressure":this.returnValue("Pz"),
            "pressureDifferential":this.returnValue("l1")
        }
    }

}

class EngineForces extends Part {
    constructor(eng, pistonDiameter, R, L) {
        super(eng.scope);
        this.engine = eng;
        this.scope = eng.scope;       
        this.scope['pd'] = math.unit(pistonDiameter).to("cm");
        this.scope['R'] = math.unit(R).to("cm");
        this.scope['L'] = math.unit(L).to("cm")
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
        super(vehicle.scope)
        this.scope = vehicle.scope;
        this.scope["VH"] = math.unit(displacement).to("m^3");
        this.scope["NC"] = cylinders; //math.unit(cylinders);
        this.scope["RC"] = compressionRatio; //math.unit(compressionRatio);
        this.scope["MP"] = math.unit(maxPower).to("hp");
        this.scope["n"] = rpmMaxPower; //math.unit(rpmMaxPower, "rpm");
        this.scope.intakeType = intakeType
        this.parts={};
        // fuel volumetric performance
        if(intakeType === "N") { // Athmospheric/Carburated
            this.scope["nV"] = 95;
        } else {
            this.scope["nV"] = 100;
        }
        //ENGINE CONSTANTS
        //================
        // CA: Air constant
        this.scope["CA"] = math.unit("0.287 kJ/(kg K)");
        // k: Adiabatic constant
        this.scope["k"] = 1.40;
        // afr: Air-Fuel relation
        this.scope["afr"] = 14.7;
        // LHV: Fuel calorific power
        this.scope["LHV"] = math.unit("44000 kJ/kg");
        // cev: especific heat
        this.scope["cev"] = math.unit("0.718 kJ/kg");
        // n1: policompression coefficient
        this.scope["n1"] = 1.3
        // n2: poliexpanssion coefficient
        this.scope["n2"] = 1.3
        this.calculate()
    }
    
    calculate() {
        // ENGINE CALCULATIONS
        // ===================
        //Vh: unitary displacement
        math.evaluate("Vh = VH/NC", this.scope);

        //VC: combustion chamber volume
        math.evaluate("VC = Vh/(RC - 1)", this.scope);
        for (let partName in this.parts) {
            this.parts[partName].calculate();
        }
    }
    /**
     * Permits updating a set of individual properties by its name
     * @param {Map<string,any>} valueMap A map with the properties and values to be updated
     */
     updateValues(valueMap) {
         console.debug("value map", valueMap);
        for (let [key, value] of valueMap) {
            switch (key) {
                case "displacement": 
                    this.scope["VH"] = math.unit(value).to("m^3"); 
                    break;
                case "cylinders": 
                    this.scope["NC"] = value;
                    break;
                case "compressionRatio": 
                    this.scope["RC"] = value;
                    break;
                case "maxPower": 
                    this.scope["MP"] = math.unit(value).to("hp");
                    break;
                case "rpmMaxPower":
                    this.scope["n"] = value;
                    break;
                case "intakeType":
                    this.scope.intakeType = value;
                    if(value === "N") { // Athmospheric/Carburated
                        this.scope["nV"] = 95;
                    } else {
                        this.scope["nV"] = 100;
                    }
                    break;
                default:
                    console.warn(`Property ${key} not available in this class`);
            }
        }
        this.calculate();
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
        let result = {
            'displacement': this.returnValue("VH"),
            'cylinders': this.returnValue("NC"),
            'compressionRatio': this.returnValue("RC"),
            'maxPower':this.returnValue("MP"),
            'rpmMaxPower':this.returnValue("n"),
            'intakeType':this.scope.intakeType
        }
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