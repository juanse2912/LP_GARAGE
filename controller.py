
FUEL_DATA = {
    "Gasoline": {
        "CalorificPower":44000
    },
    "Diesel": {
        "CalorificPower":43000
     }
}


class Vehicle:
    
    def __init__(self, make, model, year)
        self.make = make
        self.model = model
        self.year = year
        #TODO: search data library to get vehicle data
    def setEngine(eng):
        self.engine = eng
        

class EngineCycle:
    def __init(self, presure, temperature):
        self.presure = presure
        self.temperature = temperature
        
class AdmissionCycle(EngineCycle):
    def __init__(self, presure, temperature, gasSpeedOnValves):
        self.presure = presure
        self.temperature = temperature
        self.gasSpeedOnValves = gasSpeedOnValves
    def getPresureDiferential():
        #TODO calculate and return values
        return 0

        
class Engine:
    
    def __init__(self, displacement, chambers, maxRPM, compressionRatio, fuel, camshaftAngles, strokes)
        self.displacement = displacement
        self.chambers = int(chambers)
        self.maxRPM = int(maxRPM)
        self.compressionRatio = compressionRatio
        self.strokes = int(strokes)
        
        if fuel in FUEL_DATA:
            self.fuel = FUEL_DATA[fuel]
        else
            raise Exception("Invalid fuel name")
            
        if isinstance(camshaftAngles, List) and len(camshaftAngles) == 4:
            self.camshaftAngles = camshaftAngles
        else 
            raise Exception("Camshaft angles should be a list of 4 integers")
            
    def getUnitaryDisplacement(self):
        #TODO calculate and return values
        return 0
        
    def getChamberVolume(self):
        #TODO calculate and return values
        return 0
    
    @property
    def admissionCycle(self):
        return self.admissionCycle
        
    @admissionCycle.setter(self, ac):
        self.admissionCycle = ac
        
