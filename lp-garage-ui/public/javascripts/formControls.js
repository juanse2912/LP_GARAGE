'use strict'

var timeoutHandler=null;

/**
 * When an data-bound element referencesa subpart, it uses the 
 * <Part>.<element> notation. This function allows to retrive
 * the node from the `vehicleData` object.
 * @param {string} name The name of the element
 * @returns {object} The node in vehicleData referenced by name
 */
function getDataElement(name) {
    let p = name.split(".")
    return p.reduce( (obj,node) => {
      return (obj||{})[node]
    }, vehicleData)
    /*
    let tags = name.split(".")
    let result = vehicleData;
    if (partName!="Vehicle") {
      result = vehicleData[partName];
    }
    
    for (let tag of tags) {
        if(result[tag]) {
            result = result[tag]
        } else {
            console.error(`Invalid vehicle data element ${name}`);
            return null
        }
    }
    return result;
    */
}

/**
 * Configures an event listener on unit selection controls
 */
function setUnitSelectEventListener() {
    let unitSelects = document.querySelectorAll("select.unit");
    for(let select of unitSelects) {
        select.addEventListener("change", (event)=>{
            let srcSelect = event.target;
            let targetInputId = srcSelect.getAttribute("data-from")
            let targetInput = document.querySelector(`input#${targetInputId}`)
            let dataElement = getDataElement(targetInput.getAttribute("data-bound"))
            fetch(`/unitConversion?value=${encodeURI(dataElement)}&unit=${srcSelect.value}`, {"method":"get"})
                .then(res=>res.json())
                .then(jsonData=>{
                    if(jsonData.result) {
                        targetInput.value=jsonData.result.split(" ")[0]
                        let event=new Event("change", {bubbles:true});
                        targetInput.dispatchEvent(event);
                    } else {
                        showAlert("Error en la conversión de unidades: " + jsonData.Error)
                        console.error("Error converting units: " + JSON.stringify(jsonData))
                    }
                })
                .catch(e=>{
                    showAlert("Error en la conversión de unidades: " + e.message)
                    console.error("Error converting units", e)
                })

        })
    }
}

/**
 * Finds modified items on the form and places update requests to the backend
 */
function saveChanges() {
  let inputCollection = document.querySelectorAll("input[data-bound].updated");
  let queryParameters = []
  for (let input of inputCollection) {
    input.classList.remove("updated")
    let inputId = input.getAttribute("id")
    let inputValue = input.value
    let dataElement = input.getAttribute("data-bound")
    let unitSelect = document.querySelector(`select.unit[data-from=${inputId}]`)
    if (unitSelect) {
        inputValue += " " + unitSelect.value
    }
    queryParameters.push( `${dataElement}=${encodeURI(inputValue)}`)
  }       
  let queryString = queryParameters.join("&");
  
 
  console.log("updating changes...")
  fetch(`/vehicle/${vehicleData.id}?${queryString}`, {"method":"put"})
    .then( res => res.json())
    .then( jsonData => {
      console.log("update done");
      vehicleData = jsonData;
      updateDataBoundElements();
    })
    .catch(e => {
        showAlert("Error actualizando datos del vehículo. " + e.messaage)
        console.error("Error updating vehicle", e)
    });    
}

function separateValueAndUnits(s) {
  let result = {};
  if (s.indexOf(" ")<=0) {
    result["value"] = s;
  } else {
    result["value"] = s.substr(0, s.indexOf(" "))
    result["units"] = s.substr(s.indexOf(" "), s.length - s.indexOf(" ")).trim()  
  }
  return result;
}

function updateDataBoundElements() {
  let elementCollection = document.querySelectorAll("[data-bound]")
  for (let element of elementCollection){
    let dataElement = getDataElement(element.getAttribute("data-bound"));
    switch (element.nodeName) {
      case "DIV":
      case "SPAN":
      case "P":
      case "TD":
        //element.innerText = dataElement;
        updateCalculatedDataElement(dataElement,element.getAttribute("data-bound"))
        break;
      case "INPUT":
        if (["text","number","range"].includes(element.type.toLowerCase())){
          let vu = separateValueAndUnits(dataElement);
          if (vu.units) {
            let valueSelect = document.querySelector(`[data-from='${element.id}']`);
            if (valueSelect && valueSelect.value!=vu.units) {
              valueSelect.value = vu.units;
            } else if(!valueSelect){
              console.warn("Can't find units for "+ `[data-from="${element.id}"]`)
            }
            
          }
          if(element.value != vu.value) {
            element.value = vu.value;
            element.classList.remove("is-invalid");
          }
        } else if(["radio,checkbox"].includes(element.type.toLowerCase()) ) {
          if(element.value == dataElement) {
            element.addAttribute("checked",true);
          } else {
            element.removeAttribute("checked");
          }
        }
        break;
    }
  }

}

/**
 * Sets a listener on editable valid fields to schedule
 * the saveChanges() function
 */
function setInputEventListener(){
    let inputCollection = document.querySelectorAll("input,radio,checkbox[data-bound]");
    for (let input of inputCollection) {
        input.addEventListener("change", (event)=>{
            
            if (event.target.checkValidity()){
                event.target.classList.remove("is-invalid")
                event.target.classList.add("updated")
                if (timeoutHandler) {
                    clearTimeout(timeoutHandler)
                }
                timeoutHandler = setTimeout(saveChanges, 500)
            } else {
                event.target.classList.add("is-invalid")
            }
        })
    }
}
/**
 * Sets an event listener on units drop-downs beside calculated values.
 */
function setUnitButtonListener() {
  let lnkColl = document.querySelectorAll("a.unit")
  for (let lnk of lnkColl) {
    lnk.addEventListener("click", e=>{
      let dataElementName = e.target.getAttribute("data-from")
      let dataElement = getDataElement(dataElementName);
      let unit = e.target.getAttribute("data-unit")
      fetch(
        `/unitConversion?value=${encodeURI(dataElement)}&unit=${unit}`,
        {"method":"get"}
      )
        .then( response => response.json())
        .then( jsonData => {
          if(jsonData.result) {
            updateCalculatedDataElement(jsonData.result, dataElementName)
          } else {
            showAlert("Error transformando unidades", "ERROR")
          }
          
        })
        .catch(e => {
          console.error(e);
          showAlert("Error transformando unidades: " +  e.message)
        })
    })
  }
}

/**
 * Updates a calculated field and the units drop-down besides it (if present)
 * @param {string} value The value to be set on the page
 * @param {string} elementName The name of the data-bound element
 */
function updateCalculatedDataElement(value, elementName) {
  let vu=separateValueAndUnits(value);
  let el = document.querySelector(`span[data-bound='${elementName}']`)
  el.firstChild.textContent = vu.value;
  if(vu.units) {
    let unitDisplay = vu.units;
    let unitOptions = el.querySelectorAll("a.unit");
    for(let opt of unitOptions) {
      if (opt.getAttribute("data-unit")==vu.units) {
        unitDisplay = opt.innerText
      }
    }
    el.querySelector(".btn-group .btn").innerText = unitDisplay
  }

}



