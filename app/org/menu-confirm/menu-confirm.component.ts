import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from "@angular/core";


@Component({
    selector: "sg-org-menu-confirm-button",
    templateUrl: "app/org/menu-confirm/menu-confirm.component.html",
    styleUrls: ["app/org/menu-confirm/menu-confirm.component.css", "app/style.css", "app/org/menu-panel/menu-panel.component.css"]
})

export class MenuConfirmButtonComponent implements OnChanges {

    private title: any;
    private titleName: any;
    @Input() isSettings: boolean;
    @Input() deleteTitle: string;
    @Input() name: string;

    @Output() onConfirmClick = new EventEmitter<boolean>();
    @Output() onCancelClick = new EventEmitter<boolean>();

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["deleteTitle"]) {
            this.title = this.deleteTitle;
        }
        if (changes["name"]) {
            this.titleName = this.name;
        }
    }

    onConfirm() {
        this.onConfirmClick.emit(true);
    }

    onCancel() {
        console.log(this.deleteTitle);
        this.onCancelClick.emit(true);
    }
}
