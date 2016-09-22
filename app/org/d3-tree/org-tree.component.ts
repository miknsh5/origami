import * as angular from "@angular/core";
import {Component, Input, Output, Directive, EventEmitter, Attribute, OnChanges, DoCheck, ElementRef, OnInit, SimpleChange} from "@angular/core";
import { Inject } from "@angular/core";

import * as d3 from "d3";
import { OrgNodeModel, OrgService, ChartMode} from "../shared/index";

const DURATION = 250;
const TOPBOTTOM_MARGIN = 20;
const RIGHTLEFT_MARGIN = 120;
const SIBLING_RADIUS = 21.5;
const PARENTCHILD_RADIUS = 13.5;
const GRANDPARENT_RADIUS = 9;

const DEFAULT_MARGIN = 8;
const DEFAULT_RADIUS = 11.8;
const DEFAULT_STD_DEVIATION = 1;

const PEER_TEXT = "Peer";
const REPORTEE_TEXT = "Direct Report";
const NODE_DEFAULT_DISTANCE = 112;

const LABEL_POINTS = "18 5 18 -5 21 0";
const ARROW_POINTS = "55 33 55 21 59 27";
const NAVIGATION_ARROW_FILL = "#D8D8D8";
const CHILD_ARROW_FILL = "#929292";
const TRANSPARENT_COLOR = "transparent";

const NODE_HEIGHT = 70;
const NODE_WIDTH = 95;
const DEPTH = 180;
const RADIAL_DEPTH = 90;

const DEFAULT_CIRCLE = "defaultCircle";
const STAGED_CIRCLE = "stagedCircle";
const SELECTED_CIRCLE = "selectedCircle";

const POLYGON = "polygon";
const CIRCLE = "circle";
const TEXT = "text";


const DEFAULT_FONTSIZE = 11;
const SIBLING_FONTSIZE = 17.3;

@Component({
    selector: "sg-org-tree",
    template: ``
})

export class OrgTreeComponent implements OnInit, OnChanges {
    tree: any;
    diagonal: any;
    descriptionWidths: any;
    svg: any;
    graph: any;
    root: any;
    nodes: any;
    links: any;
    selectedOrgNode: any;
    labelWidths: any;
    treeWidth: number;
    treeHeight: number;
    previousRoot: any;
    lastSelectedNode: any;
    arrows: any;
    levelDepth: any;

    @Input() currentMode: ChartMode;
    @Input() isAddOrEditModeEnabled: boolean;
    @Input() width: number;
    @Input() height: number;
    @Input() treeData: any;
    @Input() showFirstNameLabel: boolean;
    @Input() showLastNameLabel: boolean;
    @Input() showDescriptionLabel: boolean;
    @Input() orgGroupID: number;
    @Input() CompanyID: number;

    @Output() selectNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() switchToAddMode = new EventEmitter<OrgNodeModel>();

    ngOnInit() {
        //  Todo:- We need to use the values coming from the host instead of our own
        let margin = { top: TOPBOTTOM_MARGIN, right: RIGHTLEFT_MARGIN, bottom: TOPBOTTOM_MARGIN, left: RIGHTLEFT_MARGIN };

        this.levelDepth = [1];
        this.treeWidth = this.width;
        this.treeHeight = this.height;
        this.initializeTreeAsPerMode();
        this.svg = this.graph.append("svg")
            .attr("width", this.treeWidth)
            .attr("height", this.treeHeight)
            .append("g")
            .attr("id", "viewport");

        let verticalLine: [number, number][] = [[(this.treeWidth / 2), this.treeHeight], [(this.treeWidth / 2), 0]];
        let horizontalLine: [number, number][] = [[0, (this.treeHeight / 2)], [this.treeWidth, (this.treeHeight / 2)]];

        // Creates and vertical line
        this.createLines(verticalLine, "vertical");

        // Creates and horizontal line 
        this.createLines(horizontalLine, "horizontal");

        this.svg.append("g")
            .attr("class", "nodes")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.arrows = this.svg.append("g")
            .attr("id", "arrows")
            .attr("transform", "translate(" + ((this.treeWidth / 2) - SIBLING_RADIUS * 1.35) + "," + ((this.treeHeight / 2) - SIBLING_RADIUS * 1.275) + ")");

        this.svg = d3.select("g.nodes");

        // creates arrows directions
        this.createArrows();

        // creates drop shadow
        this.createDropShadow();

        this.root = this.treeData[0];
        if (!this.root) {
            this.addEmptyRootNode();
        }
        for (let i = 0; i < this.root.children.length; i++) {
            this.collapseTree(this.root.children[i]);
        };
        this.highlightSelectedNode(this.root);
        this.render(this.root);
        this.calculateLevelDepth();
        this.resizeLinesArrowsAndSvg();
        this.centerNode(this.root);

        document.addEventListener("keydown", (ev: KeyboardEvent) => this.keyDown(this.selectedOrgNode, ev), false);
        document.addEventListener("click", (ev: MouseEvent) => this.bodyClicked(this.selectedOrgNode, ev), false);
    }

    childCount(level, node) {
        if (node) {
            let children: any = node.children;
            if (children && children.length > 0) {
                if (this.levelDepth.length <= level + 1)
                    this.levelDepth.push(0);

                this.levelDepth[level + 1] += children.length;
                children.forEach((d) => {
                    this.childCount(level + 1, d);
                });
            }
        }
    }

