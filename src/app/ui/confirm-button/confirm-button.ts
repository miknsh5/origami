import { Component, Input, Output, EventEmitter } from "@angular/core";


@Component({
    selector: "sg-menu-confirm-button",
    templateUrl: "app/ui/confirm-button/confirm-button.html",
    styleUrls: ["app/ui/confirm-button/confirm-button.css", "app/ui/menu-bar/menu-bar.component.css"]
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
