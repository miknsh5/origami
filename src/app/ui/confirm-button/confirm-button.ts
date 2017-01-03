import { Component, Input, Output, EventEmitter } from "@angular/core";


@Component({
    selector: "sg-menu-confirm-button",
    templateUrl: "app/org/confirm-button/confirm-button.html",
    styleUrls: ["app/org/confirm-button/confirm-button.css", "app/org/menu-bar/menu-bar.component.css"]
})

export class ConfirmButtonComponent {
    private title: any;
    @Input() deleteTitle: string;
    @Input() titleName: string;
    @Input() hideMessage: boolean;

    @Output() onConfirmClick = new EventEmitter<boolean>();
    @Output() onCancelClick = new EventEmitter<boolean>();

    onConfirm() {
        this.onConfirmClick.emit(true);
    }

    onCancel() {
        this.onCancelClick.emit(true);
    }
}
