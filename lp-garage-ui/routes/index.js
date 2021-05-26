var express = require('express');
var router = express.Router();
var vio = require('./vehicleIO');
var unitConverter = require("../model/util").unitConverter


/* GET home page. */
router.get('/', function(req, res, next) {
  vio.getAvailableVehicles()
    .then( r => {
      let pugVars = { "availableVehicles":r.vehicles.sort() }
      if (req.query.vehicleId) {
        pugVars["selectedVehicle"] = req.query.vehicleId
      }
      res.render('index', pugVars);
    })
    .catch( err => {
      err.status=500
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    })
  
});

router.get('/Engine/:subpart', (req,res) => {
  vio.getVehicleFromFile(req.query.vehicleId)
    .then( vehicle => {
      vio.getAvailableVehicles()
        .then(r=> {
          res.render(
            "engine",
            {
              vehicleId:vehicle.id,
              vehicleData:vehicle.toJSON(true),
              part:"Engine",
              page:"Engine",
              subpart:req.params.subpart,
              availableVehicles:r.vehicles.sort(),
              selectedVehicle:vehicle.id
            }
          )
        })
        .catch(e=>{
          throw e
        })
    })
    .catch(err => {
      err.status=500
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    })
})

router.get('/newVehicle', (req,res, next) => {
  res.render('newVehicle', {"hideVehicleSelection":true})
});

router.get('/vehicleData', (req, res, next) => {
  vio.getVehicleFromFile(req.query.vehicleId)
    .then( vehicle => {
      vio.getAvailableVehicles().then ( r => {
        res.render('vehicleData', {
          "vehicleId":vehicle.id, 
          "vehicleData":vehicle.toJSON(true),
          "availableVehicles":r.vehicles.sort(),
          "selectedVehicle":vehicle.id
        })
      } )
      .catch(e => {
        throw e;
      })
    }).catch( err => {
      err.status=500
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    })
  
});

router.get("/vehicles", vio.getVehicles);
router.get("/vehicle/:id", vio.validateVehicleRequest, vio.getVehicle );
router.get("/vehicle/:id/:part", vio.validateVehicleRequest, vio.getVehicle );
router.get("/vehicle/:id/:part/:subpart", vio.validateVehicleRequest, vio.getVehicle );
router.post("/vehicle/:id", vio.validateVehicleRequest, vio.storeNewVehicle);
router.post("/vehicle/:id/:part/:subpart", vio.validateVehicleRequest, vio.createVehiclePart);
router.put("/vehicle/:id", vio.validateVehicleRequest, vio.updateVehicle);
//router.put("/vehicle/:id/:part", vio.validateVehicleRequest, vio.updateVehicle);
//router.put("/vehicle/:id/:part/:subpart", vio.validateVehicleRequest, vio.updateVehicle);

router.get("/unitConversion", (req, res)=>{
  let value=req.query.value;
  let unit=req.query.unit;
  try {
    let result = unitConverter(value, unit);
    res.json({"result":result.toString()})
  } catch (e) {
    console.error(`Error converting from ${value} to ${unit}`, e)
    res.status(500).json({"Error":e.message})
  }
})
module.exports = router;
