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