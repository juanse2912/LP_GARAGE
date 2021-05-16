var express = require('express');
var router = express.Router();
var vio = require('./vehicleIO');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/vehicles", vio.getVehicles);
router.get("/vehicle/:id", vio.validateVehicleRequest, vio.getVehicle );
router.get("/vehicle/:id/:part", vio.validateVehicleRequest, vio.getVehicle );
router.get("/vehicle/:id/:part/:subpart", vio.validateVehicleRequest, vio.getVehicle );
router.post("/vehicle/:id", vio.validateVehicleRequest, vio.storeNewVehicle);
router.post("/vehicle/:id/:part/:subpart", vio.validateVehicleRequest, vio.createVehiclePart);
router.put("/vehicle/:id", vio.validateVehicleRequest, vio.updateVehicle);
router.put("/vehicle/:id/:part", vio.validateVehicleRequest, vio.updateVehicle);
router.put("/vehicle/:id/:part/:subpart", vio.validateVehicleRequest, vio.updateVehicle);

module.exports = router;
