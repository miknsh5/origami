import { Component, Input, Output, EventEmitter } from "@angular/core";


@Component({
    selector: "sg-org-menu-confirm-button",
    templateUrl: "app/org/menu-confirm/menu-confirm.component.html",
    styleUrls: ["app/org/menu-confirm/menu-confirm.component.css", "app/style.css", "app/org/menu-panel/menu-panel.component.css"]
})

export class MenuConfirmButtonComponent {

    @Output() onConfirmClick = new EventEmitter<boolean>();
    @Output() onCancelClick = new EventEmitter<boolean>();

    onConfirm() {
        this.onConfirmClick.emit(true);
    }

    onCancel() {
        this.onCancelClick.emit(true);
    }
}