const fs = require('fs').promises;
const path = require('path');
const Vehicle = require('../model/vehicle').Vehicle;
const fsconstants = require('fs').constants;
const DIR = "../vehicles/"

/**
 * Stores JSON serialized vehicle with its existing parts to disk
 * @param {Vehicle} vehicle The vehicle to be saved
 * @returns {Promise<any|Error>}
 */
async function saveVehicleFile(vehicle) {
    return new Promise((resolve, reject) => {
        let filepath = path.join(__dirname, DIR, `${vehicle.id}.json`);
        let vdata = vehicle.toJSON(true);
        let data = Buffer.from(
            JSON.stringify(vdata, null, 2),
            "utf-8"
        )
        fs.writeFile(filepath, data)
            .then(() => {
                resolve(vdata);
            })
            .catch(e => {
                reject(e);
            })
    })
}

/**
 * Reads vehicle data from disk and unserializes it
 * @param {string} id The vehicle id
 * @returns {Promise<Vehicle>} The unserialized instance of Vehicle from disk
 */
async function getVehicleFromFile(id) {
    console.debug(`Reading vehicle: ${id}`)
    return new Promise((resolve, reject) => {
        let filepath = path.join(__dirname, DIR, `${id}.json`);
        fs.access(filepath, fsconstants.R_OK)
            .then(() => {
                fs.readFile(filepath, "utf-8")
                    .then(data => {
                        let vehicle = Vehicle.fromJSON(JSON.parse(data))
                        console.debug("Vehicle data", vehicle)
                        resolve(vehicle)
                    })
                    .catch(e => {
                        reject(e);
                    })
            })
            .catch(e => {
                reject(e);
            })
    })
}

module.exports.getVehicleFromFile = getVehicleFromFile;

module.exports.validateVehicleRequest = function (req, res, next) {
    if (!req.params.id) {
        res.status(412).json({ "Error": "Missing vehicle id" })
    } else {
        console.debug("Valid request")
        next()
    }
}

/**
 * List of available vehicles
 * @typedef availableVehicles
 * @property {string[]} vehicles
 */

/**
 * Provides a list of vehicles that have been saved
 * @returns {Promise<availableVehicles>} A list of the vehicles that have been saved
 */
async function getAvailableVehicles() {
    return new Promise( (resolve, reject) => {
        fs.readdir(path.join(__dirname, DIR))
        .then(files => {
            let r = { "vehicles": [] }
            for (let f of files) {
                r.vehicles.push(f.substr(0, f.lastIndexOf(".")));
            }
            resolve(r)
        })
        .catch(e => {
            reject(e)
        })
    })
}

module.exports.getAvailableVehicles = getAvailableVehicles;

/**
 * Gets a list of available vehicles and return it
 * @param express.req req
 * @param express.res res
 */
module.exports.getVehicles = function (req, res) {
    getAvailableVehicles()
        .then( r => {
            res.json(r);
        })
        .catch( e => {
            console.error(e);
            res.status(500).json({ "Error": e.message });
        })
}

/**
 * Returns the data of a vehicle, part or subpart
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
module.exports.getVehicle = function (req, res) {
    getVehicleFromFile(req.params.id)
        .then(vehicle => {
            if (req.params.part) {
                let part = vehicle.getPart(req.params.part);
                if (req.params.subpart) {
                    let subpart = part.getPart(req.params.subpart);
                    res.json(subpart.toJSON())
                } else {
                    res.json(part.toJSON(false));
                }
            } else {
                res.json(vehicle.toJSON(true));
            }
        })
        .catch(e => {
            console.error(e);
            res.status(500).json("Error getting Vehicle data: " + e.message)
        })
}


module.exports.storeNewVehicle = function (req, res) {
    let storeVehicle = new Promise((resolve, reject) => {
        //TODO: validate JSON schema
        let vehicleData = req.body;
        if (vehicleData.id && vehicleData.make && vehicleData.model && vehicleData.year) {
            let vehicle = Vehicle.fromJSON(vehicleData);
            let filepath = path.join(__dirname, DIR, `${req.params
                .id}.json`);
            let data = Buffer.from(JSON.stringify(vehicle.toJSON(true), null, 2));
            fs.writeFile(filepath, data)
                .then(() => { resolve(vehicle) })
                .catch(e => { reject(e) });

        } else {
            reject(new Error("Malformed vehicle data"));
        }
    });


    let filepath = path.join(__dirname, DIR, `${req.params.id}.json`);
    fs.access(filepath, fsconstants.W_OK)
        .then(() => {
            if (req.query("overwrite") === "true") {
                storeVehicle
                    .then(v => { res.json(v.toJSON()) })
                    .catch(e => {
                        console.error(e);
                        res.status(500).json("Error storing vehicle: " + e.message)
                    })
            } else {
                res.status(409).json({ "Error": "File already exists. Set ?overwrite=true to overwrite" });
            }
        })
        .catch(err => {
            // File does not exist
            storeVehicle
                .then(v => { res.json(v.toJSON()) })
                .catch(e => {
                    console.error(e);
                    res.status(500).json("Error storing vehicle: " + e.message)
                })
        });

}

module.exports.updateVehicle = function (req, res) {
    getVehicleFromFile(req.params.id)
        .then(vehicle => {
            let workingObject = null
            if (!req.params.part) {
                workingObject = vehicle;
            } else {
                let part = vehicle.getPart(req.params.part);
                if (!part) {
                    //Can't update an unexisting part
                    throw new Error(`Vehicle does not have the ${req.params.part} defined`)
                }
                if (!req.params.subpart) {
                    workingObject = part;
                } else {
                    workingObject = part.getPart(req.params.subpart);
                    if (!workingObject) {
                        throw new Error(`${req.params.part} does not have the ${req.params.subpart} defined`);
                    }
                }

            }
            let valueMap = new Map();
            for (let key in req.query) {
                valueMap.set(key, req.query[key])
            }
            workingObject.updateValues(valueMap);

            saveVehicleFile(vehicle)
                .then(vdata => {
                    res.json(workingObject.toJSON())
                })
                .catch(e => {
                    console.error("Error saving vehicle file", e);
                    res.status(500).json({ "Error": "Error saving vehicle file: " + e.message })
                })
        }).catch(e => {
            console.error("Error updating vehicle/part", e);
            if (e.code) {
                res.status(500).json({ "Error": "Failed to read vehicle: " + e.message })
            } else {
                res.status(412).json({ "Error": e.message })
            }
        });

}

module.exports.createVehiclePart = function (req, res) {
    getVehicleFromFile(req.params.id)
        .then(vehicle => {
            if (req.params.subpart) {
                let part = vehicle.getPart(req.params.part)
                if (!part) {
                    throw new Error(`Vehicle missing ${part}`)
                }
                console.debug("part data", req.body);
                part.addPart(req.params.subpart, req.body);
            } else {
                vehicle.addPart(req.params.part, req.body);
            }
            saveVehicleFile(vehicle).then(vdata => {
                res.json(vdata);
            }).catch(e => {
                console.error("Error saving vehicle", e)
                res.status(500).json({ "Error": "Unable to save vehicle data: " + e.message })
            });
        })
        .catch(e => {
            console.error("Error updating vehicle/part", e);
            if (e.code) {
                res.status(500).json({ "Error": "Failed to read vehicle: " + e.message })
            } else {
                res.status(412).json({ "Error": e.message })
            }
        });
}