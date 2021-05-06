const math = require("mathjs")


class Engine {
    constructor(displacement, cylinders, compressionRatio, maxPower, rpmMaxPower, intakeType, admissionAirPressure, admissionAirTemperature){
        this.engineData = {};
        this.engineData["VH"] = math.unit(displacement).to("m^3");
        this.engineData["NC"] = math.unit(cylinders);
        this.engineData["RC"] = math.unit(compressionRatio);
        this.engineData["PA"] = math.unit(admissionAirPressure).to("kPa");
        this.engineData["TA"] = math.unit(admissionAirTemperature).to("K");
        this.engineData["n"] = math.unit(rpmMaxPower);
        
        // fuel volumetric performance
        if(intakeType === "N") { // Athmospheric/Carburated
            this.engineData["nV"] = 95;
        } else {
            this.engineData["nV"] = 100;
        }


        //ENGINE CONSTANTS
        //================
        // CA: Air constant
        this.engineData["CA"] = 0.287;
        // k: Adiabatic constant
        this.engineDAta["k"] = 1.40;
        // afr: Air-Fuel relation
        this.engineData["afr"] = 14.7;
        // LHV: Fuel calorific power
        this.engineData["LHV"] = math.unit("44000 kJ/kg");
        // cev: especific heat
        this.engineData["cev"] = math.unit("0.718 kJ/kg");
        // n1: policompression coefficient
        this.engineData["n1"] = 1.3
        // n2: poliexpanssion coefficient
        this.engineData["n2"] = 1.3

        // ENGINE CALCULATIONS
        // ===================
        //Vh: unitary displacement
        math.evaluate("Vh = VH/NC", this.engineData);

        //VC: combustion chamber volume
        math.evaluate("VC = Vh/(RC-1)", this.engineData);

        // pA: Air density
        math.evaluate("pA = PA/(CA*TA)", this.engineData);
        
        // PC: Combustion pressure
        math.evaluate("PC = (PA*(Vh+VC)^k)/VC^k", this.engineData);

        //TC: compression temperature
        math.evaluate("TC = (TA*(Vh+VC)^(k-1))/VC^(k-1)", this.engineData);

        // ma: Air mass
        math.evaluate("ma = ((nV*Vh*n*pA)/200)/60", this.engineData);

        // mc: fuel mass
        math.evaluate("mc = ma/afr", this.engineData);

        // Qap: Contributed heat
        math.evaluate("Qap = mc/LHV", this.engineData);

        // Tz: Combustion temperature
        math.evaluate("Tz = (Qap/(cev+ma)) + TC", this.engineData);

        // Pz: Combustion pressure
        math.evaluate("Pz =(Tz*PC)/TC", this.engineData);

        // l1: Pressure differential 
        math.evaluate("l1 = PC/Pz", this.engineData);

        // Pi: Medium indicated pressure
        math.evaluate("", this.engineData); //TODO


    }

    _returnValue(vn, units) {
        if(units) {
            return this.engineData[vn].to(units).toString();
        } else {
            return this.engineData[vn].toString();
        }
    }

    unitaryDisplacement(units) {
        return this._returnValue("Vh", units)
       
    }

    chamberVolume(units) {
        return this._returnValue("VC", units)
    }

    airDensity(units) {
        return this._returnValue("pA", units) ;
    }

    compressionPressure(units) {
        return this._returnValue("PC", units)
    }

    compressionTemperature(units) {
        return this._returnValue("TC", units)
    }

    airMass(units) {
        return this._returnValue("ma", units)
    }

    fuelMass(units) {
        return this._returnValue("mc", units)
    }

    contributedHeat(units) {
        return this._returnValue("Qap", units)
    }
    
    combustionTemperature(units) {
        return this._returnValue("Tz", units)
    }

    combustionPressure(units) {
        return this._returnValue("Pz", units)
    }
}