import * as angular from "@angular/core";
import {Component, Input} from "@angular/core";

import * as saveSvgAsPng from "save-svg-as-png";


@Component({
    selector: "sg-origami-png",
    templateUrl: "app/org/convertTreeToPNG/convertTreeToPNG.component.html",
    styleUrls: ["app/org/convertTreeToPNG/convertTreeToPNG.component.css", "app/style.css"]
})

export class ConvertTreeToPNGComponent {
    @Input() orgName: any;

    onClickSaveDataAsPNGFormat() {
        let svg = document.getElementsByTagName("svg")[0];
        svg.setAttribute("style", "background-color:white");
        saveSvgAsPng.saveSvgAsPng(svg, this.orgName + ".png");
    }
}