class ConfirmDialog{
    constructor(title, message, cancelCallback, acceptCallback){
        this.title = title
        this.message = message
        if(acceptCallback) {
            this.cancelCallback = cancelCallback;
            this.acceptCallback = acceptCallback;   
        } else {
            this.acceptCallback = cancelCallback;
        }
        this.dialogElement = document.querySelector("#confirmDialog")
        this.titleElement = document.querySelector("#confirmDialogTitle")
        this.bodyElement = document.querySelector("#confirmDialog .modal-body")
        this.cancelButton = document.querySelector("#confirmDialogBtnCancel")
        this.acceptButton = document.querySelector("#confirmDialogBtnAccept")
        this.modal = new bootstrap.Modal(this.dialogElement, {
            "backdrop":"static",
            "keyboard":true,
            "focus":true
        });
    }

    show() {
        this.titleElement.innerHTML = this.title
        this.bodyElement.innerHTML = this.message
        this.cancelButton.addEventListener("click", this.cancel.bind(this))
        this.acceptButton.addEventListener("click", this.accept.bind(this))
        this.modal.show()
    }

    hide() {
        this.cancelButton.removeEventListener("click", this.cancel)
        this.acceptButton.removeEventListener("click", this.accept)
        this.modal.hide()
    }

    cancel( ) {
        this.hide();
        if(this.cancelCallback) {
            this.cancelCallback()
        }
    }

    accept() {
        this.hide();
        if (this.acceptCallback) {
            this.acceptCallback();
        }

    }
}

function alertContainerFade() {
    let alertContainer = document.querySelector("#alertContainer");
    if (!alertContainer.hasChildNodes()) {
        alertContainer.classList.remove("show");
        alertContainer.classList.add("fade");
    }
}


function showAlert(message, level) {
    let alertContainer = document.querySelector("#alertContainer")
    let alertElement=document.createElement("div");
    let alertClasses = ["alert", "alert-dismissible", "show"]
    switch (level) {
        case "ERROR":
            alertClasses.push("alert-danger")
            break;
        case "WARN":
            alertClasses.push("alert-warning")
            break;
        default:
            alertClasses.push("alert-primary")
            break;
    }
    for (let cl in alertClasses) {
        alertElement.classList.add(alertClasses[cl])
    }
    alertElement.setAttribute("role", "alert")
    alertElement.appendChild(document.createTextNode(message))
    let button = document.createElement("button")
    button.classList.add("btn-close")
    button.setAttribute("type", "button")
    button.setAttribute("data-bs-dismiss", "alert")
    button.setAttribute("aria-label", "close")
    alertElement.appendChild(button)
    alertContainer.appendChild(alertElement)
    alertBody=document.querySelector("#alertBody")
    bsAlert = new bootstrap.Alert(alertElement)
    alertElement.addEventListener("closed.bs.alert", alertContainerFade)
    setTimeout((alert)=>{
        alert.close();
        alert.dispose();
    }, 5*1000, bsAlert)
    alertContainer.classList.remove("fade");
    alertContainer.classList.add("show")

}

