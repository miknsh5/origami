import * as angular from "@angular/core";
import {Component, Input} from "@angular/core";

import * as d3 from "d3";
import * as saveSvgAsPng from "save-svg-as-png";

const DEFAULT_MATTRIX = "matrix(1,0,0,1,-3,-9)";
const DEFAULT_EXT = ".png";

@Component({
    selector: "sg-origami-png",
    templateUrl: "app/org/convertTreeToPNG/convertTreeToPNG.component.html",
    styleUrls: ["app/org/convertTreeToPNG/convertTreeToPNG.component.css", "app/style.css"]
})

export class ConvertTreeToPNGComponent {
    @Input() orgName: any;
    @Input() selectedOrgNode: any;
    @Input() width: any;
    @Input() height: any;
    private depth: any;

    onClickSaveDataAsPNGFormat() {
        if (this.selectedOrgNode) {
            this.depth = [1];
            this.childCount(0, this.selectedOrgNode);
            let width = d3.max(this.depth) * 150;
            let height = (this.depth.length * 110);
            let viewPort = document.getElementById("viewport");
            let mattrix = viewPort.getAttribute("transform");
            let svg = document.getElementsByTagName("svg")[0];

            svg.setAttribute("style", "background-color:white");
            svg.setAttribute("width", width.toString());
            svg.setAttribute("height", height.toString());
            viewPort.setAttribute("transform", DEFAULT_MATTRIX);

            saveSvgAsPng.saveSvgAsPng(svg, this.orgName + DEFAULT_EXT);
            svg.setAttribute("width", this.width);
            svg.setAttribute("height", this.height);
            viewPort.setAttribute("transform", mattrix);
        }
    }

    private childCount(level, node) {
        if (node) {
            let children: any = node.children;
            if (children && children.length > 0) {
                if (this.depth.length <= level + 1)
                    this.depth.push(0);

                this.depth[level + 1] += children.length;
                children.forEach((d) => {
                    this.childCount(level + 1, d);
                });
            }
        }
    }
}