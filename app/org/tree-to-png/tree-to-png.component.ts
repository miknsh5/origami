import * as angular from "@angular/core";
import { Component, Input } from "@angular/core";

import * as d3 from "d3";
import * as saveSvgAsPng from "save-svg-as-png";

const DEFAULT_MATTRIX = "matrix(1,0,0,1,-3,-9)";
const DEFAULT_EXT = ".png";
const DEFAULT_HEIGHT_VALUE = 380;
const MIN_HEIGHT = 768;

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
    @Input() isHorizontalTree: any;
    private leftNodeInitials: number;
    private rightNodeInitials: number;
    private treeLength: number;
    private depth: Array<any>;
    private mattrix: any;
    private viewPort: Element;
    private svg: SVGElement;
    private circles: any;
    private nodes: any;
    private nodesTransform: any;
    private viewBox: any;

    onClickSaveDataAsPNGFormat() {
        if (this.selectedOrgNode) {

            this.treeLength = this.leftNodeInitials = this.rightNodeInitials = 0;
            this.getNodesPositionOfVerticalTree();

            // gets previous attributes of the element's for reassigning after export.
            this.getPrevAttributes();
            this.treeLength += DEFAULT_HEIGHT_VALUE;

            if (this.isHorizontalTree) {
                let height = this.leftNodeInitials + this.rightNodeInitials + MIN_HEIGHT;
                // sets default attributes of exporting.            
                this.setDefaultAttributes(this.treeLength, height);
            } else {
                let width = this.leftNodeInitials + this.rightNodeInitials + MIN_HEIGHT;
                // sets default attributes of exporting.            
                this.setDefaultAttributes(width, this.treeLength);
            }

            // exports svg to png
            saveSvgAsPng.saveSvgAsPng(this.svg, this.orgName + DEFAULT_EXT);

            // re assign's the previous attributes.
            this.setPrevAttributes();
        }
    }

    private getPrevAttributes() {
        this.viewPort = document.getElementsByClassName("svg-pan-zoom_viewport")[0];
        this.mattrix = this.viewPort.getAttribute("transform");
        this.svg = document.getElementsByTagName("svg")[0];
        this.circles = this.svg.getElementsByTagName("circle");
        this.nodes = this.svg.getElementsByClassName("nodes")[0];
        this.nodesTransform = this.nodes.getAttribute("transform");
        this.viewBox = this.svg.getAttribute("viewBox");
    }

    private setDefaultAttributes(width, height) {
        for (let i = 0; i < this.circles.length; i++) {
            // filters url need to be changed for viewing dropshadow in export.
            this.circles[i].setAttribute("style", "filter: url('#drop-shadow')");
        }
        this.svg.removeAttribute("viewBox");
        this.svg.setAttribute("style", "background-color:white");
        this.svg.setAttribute("width", width.toString());
        this.svg.setAttribute("height", height.toString());
        this.viewPort.setAttribute("transform", DEFAULT_MATTRIX);
        if (this.isHorizontalTree) {
            this.nodes.setAttribute("transform", "translate(120," + (this.leftNodeInitials + DEFAULT_HEIGHT_VALUE) + ")");
        } else {
            this.nodes.setAttribute("transform", "translate(" + (this.leftNodeInitials + DEFAULT_HEIGHT_VALUE) + ",120)");
        }
    }

    private setPrevAttributes() {
        // sets attributes to  svg for exporting
        this.svg.setAttribute("viewBox", this.viewBox);
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);
        this.nodes.setAttribute("transform", this.nodesTransform);
        this.viewPort.setAttribute("transform", this.mattrix);

        for (let i = 0; i < this.circles.length; i++) {
            // filters url need to be changed for viewing dropshadow in page based on page url.
            this.circles[i].setAttribute("style", "filter: url('home#drop-shadow')");
        }
    }

    private getNodesPositionOfVerticalTree() {
        d3.selectAll("g.node").each(element => {
            if (element.x > 0) {
                if (element.x > this.rightNodeInitials) {
                    this.rightNodeInitials = element.x;
                }
            } else if (element.x < 0) {
                let value = Math.abs(element.x);
                if (value > this.leftNodeInitials) {
                    this.leftNodeInitials = value;
                }
            }
            if (element.y > this.treeLength) {
                this.treeLength = element.y;
            }
        });
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