    initializeTreeAsPerMode() {
        if (this.currentMode === ChartMode.build) {
            this.tree = d3.layout.tree().nodeSize([NODE_HEIGHT, NODE_WIDTH]);
        } else if (this.currentMode === ChartMode.report) {
            this.tree = d3.layout.tree().nodeSize([NODE_WIDTH, NODE_HEIGHT]);
            this.setNodeLabelVisiblity();
            this.root = this.selectedOrgNode || this.lastSelectedNode;
        } else {
            this.tree = d3.layout.cluster().size([360, RADIAL_DEPTH])
                .separation(function (a, b) {
                    return (a.parent === b.parent ? 1 : 2) / a.depth;
                });
            this.setNodeLabelVisiblity();
            this.selectedOrgNode = this.root;
        }

        if (this.currentMode === ChartMode.build) {
            this.diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });
        } else if (this.currentMode === ChartMode.report) {
            this.diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.x, d.y];
                });
        } else {
            this.diagonal = d3.svg.diagonal.radial()
                .projection(function (d) {
                    return [d.y, d.x / DEPTH * Math.PI];
                });
        }
    }

    setNodeLabelVisiblity() {
        d3.selectAll("text[data-id='name']").style("visibility", () => {
            if (this.showFirstNameLabel || this.showLastNameLabel) return "visible";
            else return "hidden";
        });

        d3.selectAll("text[data-id='description']").style("visibility", () => {
            if (this.showDescriptionLabel) return "visible";
            else return "hidden";
        });
    }

    // TODO:- we should refactor this method to work depending on the kind of change that has taken place. 
    // It re-renders on all kinds of changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (this.tree != null) {
            this.previousRoot = this.root;
            this.root = this.treeData[0];
            this.treeWidth = this.width;
            this.treeHeight = this.height;

            if (changes["orgGroupID"]) {
                if (this.root) {
                    this.selectedOrgNode = this.root;
                }
                if (!this.root) {
                    this.addEmptyRootNode();
                    this.selectedOrgNode = this.root;
                }
            }

            if (changes["orgGroupID"] && changes["currentMode"] && changes["currentMode"].currentValue) {
                if (!this.root) {
                    this.addEmptyRootNode();
                    this.selectedOrgNode = this.root;
                }
            }

            if (changes["isAddOrEditModeEnabled"] && changes["isAddOrEditModeEnabled"].currentValue && !changes["treeData"]) {
                return;
            }

            if (changes["currentMode"]) {
                this.initializeTreeAsPerMode();
                let node = this.selectedOrgNode;
                if (!node && this.lastSelectedNode) {
                    node = this.lastSelectedNode;
                }
                this.expandTree(node);
                this.calculateLevelDepth();
                this.resizeLinesArrowsAndSvg();
                this.setNodeLabelVisiblity();
                this.highlightAndCenterNode(node);
                return;
            }

            if (!this.root) {
                if (this.selectedOrgNode.NodeID === -1) {
                    this.root = this.selectedOrgNode;
                } else {
                    this.addEmptyRootNode();
                    this.selectedOrgNode = this.root;
                }
            }

            let raiseSelectedEvent: boolean = true;
            if (changes["isAddOrEditModeEnabled"]) {
                // We don't need to raise a selectednode change event if the only change happening is entering/leaving edit node
                if (this.isAddOrEditModeEnabled)
                    raiseSelectedEvent = false;
            }

            this.calculateLevelDepth();
            this.resizeLinesArrowsAndSvg();
            if (this.currentMode !== ChartMode.build) {
                this.setNodeLabelVisiblity();
                if (this.currentMode === ChartMode.report)
                    this.root = this.selectedOrgNode;
            }

            if (this.selectedOrgNode != null) {
                this.selectedOrgNode.IsSelected = false;
                if (this.selectedOrgNode.NodeID === -1) {
                    if (this.root && this.root.NodeID !== -1) {
                        this.selectedOrgNode = this.getPreviousNodeIfAddedOrDeleted();
                    }
                    raiseSelectedEvent = true;
                    this.highlightSelectedNode(this.selectedOrgNode, raiseSelectedEvent);
                } else {
                    let node = this.getNode(this.selectedOrgNode.NodeID, this.root);
                    // if the selected node is deleted it highlights previous sibling or parent node
                    if (!node) {
                        this.selectedOrgNode = this.getPreviousSiblingNode(this.selectedOrgNode, this.previousRoot);
                        if (this.selectedOrgNode.NodeID === -1) { raiseSelectedEvent = true; }
                    }
                    this.updateSelectedOrgNode(this.root);
                    this.highlightSelectedNode(this.selectedOrgNode, raiseSelectedEvent);
                }
            }

            if (this.selectedOrgNode != null) {
                if (this.currentMode !== ChartMode.explore) {
                    this.render(this.root);
                    this.showUpdatePeerReporteeNode(this.selectedOrgNode);
                    this.centerNode(this.selectedOrgNode);
                }
                if (this.isAddOrEditModeEnabled) {
                    this.hideAllArrows();
                } else {
                    this.hideTopArrow(this.selectedOrgNode);
                }
            } else {
                // check whether the width or height property has changed or not
                if (changes["width"] || changes["height"]) {
                    // centers the last selected node
                    this.centerNode(this.lastSelectedNode);
                }
            }
        }
    }

    constructor(private orgService: OrgService,
        @Inject(ElementRef) elementRef: ElementRef) {
        let el: any = elementRef.nativeElement;
        this.graph = d3.select(el);
    }

    addEmptyRootNode() {
        this.root = new OrgNodeModel();
        this.root.children = new Array<OrgNodeModel>();
        this.root.NodeID = -1;
        this.root.OrgGroupID = this.orgGroupID;
        this.root.CompanyID = this.CompanyID;
        this.root.IsStaging = true;
        this.root.NodeFirstName = "";
        this.root.NodeLastName = "";
        this.root.Description = "";
        console.log("No nodes in system");
    }

    calculateLevelDepth() {
        this.levelDepth = [1];
        this.childCount(0, this.root);
    }

    resizeLinesArrowsAndSvg() {
        if (this.currentMode === ChartMode.build) {
            let count = this.levelDepth.length >= 2 ? this.levelDepth[1] : this.levelDepth[0];
            let maxHeight = count * NODE_HEIGHT;
            this.treeWidth = this.width;
            this.treeHeight = maxHeight > this.height ? maxHeight : this.height;
        }

        let verticalLine: [number, number][] = [[(this.treeWidth / 2), this.treeHeight], [(this.treeWidth / 2), 0]];
        let horizontalLine: [number, number][] = [[0, (this.treeHeight / 2)], [this.treeWidth, (this.treeHeight / 2)]];

        let line = d3.svg.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });
        if (this.currentMode === ChartMode.build) {
            d3.select("path.vertical")
                .attr("d", line(verticalLine))
                .attr("stroke", "#979797");

            d3.select("path.horizontal")
                .attr("d", line(horizontalLine))
                .attr("stroke", "#979797");

            this.arrows.attr("transform", "translate(" + ((this.treeWidth / 2) - SIBLING_RADIUS * 1.35) + "," + ((this.treeHeight / 2) - SIBLING_RADIUS * 1.275) + ")");
            d3.select("#viewport").attr("transform", "");
        } else {
            d3.select("path.vertical")
                .attr("stroke", TRANSPARENT_COLOR);
            d3.select("path.horizontal")
                .attr("stroke", TRANSPARENT_COLOR);
        }

        d3.select("svg").attr("width", this.treeWidth)
            .attr("height", this.treeHeight)
            .attr("class", () => {
                if (this.currentMode === ChartMode.build)
                    return "buildMode";
                else if (this.currentMode === ChartMode.report)
                    return "reportMode";
                else
                    return "exploreMode";
            });

        this.scrollToCenter();
    }

    private scrollToCenter() {
        if (this.currentMode === ChartMode.build) {
            if (this.treeHeight > this.height) {
                let scrollposition = this.treeHeight / 2;
                scrollposition = scrollposition - (this.height / 2);
                document.body.scrollTop = Math.abs(scrollposition);
                if (document.body.scrollTop === 0) {
                    document.documentElement.scrollTop = Math.abs(scrollposition);
                }
            }
        } else {
            if (this.treeWidth > this.width) {
                let scrollposition = this.treeWidth / 2;
                scrollposition = scrollposition - (this.width / 2);
                let canvas = document.body.getElementsByClassName("main-canvas")[0];
                canvas.scrollLeft = scrollposition;
            }
        }
    }

    createDropShadow() {
        let defs = this.svg.append("defs");

        let filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "140%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", DEFAULT_STD_DEVIATION);

        filter.append("feOffset").attr("dy", "3");

        filter.append("feComponentTransfer")
            .append("feFuncA")
            .attr("type", "linear")
            .attr("slope", "0.35");

        let feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    getIndexOfNode(parentNode: OrgNodeModel, currentNode: OrgNodeModel, rootNode) {
        let index;
        let node = this.getNode(parentNode.NodeID, rootNode);
        if (node.children && node.children.length > 0) {
            node.children.forEach(function (d) {
                if (d.NodeID === currentNode.NodeID) {
                    index = node.children.indexOf(currentNode, 0);
                }
            });
        }
        return index;
    }

    getPreviousNodeIfAddedOrDeleted() {
        let previousNode;
        if (this.selectedOrgNode.ParentNodeID == null && this.selectedOrgNode.IsNewRoot) {
            this.root.ParentNodeID = null;
            return this.root;
        }
        let node = this.getNode(this.selectedOrgNode.ParentNodeID, this.root);
        if (!node && this.root) {
            return this.root;
        }
        let index = this.getIndexOfNode(node, this.selectedOrgNode, this.root);
        if (index >= 0) {
            previousNode = node.children[index];
        } else {
            index = this.getIndexOfNode(node, this.selectedOrgNode, this.previousRoot);
            if (index === 0) {
                if (node.children && node.children.length > 0) {
                    previousNode = node.children[0];
                } else {
                    previousNode = node;
                }
            } else {
                if (node.children.length > index) {
                    previousNode = node.children[index];
                } else {
                    previousNode = node.children[index - 1];
                }
            }
        }
        return previousNode;
    }

    getPreviousSiblingNode(node: OrgNodeModel, rootNode) {
        let previousNode;
        if (node.ParentNodeID) {
            previousNode = this.getNode(node.ParentNodeID, this.root);
            let index = this.getIndexOfNode(previousNode, node, rootNode);
            if (previousNode.children && previousNode.children.length > 0) {
                if (index > 0) {
                    previousNode = previousNode.children[index - 1];
                }
                else if (index === 0 && previousNode.children.length > 0) {
                    previousNode = previousNode.children[index];
                }
            }
        } else {
            previousNode = this.root;
        }
        return previousNode;
    }

    createLines(lineData, className) {
        let line = d3.svg.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });

        this.svg.append("path")
            .attr("d", line(lineData))
            .attr("stroke", "#979797")
            .attr("stroke-width", 0.4)
            .attr("fill", "none")
            .attr("class", className);
    }

    createArrows() {
        let arrowsData = [{ "points": ARROW_POINTS, "transform": "", "id": "right" },
            { "points": ARROW_POINTS, "transform": "translate(58, 55) rotate(-180)", "id": "left" },
            { "points": ARROW_POINTS, "transform": "translate(2,58) rotate(-90)", "id": "top" },
            { "points": ARROW_POINTS, "transform": "translate(56, -2) rotate(90)", "id": "bottom" }];

        let arrows = this.arrows;
        arrowsData.forEach(function (data) {
            arrows.append(POLYGON)
                .attr("id", data.id)
                .attr("points", data.points)
                .attr("transform", data.transform);
        });
    }

    hideAllArrows() {
        // hides all arrows by making transparent
        d3.selectAll("#arrows " + POLYGON)
            .attr("stroke", TRANSPARENT_COLOR)
            .attr("fill", TRANSPARENT_COLOR);
    }

    markAncestors(d: OrgNodeModel) {
        if (d.ParentNodeID !== null) {
            let node = this.getNode(d.ParentNodeID, this.root);
            if (node != null) {
                node.IsAncestor = true;
                if (node.ParentNodeID !== null) {
                    this.markAncestors(node);
                }
            }
        }
    }

    collapseExceptSelectedNode(d) {
        this.isAncestorOrRelated(d);

        if ((d.Show === false && !d.IsAncestor) || (d.IsSibling && !d.IsSelected) || d.IsChild) {
            this.collapseTree(d);
        }
        if (d.children) {
            for (let i = 0; i < d.children.length; i++) {

                this.collapseExceptSelectedNode(d.children[i]);
            };
        }
    }

    collapseTree(d) {
        if (d.children) {

            d._children = d.children;
            for (let i = 0; i < d._children.length; i++) {
                this.collapseTree(d._children[i]);
            };
            d.children = null;
        }
    }
    expandTree(d) {
        if (d && d._children != null && d.children == null) {

            d.children = d._children;
        }
        if (d && d.children != null) {
            for (let i = 0; i < d.children.length; i++) {
                this.expandTree(d.children[i]);
            };
            d._children = null;
        }
    }
    centerNode(source) {
        let x = 0; source.y0;
        let y = 0; source.x0;
        if (this.currentMode === ChartMode.build) {
            x = source.y0;
            y = source.x0;
            x = this.treeWidth / 2 - x;
            y = this.treeHeight / 2 - y;
        } else if (this.currentMode === ChartMode.report) {
            x = source.x0;
            y = source.y0;
            x = this.treeWidth / 2 - x;
            y = NODE_WIDTH;
        } else {
            x = source.x0;
            y = source.y0;
            x = this.treeWidth / 2;
            y = this.treeHeight / 2;
        }

        d3.select("g.nodes").transition()
            .duration(DURATION)
            .attr("transform", () => {
                if (this.currentMode === ChartMode.explore) {
                    return "translate(" + x + "," + y + ")";
                }
                return "translate(" + x + "," + y + ")";
            });

        this.hideAllArrows();

        if (this.root && this.root.NodeID !== source.NodeID) {
            let parentNode = source.parent;
            if (!parentNode) {
                parentNode = this.getNode(source.ParentNodeID, this.root);
            }
            this.moveParentNodesToCenter(parentNode, source);
            let grandParent = this.getGrandParentID(parentNode);
            if (grandParent) {
                this.moveParentNodesToCenter(grandParent, source);
            }
            d3.selectAll("#arrows " + POLYGON)
                .attr("stroke", "#FFFFFF")
                .attr("fill", NAVIGATION_ARROW_FILL);
        } else {
            if (this.currentMode === ChartMode.build) {
                d3.selectAll(POLYGON + "#right")
                    .attr("stroke", "#FFFFFF")
                    .attr("fill", NAVIGATION_ARROW_FILL);
            }
        }
    }
    getGrandParentID(node: d3.layout.tree.Node) {
        if (node && node.parent) {
            let orgNode = node.parent as OrgNodeModel;
            return orgNode;
        }
        return null;
    }

    moveParentNodesToCenter(parentNode, source) {
        if (parentNode) {
            d3.selectAll("g.node")
                .filter(function (d) {
                    return d.NodeID === parentNode.NodeID;
                }).transition()
                .duration(DURATION)
                .attr("transform", (d) => {
                    if (this.currentMode === ChartMode.build) {
                        return "translate(" + parentNode.y + " , " + source.x + ")";
                    }
                    else {
                        return "translate(" + source.x + " , " + (parentNode.y - 40) + ")";

                    }
                });
        }
    }

    render(source) {
        if (source) {
            if (!this.nodes || this.selectedOrgNode) {
                //  The tree defines the position of the nodes based on the number of nodes it needs to draw.
                // collapse out the child nodes which will not be shown
                this.markAncestors(this.selectedOrgNode);
                if (this.currentMode === ChartMode.build) {
                    if (this.root && this.root.children) {
                        for (let k = 0; k < this.root.children.length; k++) {
                            this.collapseExceptSelectedNode(this.root.children[k]);
                        };
                    }
                }

                this.nodes = this.tree.nodes(this.root).reverse();

                for (let j = 0; j < this.nodes.length; j++) {
                    this.isAncestorOrRelated(this.nodes[j]);
                };
                this.nodes = this.nodes.filter(function (d) { return d.Show; });
            }

            this.links = this.tree.links(this.nodes);
            source.x0 = source.x;
            source.y0 = source.y;

            // Normalize for fixed-depth.
            if (this.currentMode === ChartMode.build) {
                this.nodes.forEach(function (d) { d.y = d.depth * DEPTH; });
            } else if (this.currentMode === ChartMode.report) {
                this.nodes.forEach(function (d) { d.y = d.depth * NODE_WIDTH; });
            } else {
                this.nodes.forEach(function (d) { d.y = d.depth * RIGHTLEFT_MARGIN; });
            }

            this.renderOrUpdateNodes(source);

            this.renderOrUpdateLinks(source);

            // Stash the old positions for transition.
            this.nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            this.showUpdatePeerReporteeNode(source);
        }
        this.resizeLinesArrowsAndSvg();
    }

    renderOrUpdateNodes(source) {
        let i: number = 0;

        // Update the nodes…
        let node = this.svg.selectAll("g.node")
            .data(this.nodes, function (d) { return d.NodeID || (++i); });

        // Enter any new nodes at the parent"s previous position.
        let nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", (d) => {
                let transformString = "translate(" + source.y0 + "," + source.x0 + ")";
                if (this.currentMode === ChartMode.report) {
                    transformString = "translate(" + source.x0 + "," + source.y0 + ")";
                } else if (this.currentMode === ChartMode.explore) {
                    transformString = "rotate(" + (source.x0 - RADIAL_DEPTH) + ")translate(" + source.y0 + ")";
                }
                return transformString;
            })
            .on("click", (ev) => this.nodeClicked(ev));

        nodeEnter.append(CIRCLE).attr("r", 1e-6)
            .style("filter", function (d) {
                return d.IsStaging && d.NodeID === -1 ? " " : "url(home#drop-shadow)";
            });

        nodeEnter.append(TEXT)
            .attr("id", "abbr")
            .attr("dy", ".4em")
            .attr("text-anchor", "middle")
            .style("fill-opacity", 1);

        node.select("#abbr").text((d) => {
            if (d.IsStaging && d.NodeID === -1) { return "+"; }
            let fn = "", ln = "";
            if (d.NodeFirstName) { fn = d.NodeFirstName.slice(0, 1); }
            if (d.NodeLastName) { ln = d.NodeLastName.slice(0, 1); }
            if (d.IsGrandParent) {
                if (this.currentMode === ChartMode.explore) {
                    return fn + ln;
                } else {
                    return "";
                }
            }
            return fn + ln;
        }).style("fill", function (d) {
            return d.IsStaging && d.NodeID === -1 ? "#0097FF" : "#FFFFFF";
        }).style("font-size", (d) => {
            if (this.currentMode === ChartMode.explore) {
                return DEFAULT_FONTSIZE + "px";
            }
            if (d.IsSelected || d.IsSibling) { return SIBLING_FONTSIZE + "px"; }
            else { return DEFAULT_FONTSIZE + "px"; }
        }).attr("transform", (d) => {
            let transformString = "rotate(0)";
            if (this.currentMode === ChartMode.explore && d.ParentNodeID !== null) {
                if (d.x >= RADIAL_DEPTH) {
                    transformString = "rotate(" + -Math.abs(d.x - RADIAL_DEPTH) + ")";
                } else {
                    console.log(d);
                    transformString = "rotate(" + Math.abs(d.x - RADIAL_DEPTH) + ")";
                }
            }
            return transformString;
        });

        nodeEnter.append("g")
            .attr("class", "label");

        nodeEnter.select("g.label").append(TEXT)
            .attr("data-id", "name");

        nodeEnter.select("g.label").append(TEXT)
            .attr("data-id", "description");

        node.select("g.label text[data-id='name']").text((d) => {
            let name = "";
            if (this.showFirstNameLabel && this.showLastNameLabel) {
                name = d.NodeFirstName + " " + d.NodeLastName;
            } else if (this.showFirstNameLabel) {
                name = d.NodeFirstName;
            } else if (this.showLastNameLabel) {
                name = d.NodeLastName;
            }

            if (this.currentMode === ChartMode.explore) {
                return name = d.NodeFirstName;
            }

            if (name.length > 15) {
                if (this.currentMode === ChartMode.build) {
                    return d.IsSelected || d.IsGrandParent ? "" : name.substring(0, 15) + "...";
                } else {
                    return name.substring(0, 15) + "...";
                }
            } else {
                if (this.currentMode === ChartMode.build) {
                    return d.IsSelected || d.IsGrandParent ? "" : name;
                } else {
                    return name;
                }
            }
        }).attr("text-anchor", (d) => {
            if (this.currentMode === ChartMode.build) { return "start"; }
            else if (this.currentMode === ChartMode.report) { return "middle"; }
            else {
                if (d.NodeID === this.root.NodeID && this.currentMode === ChartMode.explore)
                    return "start";
                else
                    return d.x < DEPTH ? "start" : "end";
            }
        }).attr("transform", (d) => {
            if (this.currentMode === ChartMode.explore) {
                if (d.NodeID === this.root.NodeID && this.currentMode === ChartMode.explore)
                    return "rotate(0)";
                else
                    return d.x < DEPTH ? "rotate(0)" : "rotate(180)";
            } else {
                return "rotate(0)";
            }
        });

        node.select("g.label text[data-id='description']").text((d) => {
            if (d.Description > 15) {
                if (this.currentMode === ChartMode.build) {
                    return d.IsSelected || d.IsGrandParent ? "" : d.Description.substring(0, 15) + "...";
                } else if (this.currentMode === ChartMode.explore) {
                    return d.Description.substring(0, 15) + "...";
                } else {
                    return d.Description.substring(0, 15) + "...";
                }
            } else {
                if (this.currentMode === ChartMode.build) { return d.IsSelected || d.IsGrandParent ? "" : d.Description; }
                else if (this.currentMode === ChartMode.explore) { return d.Description; }
                else { return d.Description; }
            }
        }).attr("text-anchor", (d) => {
            if (this.currentMode === ChartMode.build) { return "start"; }
            else if (this.currentMode === ChartMode.report) { return "middle"; }
            else {
                if (d.NodeID === this.root.NodeID && this.currentMode === ChartMode.explore)
                    return "start";
                else
                    return d.x < DEPTH ? "start" : "end";
            }
        }).attr("dy", (d) => {
            if (this.showDescriptionLabel && !this.showFirstNameLabel && !this.showLastNameLabel) {
                return "0em";
            }
            else { return "1em"; }
        }).attr("transform", (d) => {
            if (this.currentMode === ChartMode.explore) {
                if (d.NodeID === this.root.NodeID && this.currentMode === ChartMode.explore)
                    return "rotate(0)";
                else {
                    return d.x < DEPTH ? "rotate(0)" : "rotate(180)";
                }
            } else {
                return "rotate(0)";
            }
        });

        if (this.currentMode === ChartMode.build) {
            node.select("g.label").attr("x", function (d) {
                if (d.IsParent === true || d.IsChild === true) { return PARENTCHILD_RADIUS + DEFAULT_MARGIN; }
                else { return SIBLING_RADIUS + DEFAULT_MARGIN; }
            });
        } else {
            node.select("g.label").attr("y", 30);
        }

        // used to get the label width of each node
        this.labelWidths = node.select("g.label").each(function (d) {
            return d3.select(this).node();
        });

        node.select("g.label").attr("transform", (d, index) => {
            let margin = DEFAULT_MARGIN * 4;
            if (this.currentMode === ChartMode.build) {
                if (!d.IsSibling) {
                    margin = DEFAULT_MARGIN * 3;
                }
                return "translate(" + margin + ",0)";
            } else if (this.currentMode === ChartMode.report) {
                if (d.IsSelected) margin = DEFAULT_MARGIN * 5;
                return "translate(0," + margin + ")";
            } else {
                margin = DEFAULT_MARGIN * 3;
                return "translate(" + margin + ",0)";
            }
        });

        // creates a polygon to indicate it has child(s)
        nodeEnter.append(POLYGON)
            .attr("points", LABEL_POINTS)
            .attr("data-id", "childIndicator");

        // css class is applied on polygon if a node have child(s) and the polygon is transformed to the position given  
        node.select("polygon[data-id='childIndicator']").attr("fill", function (d) {
            if (d._children && d._children.length > 0 && !d.IsSelceted) {
                return CHILD_ARROW_FILL;
            } else {
                return TRANSPARENT_COLOR;
            }
        }).attr("transform", (d, index) => {
            let x = Math.round(this.labelWidths[0][index].getBoundingClientRect()["width"]);
            if (d.IsSibling) {
                x += (DEFAULT_MARGIN * 2) + (SIBLING_RADIUS - PARENTCHILD_RADIUS);
            } else {
                x += (DEFAULT_MARGIN * 2);
            }
            return "translate(" + x + ",0)";
        });

        node.select(CIRCLE).attr("class", (d) => {
            return d.IsSelected ? SELECTED_CIRCLE : DEFAULT_CIRCLE;
        }).attr("transform", (d) => {
            let transformString = "rotate(0)";
            if (this.currentMode === ChartMode.explore && d.ParentNodeID !== null) {
                if (d.x > RADIAL_DEPTH) {
                    transformString = "rotate(" + -Math.abs(d.x - RADIAL_DEPTH) + ")";
                } else {
                    transformString = "rotate(" + Math.abs(d.x - RADIAL_DEPTH) + ")";
                }
            }
            return transformString;
        });

        // Transition nodes to their new position.
        let nodeUpdate = node.transition()
            .duration(DURATION)
            .attr("transform", (d) => {
                if (this.currentMode === ChartMode.build) {
                    return "translate(" + d.y + "," + d.x + ")";
                } else if (this.currentMode === ChartMode.report) {
                    return "translate(" + d.x + "," + d.y + ")";
                } else {
                    if (d.ParentNodeID == null) {
                        return "rotate(0)";
                    }
                    return "rotate(" + (d.x - RADIAL_DEPTH) + ")translate(" + d.y + ")";
                }
            });

        nodeUpdate.select(CIRCLE)
            .attr("r", (d) => {
                if (this.currentMode !== ChartMode.explore) {
                    if (d.IsSelected === true || d.IsSibling === true) { return SIBLING_RADIUS; }
                    else if (d.IsParent === true || d.IsChild === true) { return PARENTCHILD_RADIUS; }
                    else if (d.IsGrandParent === true) { return GRANDPARENT_RADIUS; }
                    else { return DEFAULT_RADIUS; }
                } else {
                    return PARENTCHILD_RADIUS;
                }
            })
            .attr("class", (d) => {
                if (d.IsSelected && d.IsStaging && d.NodeID === -1) { return STAGED_CIRCLE; }
                if (d.IsSelected) { return SELECTED_CIRCLE; }
                else if (d.IsSibling) { return DEFAULT_CIRCLE + " sibling"; }
                else { return DEFAULT_CIRCLE; }
            })
            .style("filter", function (d) {
                return d.IsStaging && d.NodeID === -1 ? " " : "url(home#drop-shadow)";
            });

        nodeUpdate.select("g.label")
            .style({ "fill-opacity": 1, "fill": "#979797" });

        let nodeExit = node.exit().transition().delay(100).
            duration(DURATION)
            .attr("transform", (d) => {
                if (this.currentMode === ChartMode.build) {
                    return "translate(" + source.y + "," + source.x + ")";
                } else if (this.currentMode === ChartMode.report) {
                    return "translate(" + source.x + "," + source.y + ")";
                } else {
                    return "rotate(" + (source.x - RADIAL_DEPTH) + ")translate(" + source.y + ")";
                }
            })
            .remove();

        nodeExit.select(CIRCLE)
            .attr("r", 1e-6);

        nodeExit.select("g.label")
            .style("fill-opacity", 1e-6);

        node.each(function (d) {
            if (d.IsFakeRoot)
                d3.select(this).remove();
        });

    }
    renderOrUpdateLinks(source) {
        let sourceCoords = { x: source.x0, y: source.y0 };
        let diagCoords = this.diagonal({ source: sourceCoords, target: sourceCoords });

        let sourceCoords2 = { x: source.x, y: source.y };
        let diagCoords2 = this.diagonal({ source: sourceCoords2, target: sourceCoords2 });

        // Update the links…
        let link = this.svg.selectAll("path.link")
            .data(this.links, function (d) { return d.target.NodeID; });

        // Enter any new links at the parent"s previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("id", function (d) {
                return ("link" + d.source.NodeID + "-" + d.target.NodeID);
            })
            .attr("d", function (d) {
                return diagCoords;
            });

        // Transition links to their new position.
        link.transition()
            .duration(DURATION)
            .attr("d", this.diagonal);

        link.style("stroke", (d) => {
            if (this.currentMode === ChartMode.report) {
                return "rgba(204, 204, 204,0.5)";
            } else {
                return (d.source.IsSelected ? "#ccc" : "none");
            }
        });

        // Transition exiting nodes to the parent"s new position.
        link.exit().transition()
            .duration(DURATION)
            .attr("d", function (d) {
                return diagCoords2;
            })
            .remove();

        link.each(function (d) {
            if (d.source.IsFakeRoot)
                d3.select(this).remove();
        });
    }

    setPeerReporteeNode(nodeName, x, y, className) {
        let node = d3.select("g." + className);
        let element = node[0][0]; // assigns the selected element
        if (!element) {
            node = this.svg.append("g")
                .attr("class", className)
                .attr("transform", function (d) { return "translate(" + y + "," + x + ")"; })
                .on("click", (ev) => this.peerReporteeNodeClicked(nodeName));

            node.append(CIRCLE)
                .attr("r", DEFAULT_RADIUS)
                .attr("class", "new-peer_reportee-circle");

            node.append(TEXT)
                .attr("dy", ".4em")
                .text("+")
                .attr("class", "new-peer_reportee-innerText");

            node.append(TEXT)
                .attr("dy", "2.25em")
                .text(nodeName)
                .attr("class", "new-peer_reportee-outerText");
        } else {
            node.attr("transform", function (d) { return "translate(" + y + "," + x + ")"; });
        }
    }

    showUpdatePeerReporteeNode(source) {
        if (this.currentMode === ChartMode.build) {
            if (source && this.selectedOrgNode && !this.isAddOrEditModeEnabled) {
                if (source.NodeID !== -1) {
                    if (source.parent) {
                        let node: any;
                        node = source.parent.children ? source.parent.children : source.parent._children;
                        let childrenCount = node.length - 1;
                        if (node[childrenCount]) {
                            let x = node[childrenCount].x + (childrenCount === 0 ? NODE_DEFAULT_DISTANCE : (node[childrenCount].x - node[childrenCount - 1].x));
                            this.setPeerReporteeNode(PEER_TEXT, x, source.y, "peerNode");
                        }
                    } else {
                        d3.select("g.peerNode").remove();
                    }

                    if (!this.selectedOrgNode.children) {
                        let y = source.y + NODE_DEFAULT_DISTANCE;
                        this.setPeerReporteeNode(REPORTEE_TEXT, source.x, y, "directReporteeNode");
                    } else {
                        d3.select("g.directReporteeNode").remove();
                    }
                } else {
                    this.removePeerAndReporteeNodes();
                }
            } else {
                this.removePeerAndReporteeNodes();
            }
        } else {
            this.removePeerAndReporteeNodes();
        }
    }

    removePeerAndReporteeNodes() {
        d3.select("g.peerNode").remove();
        d3.select("g.directReporteeNode").remove();
    }

    peerReporteeNodeClicked(nodeName) {
        if (nodeName === REPORTEE_TEXT) {
            this.addNewNode(this.selectedOrgNode);
        } else {
            this.addNewNode(this.selectedOrgNode.parent);
        }
    }

    bodyClicked(d, event) {
        // event.stopPropagation();
        if (this.currentMode === ChartMode.build) {
            if (event.target.nodeName === "svg") {
                if (!this.isAddOrEditModeEnabled && this.selectedOrgNode) {
                    this.deselectNode();
                    this.selectNode.emit(this.selectedOrgNode);
                }
            }
        }
    }

    deselectNode() {
        if (this.selectedOrgNode) {
            if (this.selectedOrgNode.NodeID !== -1) {
                //  Save the last selection temp so that the graph maintains its position
                this.lastSelectedNode = this.selectedOrgNode;
                this.highlightSelectedNode(null);
                this.render(this.root);
                this.centerNode(this.lastSelectedNode);
            }
        }
    }

    keyDown(d, eve) {
        let event = eve;
        if (!this.selectedOrgNode || this.isAddOrEditModeEnabled) {
            return;
        }

        if (this.selectedOrgNode.NodeID === -1) {
            return;
        }

        if (this.currentMode === ChartMode.build) {
            // esc
            if ((event as KeyboardEvent).keyCode === 27) {
                if (!this.isAddOrEditModeEnabled) {
                    this.deselectNode();
                    this.selectNode.emit(this.selectedOrgNode);
                }
            }

            // left arrow
            if ((event as KeyboardEvent).keyCode === 37) {
                let node = this.selectedOrgNode as d3.layout.tree.Node;
                if (node.parent != null) {
                    let parentNode = node.parent;
                    this.highlightAndCenterNode(parentNode);
                }
                else {
                    this.addNewRootNode(this.root);
                }
            }
            // right arrow
            else if ((event as KeyboardEvent).keyCode === 39) {
                if (this.selectedOrgNode.children && this.selectedOrgNode.children.length > 0) {
                    let node = this.selectedOrgNode.children[0];
                    this.highlightAndCenterNode(node);
                } else {
                    this.addNewNode(this.selectedOrgNode);
                }
            }
            // top arrow
            else if ((event as KeyboardEvent).keyCode === 38) {
                let node = this.selectedOrgNode as d3.layout.tree.Node;
                if (node.parent != null) {
                    let siblings = node.parent.children;
                    let index = siblings.indexOf(node);
                    if (index > 0) {
                        let elderSibling = siblings[index - 1];
                        this.highlightAndCenterNode(elderSibling);
                    }
                }
            }
            // bottom arrow
            else if ((event as KeyboardEvent).keyCode === 40) {
                let node = this.selectedOrgNode as d3.layout.tree.Node;
                if (node.parent != null) {
                    let siblings = node.parent.children;
                    let index = siblings.indexOf(node);
                    if (index < siblings.length - 1) {
                        let youngerSibling = siblings[index + 1];
                        this.highlightAndCenterNode(youngerSibling);
                    } else {
                        this.addNewNode(node.parent);
                    }
                }
            }
        }
        else if (this.currentMode === ChartMode.explore) {
            // right arrow
            if ((event as KeyboardEvent).keyCode === 39) {
                let node = this.selectedOrgNode as d3.layout.cluster.Result;
                console.log(node);
                if (this.selectedOrgNode.children && this.selectedOrgNode.children.length > 0) {
                    let node = this.selectedOrgNode.children[0];
                    this.highlightSelectedNode(node);
                    this.render(node);
                }
            }
            // left arrow 
            else if ((event as KeyboardEvent).keyCode === 37) {
                let node = this.selectedOrgNode as d3.layout.cluster.Result;
                if (node.parent != null) {
                    let parentNode = node.parent;
                    this.highlightSelectedNode(parentNode);
                    this.render(parentNode);
                }
            }
            // bottom arrow
            else if ((event as KeyboardEvent).keyCode === 40) {
                let node = this.selectedOrgNode as d3.layout.cluster.Result;
                if (node.parent != null) {
                    let siblings = node.parent.children;
                    let index = siblings.indexOf(node);
                    let youngerSibling;
                    if (index < siblings.length - 1) {
                        youngerSibling = siblings[index + 1];
                    } else {
                        youngerSibling = siblings[0];
                    }
                    this.highlightSelectedNode(youngerSibling);
                    this.render(youngerSibling);
                }
            }
            // top arrow
            else if ((event as KeyboardEvent).keyCode === 38) {
                let node = this.selectedOrgNode as d3.layout.cluster.Result;
                if (node.parent != null) {
                    let siblings = node.parent.children;
                    let index = siblings.indexOf(node);
                    let elderSibling;
                    if (index > 0) {
                        elderSibling = siblings[index - 1];

                    } else {
                        elderSibling = siblings[siblings.length - 1];
                    }
                    this.highlightSelectedNode(elderSibling);
                    this.render(elderSibling);
                }
            }
        }
        /*else {
            // esc
            if ((event as KeyboardEvent).keyCode === 27) {
                if (!this.isAddOrEditModeEnabled) {
                    this.deselectNode();
                    this.selectNode.emit(this.selectedOrgNode);
                }
            }
    
            // top arrow
            if ((event as KeyboardEvent).keyCode === 38) {
                let node = this.selectedOrgNode as d3.layout.tree.Node;
                if (node.parent != null) {
                    let parentNode = node.parent;
                    this.highlightAndCenterNode(parentNode);
                }
            }
            // bottom arrow
            else if ((event as KeyboardEvent).keyCode === 40) {
                if (this.selectedOrgNode.children && this.selectedOrgNode.children.length > 0) {
                    let node = this.selectedOrgNode.children[0];
                    this.highlightAndCenterNode(node);
                } else {
                    //  this.addNewNode(this.selectedOrgNode);
                }
            }
            // left arrow
            else if ((event as KeyboardEvent).keyCode === 37) {
                let node = this.selectedOrgNode as d3.layout.tree.Node;
                if (node.parent != null) {
                    let siblings = node.parent.children;
                    let index = siblings.indexOf(node);
                    if (index > 0) {
                        let elderSibling = siblings[index - 1];
                        this.highlightAndCenterNode(elderSibling);
                    }
                }
            }
            // right arrow
            else if ((event as KeyboardEvent).keyCode === 39) {
                let node = this.selectedOrgNode as d3.layout.tree.Node;
                if (node.parent != null) {
                    let siblings = node.parent.children;
                    let index = siblings.indexOf(node);
                    if (index < siblings.length - 1) {
                        let youngerSibling = siblings[index + 1];
                        this.highlightAndCenterNode(youngerSibling);
                    } else {
                        //   this.addNewNode(node.parent);
                    }
                }
            }
    
        }*/
    }

    getNode(nodeID: number, rootNode: any) {
        if (rootNode.NodeID === nodeID) {
            return rootNode;
        } else {
            let nodes = rootNode.children ? rootNode.children : rootNode._children;
            if (nodes) {
                let node;
                for (let i = 0; i < nodes.length; i++) {
                    if (!node) {
                        node = this.getNode(nodeID, nodes[i]);
                    }
                };
                return node;
            }
        }
    }


    addParentToNode(isFake: boolean, node: OrgNodeModel) {
        if (!node.ParentNodeID || node.ParentNodeID === -1) {
            let newNode = new OrgNodeModel();
            newNode.NodeFirstName = "";
            newNode.NodeLastName = "";
            newNode.Description = "";
            newNode.OrgGroupID = node.OrgGroupID;
            newNode.CompanyID = node.CompanyID;
            newNode.NodeID = -1;
            newNode.IsStaging = true;
            newNode.IsFakeRoot = isFake;
            newNode.IsNewRoot = true;
            newNode.children = new Array<OrgNodeModel>();
            newNode.children.push(node);
            node.ParentNodeID = newNode.NodeID;
            return newNode;
        }
    }

    addEmptyChildToParent(node: OrgNodeModel) {
        if (!node.children) {
            node.children = new Array<OrgNodeModel>();
        }
        let newNode = new OrgNodeModel();
        newNode.ParentNodeID = node.NodeID;
        newNode.NodeFirstName = "";
        newNode.NodeLastName = "";
        newNode.Description = "";
        newNode.OrgGroupID = node.OrgGroupID;
        newNode.CompanyID = node.CompanyID;
        newNode.NodeID = -1;
        newNode.IsStaging = true;
        node.children.push(newNode);
        return newNode;
    }

    highlightAndCenterNode(d) {
        this.highlightSelectedNode(d);
        this.render(d);
        this.centerNode(d);
        this.hideTopArrow(d);
    }

    hideTopArrow(d) {
        if (d.ParentNodeID) {
            let index;
            let currentNode = d;
            let parentNode = this.getNode(d.ParentNodeID, this.root);
            if (parentNode && parentNode.children && parentNode.children.length > 0) {
                parentNode.children.forEach(function (d) {
                    if (d.NodeID === currentNode.NodeID) {
                        index = parentNode.children.indexOf(currentNode, 0);
                        if (index === 0) {
                            d3.select(POLYGON + "#top")
                                .attr("stroke", TRANSPARENT_COLOR)
                                .attr("fill", TRANSPARENT_COLOR);
                        }
                    }
                });
            }
        }
    }

    nodeClicked(d) {
        if (this.currentMode === ChartMode.build) {
            if (this.selectedOrgNode && this.selectedOrgNode.NodeID === -1) {
                return;
            }
            this.expandCollapse(d);
            this.highlightAndCenterNode(d);
        } else if (this.currentMode === ChartMode.explore) {
            this.highlightSelectedNode(d);
            this.render(d);
        }
    }

    expandCollapse(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    showChildren(d) {
        if (!d.children) {
            d.children = d._children;
            d._children = null;
        }
    }

    hideChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }
    }

    highlightSelectedNode(d, raiseEvent: boolean = true) {
        if (this.selectedOrgNode) {
            this.selectedOrgNode.IsSelected = false;
        }
        if (d != null) {
            if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== d.ParentNodeID && this.currentMode === ChartMode.build) {
                this.hideChildren(this.selectedOrgNode);
            }
            d.IsSelected = true;
            if (raiseEvent === true) {
                this.selectNode.emit(d);
            }
            this.showChildren(d);
        }
        this.selectedOrgNode = d;
    }

    updateSelectedOrgNode(node: OrgNodeModel) {
        if (this.compareNodeID(node, this.selectedOrgNode)) {
            this.selectedOrgNode = node;
            return true;
        } else {
            let nodeSelected;
            if (!nodeSelected) {
                if (node.children) {
                    for (let j = 0; j < node.children.length; j++) {
                        this.updateSelectedOrgNode(node.children[j]);
                    }
                }
            }
        }
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        return updatedNode.NodeID === currentNode.NodeID;
    }

    private addNewRootNode(childNode) {
        let rootNode = this.addParentToNode(false, childNode as OrgNodeModel);
        this.root = rootNode;
        this.switchToAddMode.emit(rootNode);
        this.highlightAndCenterNode(rootNode);
        this.hideAllArrows();
    }

    private addNewNode(node) {
        let newNode = this.addEmptyChildToParent(node as OrgNodeModel);
        this.switchToAddMode.emit(newNode);
        this.highlightAndCenterNode(newNode);
        this.hideAllArrows();
    }

    private isAncestorOrRelated(node: OrgNodeModel) {
        node.IsChild = false;
        node.IsParent = false;
        node.IsGrandParent = false;
        node.IsSibling = false;
        node.IsSelected = false;
        node.Show = false;
        if (this.selectedOrgNode != null) {
            // if this is the selected node, or sibling or selected node's parent or selected nodes child
            if (this.selectedOrgNode.NodeID === node.NodeID) {
                // mark as sibling so that it maintains style even after deselection by clicking outside
                node.IsSibling = true;
                node.Show = true;
                node.IsSelected = true;
            }
            else if (this.selectedOrgNode.ParentNodeID === node.ParentNodeID) {
                node.IsSibling = true;
                node.Show = true;
            }
            // if this is the selected node, or sibling or selected node's parent or selected nodes child
            else if (this.selectedOrgNode.ParentNodeID === node.NodeID) {
                node.IsParent = true;
                node.Show = true;
            }
            else if (this.selectedOrgNode.NodeID === node.ParentNodeID) {
                node.IsChild = true;
                node.Show = true;
            }
            else {
                let selectedTreeNode = this.selectedOrgNode as d3.layout.tree.Node;
                if (selectedTreeNode.parent || (this.selectedOrgNode.NodeID === -1)) {
                    if (!selectedTreeNode.parent) {
                        selectedTreeNode.parent = this.getNode(this.selectedOrgNode.ParentNodeID, this.root);
                    }
                    if (selectedTreeNode.parent.parent) {
                        let nodeID = (selectedTreeNode.parent as OrgNodeModel).ParentNodeID;
                        if (nodeID === node.NodeID) {
                            node.IsGrandParent = true;
                            node.Show = true;
                        }
                    }
                }
            }
        }
        if (this.currentMode !== ChartMode.build) {
            node.Show = true;
        }
        return false;
    }
}