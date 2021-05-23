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
            fetch(`unitConversion?value=${encodeURI(dataElement)}&unit=${srcSelect.value}`, {"method":"get"})
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
  let url = "/vehicle/" + vehicleData.id;
  if (partName!="Vehicle") {
    url += "/"+part
  }
  if (subpartName!="") {
    url += "/" + subpartName
  }
  console.log("updating changes...")
  fetch(`${url}?${queryString}`, {"method":"put"})
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
        element.innerText = dataElement;
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


