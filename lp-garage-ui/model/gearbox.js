const math = require("./part").math;
const Part = require("./part").Part;

function templateReplacer(str, n) {
    const r1 = /(\$\{[n+-1]{1,3}\})/gm
    const r2 = /\$\{([n+-1]{1,3})\}/

    const macros = str.match(r1)
    for (let m of macros) {
        let v = r2.exec(m)
        str = str.replace(m, eval(v[1]))
    }
    return str;
}


class Gearbox extends Part {

    constructor(vehicle, gearCount, diffRatio, maximumRPM, gearRatios){

        let gearboxProperties = require("./GearboxProperties.json")
        gearboxProperties.inputParameters.gearCount.value = gearCount;
        gearboxProperties.inputParameters.diffRatio.value = diffRatio;
        gearboxProperties.inputParameters.maximumRPM.value = maximumRPM;
        for (let i=1; i<=parseInt(gearCount); i++) {
            gearboxProperties.inputParameters[`gearRatio_${i}`] = {};
            gearboxProperties.inputParameters[`gearRatio_${i}`]['value'] = gearRatios[i-1]
            gearboxProperties.inputParameters[`gearRatio_${i}`]['alias'] = `GR_${i}`
            if (i<parseInt(gearCount)) {
                for (let ft of Object.keys(gearboxProperties.formula_templates)){
                    gearboxProperties.formulas[`${ft}_${i}`] = {};
                    gearboxProperties.formulas[`${ft}_${i}`].alias = 
                        templateReplacer(gearboxProperties.formula_templates[ft].alias, i)
                    gearboxProperties.formulas[`${ft}_${i}`].formula = 
                        templateReplacer(gearboxProperties.formula_templates[ft].formula, i)
                }
            }
            
        }
        console.debug("Gearbox properties", gearboxProperties);
        gearboxProperties.inputParameters.gearCount.value=parseInt(gearCount);
        super(vehicle.scope, gearboxProperties)
        this.scope = vehicle.scope;
        this.parts = {};
    }
    

    static fromJSON(vehicle, j) {
        let params = [];

        for(let i=1; i<=parseInt(j.gearCount); i++) {
            params.push(j['gearRatio_'+i]);
        }

        console.debug("Gear ratios", params);
        let gearbox = new Gearbox(vehicle, j.gearCount, j.diffRatio, j.maximumRPM, params);
        for( let [partName, classH] of SUBPARTS) {
            if(j[partName]) {
                gearbox.parts[partName] = classH.fromJSON(Gearbox, j[partName]);
            }
        }
        return gearbox;
    }

    /**
     * @override
     * @param {Map<string,any>} valueMap 
     */
    updateValues(valueMap) {
        
        //if(valueMap.has("gearCount")) {
            if(this.partProperties.gearCount.value>parseInt(valueMap.get("gearCount"))){
                for(let i=parseInt(valueMap.get(gearCount))+1; i<this.partProperties.gearCount; i++) {
                    delete this.partProperties.inputParameters[`gearRatio_${i}`]
                    for (let key of Object.keys(this.partProperties.formula_templates)) {
                        delete this.partProperties.formulas[`${key}_${i}`]
                    }
                }
                this.partProperties.gearCount=valueMap.get("gearCount")
            } else if(this.partProperties.gearCount.value>parseInt(valueMap.get("gearCount"))) {
                for(let i=this.partProperties.gearCount.value+1; i<=parseInt(valueMap.get("gearCount")); i++) {
                    this.partProperties.inputParameters[`gearRatio_${i}`]['alias'] = `GR_${i}`
                    this.partProperties.inputParameters[`gearRatio_${i}`]['value'] = 
                        valueMap.has(`gearRatio_${i}`) ? valueMap.get(`gearRatio_${i}`) : this.partProperties.inputParameters[`gearRatio_${i-1}`].value
                    for(let key of Object.keys(this.partProperties.formula_templates)) {
                        this.partProperties.formulas[`${key}_${i}`].alias = 
                            templateReplacer(this.partProperties.formula_templates[key].alias, i)
                        this.partProperties.formulas[`${key}_${i}`].formula =
                            templateReplacer(this.partProperties.formula_templates[key].formula, i)
                    }
                }
                this.partProperties.gearCount=valueMap.get("gearCount")
            }
            for (let [key, value] of valueMap) {
                if (key!="gearCount" ) {
                    if(this.partProperties.inputParameters.hasOwnProperty(key)) {
                        let alias = this.partProperties.inputParameters[key].alias;
                        let units = this.partProperties.inputParameters[key].units;
                        this.partProperties.inputParameters[key].value = value;
                        if(units) {
                            this.scope[alias] = math.unit(value).to(units);
                        } else {
                            this.scope[alias] = math.bignumber(value);
                        }
                    }
                }
            }

//        } else {
//            super(valueMap)
//        }

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