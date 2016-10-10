import { Injectable } from "@angular/core";

declare let $: any;

@Injectable()
export class DomElementHelper {

    showElements(elementName: any) {
        if (typeof elementName === "string") {
            $(elementName).show();
        } else {
            $(elementName.join(", ")).show();
        }
    }

    hideElements(elementName: any) {
        if (typeof elementName === "string") {
            $(elementName).hide();
        } else {
            $(elementName.join(", ")).hide();
        }
    }

    initDropDown(elementName: string, options: any) {
        $(elementName).dropdown(options);
    }

    setWidth(elementName: string, width: any) {
        $(elementName).width(width);
    }

    setHeight(elementName: string, height: any) {
        $(elementName).height(height);
    }
}