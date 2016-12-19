import * as angular from "@angular/core";
import { Component, Input } from "@angular/core";

import * as d3 from "d3";
import * as saveSvgAsPng from "save-svg-as-png";

const DEFAULT_MATTRIX = "matrix(1,0,0,1,-3,-9)";
const DEFAULT_EXT = ".png";

@Component({
    selector: "sg-png",
    templateUrl: "app/org/tree-to-png/tree-to-png.component.html",
    styleUrls: ["app/org/tree-to-png/tree-to-png.component.css"]
})

export class TreeToPNGComponent {
    @Input() orgName: any;
    @Input() selectedOrgNode: any;
    @Input() width: any;
    @Input() height: any;
    private depth: any;

    onClickSaveDataAsPNGFormat() {
        if (this.selectedOrgNode) {
            this.depth = [1];
            this.childCount(0, this.selectedOrgNode);
            let maxCount = d3.max(this.depth);
            let width = maxCount * 240;
            width = width > 1024 ? width : 1024;
            if (width > 5000) {
                width = maxCount * 360;
            }
            let height = (this.depth.length * 120);
            height = height > 768 ? height : 768;

            let viewPort = document.getElementsByClassName("svg-pan-zoom_viewport")[0];
            let mattrix = viewPort.getAttribute("transform");
            let svg = document.getElementsByTagName("svg")[0];
            let circles = svg.getElementsByTagName("circle");
            let nodes = svg.getElementsByClassName("nodes")[0];
            let nodesTransform = nodes.getAttribute("transform");
            let viewBox = svg.getAttribute("viewBox");

            // sets attributes to  svg for exporting
            for (let i = 0; i < circles.length; i++) {
                circles[i].setAttribute("style", "filter: url('#drop-shadow')");
            }
            svg.removeAttribute("viewBox");
            svg.setAttribute("style", "background-color:white");
            svg.setAttribute("width", width.toString());
            svg.setAttribute("height", height.toString());
            if (width > 5000) {
                nodes.setAttribute("transform", "translate(" + (width / 2) + ", 95)scale(0.75)");
            } else {
                nodes.setAttribute("transform", "translate(" + (width / 2) + ", 95)");
            }
            viewPort.setAttribute("transform", DEFAULT_MATTRIX);

            // exports svg to png
            saveSvgAsPng.saveSvgAsPng(svg, this.orgName + DEFAULT_EXT);

            // sets attributes to  svg for exporting
            svg.setAttribute("viewBox", viewBox);
            svg.setAttribute("width", this.width);
            svg.setAttribute("height", this.height);
            nodes.setAttribute("transform", nodesTransform);
            viewPort.setAttribute("transform", mattrix);
            for (let i = 0; i < circles.length; i++) {
                circles[i].setAttribute("style", "filter: url('home#drop-shadow')");
            }
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