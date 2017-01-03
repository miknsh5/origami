import {
    Component, HostListener, Inject, Input, Output, Directive, EventEmitter,
    Attribute, OnChanges, DoCheck, ElementRef, OnInit, SimpleChange
} from "@angular/core";

import * as d3 from "d3";
import { DraggedNode, OrgNodeModel, OrgService, ChartMode } from "../../shared/index";

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

const LABEL_POINTS = "18 5 18 -5 21 0";
const ARROW_POINTS = "55 33 55 21 59 27";
const NAVIGATION_ARROW_FILL = "#D8D8D8";
const CHILD_ARROW_FILL = "#929292";
const PATH_STORKE_COLOR = "#979797";
const TRANSPARENT_COLOR = "transparent";

const NODE_HEIGHT = 70;
const NODE_WIDTH = 95;
const RADIAL_DEPTH = 90;
const DEPTH = 180;
const RADIAL_VALUE = 360;
const VIEWBOX_MIN_WIDTH = 580;
const VIEWBOX_MIN_HEIGHT = 420;
const VIEWBOX_MAX_WIDTH = 1366;
const VIEWBOX_MAX_HEIGHT = 768;

const DEFAULT_CIRCLE = "defaultCircle";
const STAGED_CIRCLE = "stagedCircle";
const SELECTED_CIRCLE = "selectedCircle";
const MOVE_CIRCLE = "moveNodeCircle";

const POLYGON = "polygon";
const CIRCLE = "circle";
const TEXT = "text";
const PATH = "path";
const G_LABEL = "g.label";
const TRANSFORM = "transform";
const STROKE = "stroke";
const FILL = "fill";
const CLASS = "class";
const NONE = "none";

const DEFAULT_FONTSIZE = 11;
const SIBLING_FONTSIZE = 17.3;

@Component({
    selector: "sg-org-tree",
    template: ``
})

export class OrgTreeComponent implements OnInit, OnChanges {
    private tree: any;
    private diagonal: any;
    private descriptionWidths: any;
    private svg: any;
    private graph: any;
    private root: any;
    private nodes: any;
    private links: any;
    private selectedOrgNode: any;
    private labelWidths: any;
    private treeWidth: number;
    private treeHeight: number;
    private previousRoot: any;
    private lastSelectedNode: any;
    private arrows: any;
    private levelDepth: any;

    // variables for drag/drop
    private targetNode = null;
    private draggingNode = null;
    private dragStarted: any;
    private dragListener: any;
    private domNode: any;
    private isNodeMoved: boolean;
    private isNodedragStarted: boolean;

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
    @Input() isMenuSettingsEnabled: boolean;
    @Input() searchNode: OrgNodeModel;
    @Input() isNodeMoveEnabledOrDisabled: boolean;
    @Input() isFeedbackInEditMode: boolean;
    @Input() isHorizontalViewEnabled: boolean;

    @Output() selectNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() switchToAddMode = new EventEmitter<OrgNodeModel>();
    @Output() moveNode = new EventEmitter<DraggedNode>();
    @Output() isNodeMoveDisabled = new EventEmitter<boolean>();

    constructor(private orgService: OrgService,
        @Inject(ElementRef) elementRef: ElementRef) {
        let el: any = elementRef.nativeElement;
        this.graph = d3.select(el);
    }

    ngOnInit() {
        //  Todo:- We need to use the values coming from the host instead of our own
        let margin = { top: TOPBOTTOM_MARGIN, right: RIGHTLEFT_MARGIN, bottom: TOPBOTTOM_MARGIN, left: RIGHTLEFT_MARGIN };

        this.levelDepth = [1];
        this.treeWidth = this.width;
        this.treeHeight = this.height;
        this.isNodeMoved = false;
        this.initializeTreeAsPerMode();
        this.svg = this.graph.append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${this.treeWidth} ${this.treeHeight}`)
            .attr("width", this.treeWidth)
            .attr("height", this.treeHeight)
            .append("g")
            .attr(CLASS, "svg-pan-zoom_viewport");

        let verticalLine: [number, number][] = [[(this.treeWidth / 2), this.treeHeight], [(this.treeWidth / 2), 0]];
        let horizontalLine: [number, number][] = [[0, (this.treeHeight / 2)], [this.treeWidth, (this.treeHeight / 2)]];

        // Creates and vertical line
        this.createLines(verticalLine, "vertical");
        // Creates and horizontal line
        this.createLines(horizontalLine, "horizontal");

        this.svg.append("g")
            .attr(CLASS, "nodes")
            .attr(TRANSFORM, this.translate(margin.left, margin.top));

        this.arrows = this.svg.append("g")
            .attr("id", "arrows")
            .attr(TRANSFORM, this.translate(((this.treeWidth / 2) - SIBLING_RADIUS * 1.35), ((this.treeHeight / 2) - SIBLING_RADIUS * 1.275)));

        this.svg = d3.select("g.nodes");
        this.svg.append("g").attr("id", "concentricRings");

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
    }

    // TODO:- we should refactor this method to work depending on the kind of change that has taken place.
    // It re-renders on all kinds of changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (this.tree != null) {
            this.previousRoot = this.root;
            this.root = this.treeData[0];
            this.treeWidth = this.width;
            this.treeHeight = this.height;

            if (changes["searchNode"]) {
                if (changes["searchNode"].currentValue) {
                    this.selectedOrgNode = this.searchNode;
                    this.highlightAndCenterNode(this.selectedOrgNode);
                } else {
                    return;
                }
            }

            if (changes["orgGroupID"]) {
                if (this.root) {
                    this.selectedOrgNode = this.root;
                } else if (!this.root || changes["currentMode"]) {
                    this.addEmptyRootNode();
                    this.selectedOrgNode = this.root;
                }
            }

            if (changes["isMenuSettingsEnabled"]) {
                if (!changes["treeData"]) {
                    if (this.isAddOrEditModeEnabled && this.selectedOrgNode.NodeID === -1) {
                        return;
                    }
                } else {
                    this.root = this.treeData[0];
                    this.selectedOrgNode = this.root;
                }
            }

            if (changes["isAddOrEditModeEnabled"] && this.isAddOrEditModeEnabled && !changes["treeData"]) {
                return;
            }

            if (changes["isHorizontalViewEnabled"] || changes["currentMode"] || (changes["orgGroupID"] && this.isExploreMode())) {
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

            let raiseSelectedEvent: boolean = true;
            if (changes["isAddOrEditModeEnabled"]) {
                // We don't need to raise a selectednode change event if the only change happening is entering/leaving edit node
                if (this.isAddOrEditModeEnabled)
                    raiseSelectedEvent = false;
            }

            if (!this.root) {
                if (this.selectedOrgNode.NodeID === -1) {
                    this.root = this.selectedOrgNode;
                } else {
                    this.addEmptyRootNode();
                    this.selectedOrgNode = this.root;
                }
            }

            this.calculateLevelDepth();
            this.resizeLinesArrowsAndSvg();
            if (!this.isBuildMode()) {
                this.setNodeLabelVisiblity();
                if (this.isReportMode()) {
                    this.root = this.selectedOrgNode;
                }
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

                if (this.selectedOrgNode != null) {
                    if (!this.isExploreMode()) {
                        this.render(this.root);
                        this.showUpdatePeerReporteeNode(this.selectedOrgNode);
                        this.centerNode(this.selectedOrgNode);
                        this.resetDragNode(null);
                    }
                    if (this.isAddOrEditModeEnabled) {
                        this.hideAllArrows();
                    } else {
                        this.hideTopArrow(this.selectedOrgNode);
                    }

                    if (this.searchNode) {
                        if (!this.lastSelectedNode || this.lastSelectedNode && this.lastSelectedNode.NodeID !== this.selectedOrgNode.NodeID) {
                            setTimeout(() => { // implemented timeout for preventing the node gaps on searched
                                this.nodeClicked(this.selectedOrgNode);
                                this.lastSelectedNode = this.selectedOrgNode;
                            }, 100);
                        }
                    }
                }
            } else {
                // check whether the width or height property has changed or not
                if (changes["width"] || changes["height"]) {
                    // centers the last selected node
                    this.centerNode(this.lastSelectedNode);
                }
            }
            this.isNodeMoved = false;
        }
    }

    @HostListener("window:click", ["$event"])
    bodyClicked(event: any) {
        if (event.defaultPrevented) return; // click suppressed
        if (this.isBuildMode() && !this.isAddOrEditModeEnabled && !this.isNodeMoved) {
            if (event.target.nodeName === "svg") {
                if (!this.isAddOrEditModeEnabled && this.selectedOrgNode) {
                    this.isNodeMoveDisabled.emit(false);
                    this.deselectNode();
                    this.selectNode.emit(this.selectedOrgNode);
                }
            }
        }
    }

    @HostListener("document:keydown", ["$event"])
    keyDown(event: any) {
        if (!this.isAddOrEditModeEnabled) {
            if (!this.isMenuSettingsEnabled) {
                if (!this.selectedOrgNode || this.isAddOrEditModeEnabled) {
                    return;
                }

                if (this.selectedOrgNode.NodeID === -1) {
                    return;
                }

                // esc
                if ((event as KeyboardEvent).keyCode === 27) {
                    if (!this.isAddOrEditModeEnabled && !this.isNodeMoved && !this.isNodedragStarted) {
                        this.deselectNode();
                        this.selectNode.emit(this.selectedOrgNode);
                    }
                }

                // left arrow
                if ((event as KeyboardEvent).keyCode === 37) {
                    let node = this.selectedOrgNode as d3.layout.tree.Node;
                    let parentNode = node.parent;
                    if (this.isBuildMode() && !this.isFeedbackInEditMode && !this.draggingNode) {
                        if (parentNode != null) {
                            this.highlightAndCenterNode(parentNode);
                        } else {
                            this.addNewRootNode(this.root);
                        }
                    } else if (this.isExploreMode()) {
                        if (parentNode != null) {
                            this.highlightSelectedNode(parentNode);
                            this.render(parentNode);
                        }
                    }
                }
                // right arrow
                else if ((event as KeyboardEvent).keyCode === 39) {
                    let childNode = null;
                    if (this.selectedOrgNode.children && this.selectedOrgNode.children.length > 0) {
                        childNode = this.selectedOrgNode.children[0];
                    }
                    if (this.isBuildMode() && !this.isFeedbackInEditMode && !this.draggingNode) {
                        if (childNode != null) {
                            this.highlightAndCenterNode(childNode);
                        } else {
                            this.addNewNode(this.selectedOrgNode);
                        }
                    } else if (this.isExploreMode()) {
                        if (childNode != null) {
                            this.highlightSelectedNode(childNode);
                            this.render(childNode);
                        }
                    }
                }
                // top arrow
                else if ((event as KeyboardEvent).keyCode === 38) {
                    let node = this.selectedOrgNode as d3.layout.tree.Node;
                    if (this.isBuildMode() && !this.isFeedbackInEditMode && !this.draggingNode) {
                        if (node.parent != null) {
                            let siblings = node.parent.children;
                            let index = siblings.indexOf(node);
                            if (index > 0) {
                                let elderSibling = siblings[index - 1];
                                this.highlightAndCenterNode(elderSibling);
                            }
                        }
                    } else if (this.isExploreMode()) {
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
                // bottom arrow
                else if ((event as KeyboardEvent).keyCode === 40) {
                    let node = this.selectedOrgNode as d3.layout.tree.Node;
                    if (this.isBuildMode() && !this.isFeedbackInEditMode && !this.draggingNode) {
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
                    } else if (this.isExploreMode()) {
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
                }
            }
        }
    }

    private initializeTreeAsPerMode() {
        if (this.isBuildMode()) {
            this.tree = d3.layout.tree().nodeSize([NODE_HEIGHT, NODE_WIDTH]);
            this.diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });
        } else if (this.isReportMode()) {
            if (this.isHorizontalViewEnabled) {
                this.tree = d3.layout.tree().nodeSize([RIGHTLEFT_MARGIN, NODE_WIDTH]);
                this.setNodeLabelVisiblity();
                this.root = this.selectedOrgNode || this.lastSelectedNode;
                this.diagonal = d3.svg.diagonal()
                    .projection(function (d) {
                        return [d.y, d.x];
                    });
            } else {
                this.tree = d3.layout.tree().nodeSize([RIGHTLEFT_MARGIN, NODE_HEIGHT]);
                this.setNodeLabelVisiblity();
                this.root = this.selectedOrgNode || this.lastSelectedNode;
                this.diagonal = d3.svg.diagonal()
                    .projection(function (d) {
                        return [d.x, d.y];
                    });
            }
        } else {
            this.tree = d3.layout.tree().size([RADIAL_VALUE, RADIAL_VALUE])
                .separation(function (a, b) {
                    return (a.parent === b.parent ? RADIAL_VALUE : DEPTH) / a.depth;
                });
            this.setNodeLabelVisiblity();
            this.selectedOrgNode = this.root;
            this.diagonal = d3.svg.diagonal.radial()
                .projection(function (d) {
                    return [d.y, d.x / DEPTH * Math.PI];
                });
        }
    }

    private insertConcentricRings() {
        this.calculateLevelDepth();
        let concentricRings = d3.select("g#concentricRings");
        this.levelDepth.forEach((d, index) => {
            let value = (160 * index) || TOPBOTTOM_MARGIN;
            concentricRings.append(CIRCLE).attr("r", value)
                .attr(CLASS, "concentricRing")
                .style(STROKE, () => {
                    if (value === TOPBOTTOM_MARGIN)
                        return "#CFD8DC";
                    else
                        return "#EDEEEF";
                })
                .style("opacity", () => {
                    if (value === TOPBOTTOM_MARGIN)
                        return 1;
                    else
                        return 0.5;
                })
                .style("stroke-width", "3px")
                .style(FILL, NONE);
        });
    }

    private resizeLinesArrowsAndSvg() {
        if (this.isBuildMode()) {
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
        if (this.isBuildMode()) {
            d3.select(PATH + ".vertical")
                .attr("d", line(verticalLine))
                .attr(STROKE, PATH_STORKE_COLOR);

            d3.select(PATH + ".horizontal")
                .attr("d", line(horizontalLine))
                .attr(STROKE, PATH_STORKE_COLOR);

            this.arrows.attr(TRANSFORM, this.translate(((this.treeWidth / 2) - SIBLING_RADIUS * 1.35), ((this.treeHeight / 2) - SIBLING_RADIUS * 1.275)));

            d3.select("#viewport").attr(TRANSFORM, "");
        } else {
            d3.select(PATH + ".vertical")
                .attr(STROKE, TRANSPARENT_COLOR);
            d3.select(PATH + ".horizontal")
                .attr(STROKE, TRANSPARENT_COLOR);
        }

        d3.select("svg")
            .attr("viewBox", () => {
                let x = 0, y = 0, width = this.treeWidth, height = this.treeHeight;
                if (width < VIEWBOX_MIN_WIDTH || width > VIEWBOX_MAX_WIDTH) {
                    if (width > VIEWBOX_MAX_WIDTH) {
                        x = (width - VIEWBOX_MAX_WIDTH) / 2;
                        width = VIEWBOX_MAX_WIDTH;
                    } else {
                        if (width < 400) {
                            x = -60;
                        }
                        width = VIEWBOX_MIN_WIDTH;
                    }
                }
                if (height > VIEWBOX_MAX_HEIGHT) {
                    if (height > VIEWBOX_MAX_HEIGHT) {
                        y = (height - VIEWBOX_MAX_HEIGHT) / 2;
                        height = VIEWBOX_MAX_HEIGHT;
                    }
                } else if (this.treeWidth <= VIEWBOX_MIN_HEIGHT) {
                    height = window.innerHeight;
                    this.treeHeight = window.innerHeight;
                }
                return `${x} ${y} ${width} ${height}`;
            })
            .attr("width", this.treeWidth)
            .attr("height", this.treeHeight)
            .attr(CLASS, () => {
                if (this.isBuildMode())
                    return "buildMode";
                else if (this.isReportMode())
                    return "reportMode";
                else
                    return "exploreMode";
            });

        this.scrollToCenter();
    }

    private createDropShadow() {
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

    private centerNode(source) {
        let x = 0; source.y0;
        let y = 0; source.x0;
        if (this.isBuildMode()) {
            x = source.y0 || 0;
            y = source.x0 || 0;
            x = this.treeWidth / 2 - x;
            y = this.treeHeight / 2 - y;
        } else if (this.isReportMode()) {
            if (this.isHorizontalViewEnabled) {
                x = source.y0 || 0;
                y = source.x0 || 0;
                x = DEPTH;
                y = this.treeHeight / 2;
            } else {
                x = source.x0 || 0;
                y = source.y0 || 0;
                x = this.treeWidth / 2 - x;
                y = NODE_WIDTH;
            }
        } else {
            x = source.x0 || 0;
            y = source.y0 || 0;
            x = this.treeWidth / 2;
            y = this.treeHeight / 2;
        }

        d3.select("g.nodes").transition()
            .duration(DURATION)
            .attr(TRANSFORM, this.translate(x, y));

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
            d3.selectAll(`#arrows ${POLYGON}`)
                .attr(STROKE, "#FFFFFF")
                .attr(FILL, NAVIGATION_ARROW_FILL);
        } else {
            if (this.isBuildMode()) {
                d3.selectAll(POLYGON + "#right")
                    .attr(STROKE, "#FFFFFF")
                    .attr(FILL, NAVIGATION_ARROW_FILL);
            }
        }
    }

    private moveParentNodesToCenter(parentNode, source) {
        if (parentNode) {
            d3.selectAll("g.node")
                .filter(function (d) {
                    return d.NodeID === parentNode.NodeID;
                }).transition()
                .duration(DURATION)
                .attr(TRANSFORM, (d) => {
                    if (this.isBuildMode()) {
                        return this.translate(parentNode.y, (source.x || 0));
                    }
                    return this.translate((source.x0 || 0), (parentNode.y - 40));
                });
        }
    }

    private render(source) {
        if (source) {
            if (!this.nodes || this.selectedOrgNode) {
                //  The tree defines the position of the nodes based on the number of nodes it needs to draw.
                // collapse out the child nodes which will not be shown
                this.markAncestors(this.selectedOrgNode);
                let rootNode = this.root;
                if (this.isBuildMode()) {
                    if (this.searchNode && this.selectedOrgNode.ParentNodeID && this.selectedOrgNode.NodeID === this.searchNode.NodeID) {
                        this.expandTree(this.selectedOrgNode);
                        rootNode = this.getNode(this.selectedOrgNode.ParentNodeID, this.root);
                        this.expanParentAndChildNodes(rootNode);
                    } else if (rootNode && rootNode.children) {
                        for (let k = 0; k < rootNode.children.length; k++) {
                            this.collapseExceptSelectedNode(rootNode.children[k]);
                        };
                    }
                }

                this.nodes = this.tree.nodes(rootNode).reverse();

                for (let j = 0; j < this.nodes.length; j++) {
                    this.isAncestorOrRelated(this.nodes[j]);
                };
                this.nodes = this.nodes.filter(function (d) { return d.Show; });
            }

            this.links = this.tree.links(this.nodes);
            source.x0 = source.x || 0;
            source.y0 = source.y || 0;

            // Normalize for fixed-depth.
            if (this.isBuildMode()) {
                this.nodes.forEach(function (d) { d.y = d.depth * DEPTH; });
            } else if (this.isReportMode()) {
                this.nodes.forEach(function (d) { d.y = d.depth * NODE_WIDTH; });
            } else {
                this.nodes.forEach(function (d) { d.y = d.depth * (RADIAL_DEPTH + NODE_HEIGHT); });
            }

            d3.selectAll(".concentricRing").remove();
            if (this.isExploreMode()) {
                this.insertConcentricRings();
            }

            this.renderOrUpdateNodes(source);

            // Stash the old positions for transition.
            this.nodes.forEach((d) => {
                if (this.selectedOrgNode && d.NodeID === this.selectedOrgNode.ParentNodeID && this.isBuildMode()) {
                    d.x = this.selectedOrgNode.x;
                    d.x0 = this.selectedOrgNode.x;
                }
                else d.x0 = d.x;
                d.y0 = d.y;
            });

            this.renderOrUpdateLinks(source);

            this.showUpdatePeerReporteeNode(source);
        }
        this.resizeLinesArrowsAndSvg();
    }

    private renderOrUpdateNodes(source) {
        if (this.isBuildMode()) {
            d3.select("g.svg-pan-zoom_viewport")
                .transition()
                .attr(TRANSFORM, "translate(0)");
        }

        let i: number = 0;

        let node = this.svg.selectAll("g.node")
            .data(this.nodes, function (d) { return d.NodeID || (++i); });

        // Create the nodes…
        this.createNodes(node, source);

        // Set the text to the nodes…
        this.setNodeTextLabel(node);

        // css class is applied on polygon if a node have child(s) and the polygon is transformed to the position given
        node.select("polygon[data-id='childIndicator']").attr(FILL, function (d) {
            if (d._children && d._children.length > 0 && !d.IsSelceted) {
                return CHILD_ARROW_FILL;
            }
            return TRANSPARENT_COLOR;
        }).attr(TRANSFORM, (d, index) => {
            let x = Math.round(this.labelWidths[0][index].getBoundingClientRect()["width"]);
            if (d.IsSibling) {
                x += (DEFAULT_MARGIN * 2) + (SIBLING_RADIUS - PARENTCHILD_RADIUS);
            } else {
                x += (DEFAULT_MARGIN * 2);
            }
            if (this.treeHeight === (VIEWBOX_MIN_HEIGHT - RIGHTLEFT_MARGIN)) {
                x += TOPBOTTOM_MARGIN;
            }
            return this.translate(x, 0);
        }).style("visibility", "visible");

        node.select(CIRCLE).attr(CLASS, (d) => {
            if (d.IsSelected) {
                if (this.isNodeMoveEnabledOrDisabled) {
                    return MOVE_CIRCLE;
                } else {
                    return SELECTED_CIRCLE;
                }
            } else {
                return DEFAULT_CIRCLE;
            }
        }).attr(TRANSFORM, (d) => {
            let transformString = "rotate(0)";
            if (this.isExploreMode() && d.ParentNodeID !== null) {
                if (d.x > RADIAL_DEPTH) {
                    transformString = `rotate(${-Math.abs((d.x || 0) - RADIAL_DEPTH)})`;
                } else {
                    transformString = `rotate(${Math.abs((d.x || 0) - RADIAL_DEPTH)})`;
                }
            }
            return transformString;
        });

        // Update the nodes…
        this.updateNodes(node, source);

        // Remove the nodes…
        let nodeExit = node.exit().transition()
            .delay(100)
            .duration(DURATION)
            .attr(TRANSFORM, (d) => {
                if (this.isBuildMode()) {
                    return this.translate((source.y || 0), (source.x || 0));
                } else if (this.isReportMode()) {
                    if (this.isHorizontalViewEnabled) {
                        return this.translate((source.y || 0), (source.x || 0));
                    } else {
                        return this.translate(source.x, source.y);
                    }
                }
                return this.translate(source.x0, source.y0);
            })
            .remove();

        nodeExit.selectAll(CIRCLE)
            .attr("r", 1e-6);

        nodeExit.selectAll(G_LABEL)
            .style("visibility", "hidden");

        nodeExit.selectAll(G_LABEL + " text[data-id='name']")
            .style("visibility", "hidden");

        nodeExit.selectAll(G_LABEL + " text[data-id='description']")
            .style("visibility", "hidden");

        nodeExit.selectAll("#abbr")
            .style("visibility", "hidden");

        nodeExit.selectAll(".ghostCircle")
            .attr("pointer-events", "");

        nodeExit.selectAll(POLYGON)
            .style("visibility", "hidden");

        node.each(function (d) {
            if (d.IsFakeRoot)
                d3.select(this).remove();
        });
    }

    private createNodes(node, source) {
        if (!this.dragListener) {
            this.dragListener = d3.behavior.drag()
                .on("dragstart", (evt) => {
                    if (this.isBuildMode() && !this.isAddOrEditModeEnabled) {
                        if (!this.isAddOrEditModeEnabled && this.selectedOrgNode && !this.isNodeMoved) {
                            this.onNodeDragStart(evt);
                        }
                    }
                })
                .on("drag", (evt) => {
                    if (this.isBuildMode() && !this.isAddOrEditModeEnabled) {
                        if (!this.isAddOrEditModeEnabled && this.selectedOrgNode && !this.isNodeMoved) {
                            this.onNodeDrag(evt);
                        }
                    }
                })
                .on("dragend", (evt) => {
                    if (this.isBuildMode() && !this.isAddOrEditModeEnabled) {
                        if (!this.isAddOrEditModeEnabled && this.selectedOrgNode && !this.isNodeMoved) {
                            this.onNodeDragEnd(evt);
                        }
                        this.resetDragNode(null);
                    }
                });
        }

        // Enter any new nodes at the parent"s previous position.
        let nodeEnter = node.enter().append("g")
            .call(this.dragListener)
            .attr(CLASS, "node")
            .attr(TRANSFORM, (d) => {
                let transformString = this.translate((source.y0 || 0), (source.x0 || 0));
                if (this.isReportMode()) {
                    if (!this.isHorizontalViewEnabled) {
                        transformString = this.translate((source.x0 || 0), (source.y0 || 0));
                    }
                } else if (this.isExploreMode()) {
                    transformString = `translate(${this.transformNode((source.x0 || 0), (source.y0 || 0))})`;
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
            .attr("text-anchor", "middle");

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append(CIRCLE)
            .attr(CLASS, "ghostCircle")
            .attr("r", 21.5)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style(FILL, TRANSPARENT_COLOR)
            .attr("pointer-events", "mouseover")
            .on("mouseover", (d) => {
                this.overCircle(d);
            })
            .on("mouseout", (d) => {
                this.outCircle(d);
            });

        nodeEnter.append("g")
            .attr(CLASS, "label");

        nodeEnter.select(G_LABEL).append(TEXT)
            .attr("data-id", "name");

        nodeEnter.select(G_LABEL).append(TEXT)
            .attr("data-id", "description");

        // creates a polygon to indicate it has child(s)
        nodeEnter.append(POLYGON)
            .attr("points", LABEL_POINTS)
            .attr("data-id", "childIndicator");
    }

    private setNodeTextLabel(node) {
        node.select("#abbr").text((d) => {
            if (d.IsStaging && d.NodeID === -1) { return "+"; }
            let fn = "", ln = "";
            if (d.NodeFirstName) { fn = d.NodeFirstName.slice(0, 1); }
            if (d.NodeLastName) { ln = d.NodeLastName.slice(0, 1); }
            return fn + ln;
        }).style(FILL, (d) => {
            if (this.isNodeMoveEnabledOrDisabled && d.IsSelected) {
                return "#0097FF";
            } else {
                return d.IsStaging && d.NodeID === -1 ? "#0097FF" : "#FFFFFF";
            }
        }).style("font-size", (d) => {
            if (this.isExploreMode()) {
                return DEFAULT_FONTSIZE + "px";
            }
            if (d.IsSelected || d.IsSibling) { return SIBLING_FONTSIZE + "px"; }
            else { return DEFAULT_FONTSIZE + "px"; }
        }).attr(TRANSFORM, (d) => {
            let transformString = "rotate(0)";
            if (this.isExploreMode() && d.ParentNodeID !== null) {
                if (d.x >= RADIAL_DEPTH) {
                    transformString = `rotate(${-Math.abs((d.x || 0) - RADIAL_DEPTH)})`;
                } else {
                    transformString = `rotate(${Math.abs((d.x || 0) - RADIAL_DEPTH)})`;
                }
            }
            return transformString;
        }).style("visibility", "visible");

        if (this.isReportMode()) {
            node.select(G_LABEL + " text[data-id='name']").text("")
                .attr("text-anchor", "middle")
                .attr("dy", "0em").attr(TRANSFORM, "rotate(0)");

            node.select(G_LABEL + " text[data-id='name']").append("tspan")
                .attr("data-id", "firstname").text((d) => {
                    let name = "";
                    if (this.showFirstNameLabel) {
                        name = d.NodeFirstName;
                    }
                    return name;
                }).attr("text-anchor", "middle")
                .attr(TRANSFORM, "rotate(0)");

            node.select(G_LABEL + " text[data-id='name']").append("tspan")
                .attr("data-id", "lastname").text((d) => {
                    let name = "";
                    if (this.showLastNameLabel) {
                        name = ` ${d.NodeLastName}`;
                    }
                    return name;
                })
                .attr("text-anchor", "middle")
                .attr("x", (d) => {
                    if (d.NodeFirstName && d.NodeFirstName.length > 15) {
                        return "0em";
                    }
                })
                .attr(TRANSFORM, "rotate(0)").attr("dy", (d) => {
                    if (d.NodeFirstName && d.NodeFirstName.length > 15) {
                        return "1em";
                    }
                    return "0em";
                });
        } else {
            node.select(G_LABEL + " text[data-id='name']").text((d) => {
                let name = `${d.NodeFirstName} ${d.NodeLastName}`;
                if (this.isExploreMode()) {
                    name = d.NodeFirstName;
                }

                if (this.selectedOrgNode && (!this.selectedOrgNode.children && this.selectedOrgNode.ParentNodeID === d.ParentNodeID)
                    || (this.selectedOrgNode && this.selectedOrgNode.NodeID === d.ParentNodeID)) {
                    return name;
                }

                if (name.length > 15) {
                    return name.substring(0, 15) + "..";
                }
                return name;
            }).attr("text-anchor", (d) => {
                if (this.isBuildMode()) { return "start"; }
                if (d.NodeID === this.root.NodeID) {
                    return "start";
                }
                return Number.isNaN(d.x) || d.x < DEPTH ? "start" : "end";
            }).attr(TRANSFORM, (d) => {
                if (this.isExploreMode()) {
                    if (d.NodeID === this.root.NodeID) {
                        return "rotate(0)";
                    }
                    return Number.isNaN(d.x) || d.x < DEPTH ? "rotate(0)" : "rotate(180)";
                }
                return "rotate(0)";
            });
        }

        node.select(G_LABEL + " text[data-id='description']").text((d) => {
            if (d.Description.length > 15) {
                return d.Description.substring(0, 15) + "..";
            }
            return d.Description;
        }).attr("text-anchor", (d) => {
            if (this.isBuildMode()) { return "start"; }
            if (this.isReportMode()) {
                return "middle";
            }
            if (d.NodeID === this.root.NodeID) {
                return "start";
            }
            return Number.isNaN(d.x) || d.x < DEPTH ? "start" : "end";
        }).attr("dy", (d) => {
            if (this.showDescriptionLabel && !this.showFirstNameLabel && !this.showLastNameLabel) {
                return "0em";
            } else if (d.NodeFirstName && d.NodeFirstName.length > 15 && this.isReportMode()) {
                return "2.5em";
            }
            return "1.2em";
        }).attr(TRANSFORM, (d) => {
            if (this.isExploreMode()) {
                if (d.NodeID === this.root.NodeID) {
                    return "rotate(0)";
                }
                return Number.isNaN(d.x) || d.x < DEPTH ? "rotate(0)" : "rotate(180)";
            }
            return "rotate(0)";
        });

        if (this.isBuildMode()) {
            node.select(G_LABEL).attr("x", function (d) {
                if (d.IsParent === true || d.IsChild === true) { return PARENTCHILD_RADIUS + DEFAULT_MARGIN; }
                else { return SIBLING_RADIUS + DEFAULT_MARGIN; }
            });
        } else {
            node.select(G_LABEL).attr("y", 30);
        }

        // used to get the label width of each node
        this.labelWidths = node.select(G_LABEL).each(function (d) {
            return d3.select(this).node();
        });

        node.select(G_LABEL).attr(TRANSFORM, (d, index) => {
            let margin = DEFAULT_MARGIN * 4;
            if (this.isBuildMode()) {
                if (!d.IsSibling) {
                    margin = DEFAULT_MARGIN * 3;
                }
                return this.translate(margin, 0);
            } else if (this.isReportMode()) {
                if (d.IsSelected) { margin = DEFAULT_MARGIN * 5; }
                return this.translate(0, margin);
            } else {
                margin = DEFAULT_MARGIN * 3;
                return this.translate(margin, 0);
            }
        });
    }

    private updateNodes(node, source) {
        // Transition nodes to their new position.
        let nodeUpdate = node.transition()
            .duration(DURATION)
            .attr(TRANSFORM, (d) => {
                if (this.isBuildMode()) {
                    return this.translate((d.y || 0), (d.x || 0));
                } else if (this.isReportMode()) {
                    if (this.isHorizontalViewEnabled) {
                        return this.translate((d.y || 0), (d.x || 0));
                    } else {
                        return this.translate(d.x, d.y);
                    }
                } else {
                    if (d.ParentNodeID == null) {
                        return "rotate(0)";
                    }
                    return `rotate(${(d.x || 0) - RADIAL_DEPTH})translate(${d.y})`;
                }
            });

        nodeUpdate.select(CIRCLE)
            .attr("r", (d) => {
                if (!this.isExploreMode()) {
                    if (d.IsSelected === true || d.IsSibling === true) { return SIBLING_RADIUS; }
                    else if (d.IsParent === true || d.IsChild === true) { return PARENTCHILD_RADIUS; }
                    else { return DEFAULT_RADIUS; }
                }
                return PARENTCHILD_RADIUS;
            })
            .attr(CLASS, (d) => {
                if (d.IsSelected && d.IsStaging && d.NodeID === -1) { return STAGED_CIRCLE; }
                if (d.IsSelected) {
                    if (this.isNodeMoveEnabledOrDisabled) {
                        return MOVE_CIRCLE;
                    } else {
                        return SELECTED_CIRCLE;
                    }
                }
                else if (d.IsSibling) { return DEFAULT_CIRCLE + " sibling"; }
                else { return DEFAULT_CIRCLE; }
            })
            .style("filter", function (d) {
                return d.IsStaging && d.NodeID === -1 ? " " : "url(home#drop-shadow)";
            });

        nodeUpdate.select(CIRCLE + ".ghostCircle")
            .attr("r", 21.5);

        nodeUpdate.select(G_LABEL)
            .style(FILL, PATH_STORKE_COLOR)
            .style("visibility", (d) => {
                if (!d.Show) {
                    return "hidden";
                }
                return "visible";
            });

        nodeUpdate.select(G_LABEL + " text[data-id='name']")
            .style("visibility", (d) => {
                if (!d.Show) {
                    return "hidden";
                }
            });
        nodeUpdate.select(G_LABEL + " text[data-id='description']")
            .style("visibility", (d) => {
                if (!d.Show || !this.showDescriptionLabel) {
                    return "hidden";
                }
            });

        nodeUpdate.select("#abbr")
            .style("visibility", "visible");

        nodeUpdate.select("polygon[data-id='childIndicator']").attr(FILL, function (d) {
            if (d._children && d._children.length > 0 && !d.IsSelceted) {
                return CHILD_ARROW_FILL;
            }
            return TRANSPARENT_COLOR;
        }).attr(TRANSFORM, (d, index) => {
            let x = Math.round(this.labelWidths[0][index].getBoundingClientRect()["width"]);
            if (d.IsSibling) {
                x += (DEFAULT_MARGIN * 2) + (SIBLING_RADIUS - PARENTCHILD_RADIUS);
            } else {
                x += (DEFAULT_MARGIN * 2);
            }
            if (this.treeHeight === (VIEWBOX_MIN_HEIGHT - RIGHTLEFT_MARGIN)) {
                x += TOPBOTTOM_MARGIN;
            }
            return this.translate(x, 0);
        }).style("visibility", "visible");

    }

    private renderOrUpdateLinks(source) {
        let sourceCoords = { x: source.x0 || 0, y: source.y0 || 0 };
        let diagCoords = this.diagonal({ source: sourceCoords, target: sourceCoords });

        let sourceCoords2 = { x: source.x || 0, y: source.y || 0 };
        let diagCoords2 = this.diagonal({ source: sourceCoords2, target: sourceCoords2 });

        // Update the links…
        let link = this.svg.selectAll(PATH + ".link")
            .data(this.links, function (d) { return d.target.NodeID; });

        let x = function (d) {
            if (d.y) {
                return d.y * Math.cos(((d.x || 0) - RADIAL_DEPTH) / DEPTH * Math.PI);
            }
            return 0;
        };
        let y = function (d) {
            if (d.y) {
                return d.y * Math.sin(((d.x || 0) - RADIAL_DEPTH) / DEPTH * Math.PI);
            }
            return 0;
        };

        // Enter any new links at the parent"s previous position.
        link.enter().insert(PATH, "g")
            .attr(CLASS, "link")
            .attr("id", function (d) {
                return (`link${d.source.NodeID}-${d.target.NodeID}`);
            })
            .attr("d", (d) => {
                if (this.isExploreMode()) {
                    return `M${x(d.source)},${y(d.source)}L${x(d.target)},${y(d.target)}`;
                }
                return diagCoords;
            });

        // Transition links to their new position.
        if (this.isExploreMode()) {
            link.transition()
                .duration(DURATION)
                .attr("d", function (d) {
                    return `M${x(d.source)},${y(d.source)}L${x(d.target)},${y(d.target)}`;
                });
        } else {
            link.transition()
                .duration(DURATION)
                .attr("d", this.diagonal);
        }

        let targetNode = null;
        link.style(STROKE, (d) => {
            if (this.isReportMode()) {
                return "rgba(204, 204, 204,0.5)";
            } else if (this.isExploreMode()) {
                if (d.source.IsSelected) {
                    return "#ccc";
                } else {
                    if (d.target.IsSelected) {
                        return "#ccc";
                    }
                    if (d.target.children) {
                        let node = null;
                        d.target.children.forEach(element => {
                            if (element.IsSelected) {
                                node = element;
                                if (element.parent) {
                                    targetNode = element.parent;
                                } else {
                                    targetNode = element;
                                }
                            }
                        });

                        if (node) {
                            return "#ccc";
                        }
                    }
                    if (targetNode) {
                        if (targetNode.parent && d.target.NodeID === targetNode.parent.NodeID) {
                            targetNode = d.target;
                            return "#ccc";
                        }
                    }
                    return NONE;
                }
            }
            return (d.source.IsSelected ? "#ccc" : NONE);
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

    onNodeDragStart(d) {
        if (d === this.root || !this.isBuildMode() || (this.selectedOrgNode && this.selectedOrgNode.ParentNodeID === d.NodeID)) {
            return;
        }
        this.dragStarted = true;
        this.isNodedragStarted = true;
        this.nodes = this.tree.nodes(d);
        (d3.event as d3.DragEvent).sourceEvent.stopPropagation();
    }

    onNodeDrag(d) {
        if (d === this.root || !this.isBuildMode() || (this.selectedOrgNode && this.selectedOrgNode.ParentNodeID === d.NodeID)) {
            return;
        }
        if (this.dragStarted) {
            this.domNode = typeof event !== "undefined" ? event.target["parentNode"] : (d3.event as MouseEvent)["sourceEvent"].target["parentNode"];
            if (this.domNode.tagName === "g" && this.domNode.className["baseVal"] === "node") {
                this.targetNode = d;
                this.initiateDrag(d, this.domNode);
            }
        } else {
            if (!this.domNode) {
                this.domNode = typeof event !== "undefined" ? event.target["parentNode"] : (d3.event as MouseEvent)["sourceEvent"].target["parentNode"];
            }
        }
        if (this.domNode.tagName === "g" && this.domNode.className["baseVal"] === "node activeDrag") {
            d.x0 += (d3.event as d3.DragEvent).dy;
            d.y0 += (d3.event as d3.DragEvent).dx;
            d3.select(this.domNode).attr(TRANSFORM, this.translate(d.y0, d.x0));
        }
        this.updateTempConnector();
    }

    onNodeDragEnd(d) {
        if (d === this.root || !this.isBuildMode() || (this.selectedOrgNode && this.selectedOrgNode.ParentNodeID === d.NodeID)) {
            return;
        }
        let element = typeof event !== "undefined" ? event.target["parentNode"] : (d3.event as MouseEvent)["sourceEvent"].target["parentNode"];
        if (this.targetNode) {
            if (this.draggingNode && this.draggingNode.ParentNodeID !== this.targetNode.NodeID) {
                let draggedNode = new DraggedNode();
                draggedNode.ParentNodeID = this.targetNode.NodeID;
                draggedNode.NodeID = this.draggingNode.NodeID;
                if (draggedNode.NodeID !== this.targetNode.NodeID) {
                    this.isNodeMoved = true;
                    this.moveNode.emit(draggedNode);
                }
            }
            this.endDrag(element);
        } else {
            this.endDrag(element);
        }
    }

    initiateDrag(d, domNode) {
        if (this.targetNode) {
            if (domNode.tagName === "g") {
                this.draggingNode = d;
                d3.select(domNode).select(".ghostCircle").attr("pointer-events", "");
                d3.select(domNode).attr(CLASS, "node activeDrag");

                this.svg.selectAll("g.node").sort((a, b) => { // select the parent and sort the path's
                    if (a.NodeID !== this.draggingNode.NodeID) return 1; // a is not the hovered element, send "a" to the back
                    else return -1; // a is the hovered element, bring "a" to the front
                });

                // if nodes has children, remove the links and nodes
                if (this.nodes.length > 1) {
                    // remove link paths
                    let links = this.tree.links(this.nodes);
                    let nodePaths = this.svg.selectAll("path.link")
                        .data(links, function (d) {
                            return d.target.NodeID;
                        }).remove();
                    // remove child nodes
                    let nodesExit = this.svg.selectAll("g.node")
                        .data(this.nodes, function (d) {
                            return d.NodeID;
                        }).filter((d, i) => {
                            if (d.NodeID === this.draggingNode.NodeID) {
                                return false;
                            }
                            return true;
                        }).remove();
                }

                // remove parent link
                let parentLink = this.tree.links(this.tree.nodes(this.draggingNode.parent));
                this.svg.selectAll("path.link").filter((d, i) => {
                    if (d.target.NodeID === this.draggingNode.NodeID) {
                        return true;
                    }
                    return false;
                }).remove();
            }
        }
        this.dragStarted = false;
    }

    endDrag(domNode) {
        if (this.selectedOrgNode) {
            this.resetDragNode(domNode);
            if (domNode && domNode.tagName === "g" && domNode.className["baseVal"] === "node") {
                this.updateTempConnector();
                if (this.draggingNode !== null) {
                    this.selectedOrgNode = this.draggingNode;
                    this.showChildren(this.selectedOrgNode);
                    this.highlightAndCenterNode(this.selectedOrgNode);
                    this.draggingNode = null;
                }
            } else {
                this.showChildren(this.selectedOrgNode);
                this.highlightAndCenterNode(this.selectedOrgNode);
            }
        }
        this.isNodedragStarted = false;
    }

    overCircle(d) {
        this.targetNode = d;
        this.updateTempConnector();
    }

    outCircle(d) {
        this.targetNode = null;
        this.updateTempConnector();
    }

    // Function to update the temporary connector indicating dragging affiliation
    updateTempConnector() {
        let data = [];
        if (this.draggingNode !== null && this.targetNode !== null) {
            let x0 = this.targetNode.x0;
            if (this.targetNode.NodeID === this.selectedOrgNode.ParentNodeID) {
                x0 = this.selectedOrgNode.x0;
            }
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: this.targetNode.y0,
                    y: x0
                },
                target: {
                    x: this.draggingNode.y0,
                    y: this.draggingNode.x0
                }
            }];
            this.svg.selectAll("g.node")
                .filter((d) => {
                    if (d.NodeID === this.targetNode.NodeID && this.draggingNode.NodeID !== this.targetNode.NodeID) {
                        return true;
                    }
                    return false;
                }).attr(CLASS, "node draggedNode");
        } else {
            this.svg.selectAll("g.node")
                .filter((d) => {
                    if (this.draggingNode && d.NodeID !== this.draggingNode.NodeID) {
                        return true;
                    }
                    return false;
                }).attr(CLASS, "node");
        }
        let link = this.svg.selectAll(".templink").data(data);
        link.enter().append("path")
            .attr(CLASS, "templink")
            .attr("d", d3.svg.diagonal())
            .attr("pointer-events", "");

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    }

    private resetDragNode(domNode) {
        this.domNode = this.targetNode = null;
        d3.selectAll("g.node").attr(CLASS, "node");
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.selectAll(".ghostCircle").attr("pointer-events", "");
    }

    private showUpdatePeerReporteeNode(source) {
        if (this.isBuildMode()) {
            if (source && this.selectedOrgNode && !this.isAddOrEditModeEnabled) {
                if (source.NodeID !== -1) {
                    if (source.parent) {
                        let node: any;
                        node = source.parent.children ? source.parent.children : source.parent._children;
                        let childrenCount = node.length - 1;
                        if (node[childrenCount]) {
                            let x = (node[childrenCount].x || 0) + (childrenCount === 0 ? NODE_WIDTH : ((node[childrenCount].x || 0) - (node[childrenCount - 1].x || 0)));
                            this.setPeerReporteeNode(PEER_TEXT, x, (source.y || 0), "peerNode");
                        }
                    } else {
                        d3.select("g.peerNode").remove();
                    }

                    if (!this.selectedOrgNode.children) {
                        let y = (source.y || 0) + DEPTH;
                        this.setPeerReporteeNode(REPORTEE_TEXT, (source.x || 0), y, "directReporteeNode");
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

    private setPeerReporteeNode(nodeName, x, y, className) {
        let node = d3.select(`g.${className}`);
        let element = node[0][0]; // assigns the selected element
        if (!element) {
            node = this.svg.append("g")
                .attr(CLASS, className)
                .attr(TRANSFORM, this.translate(y, x))
                .on("click", (ev) => this.peerReporteeNodeClicked(nodeName));

            node.append(CIRCLE)
                .attr("r", DEFAULT_RADIUS)
                .attr(CLASS, "new-peer_reportee-circle");

            node.append(TEXT)
                .attr("dy", ".4em")
                .text("+")
                .attr(CLASS, "new-peer_reportee-innerText");

            node.append(TEXT)
                .attr("dy", "2.25em")
                .text(nodeName)
                .attr(CLASS, "new-peer_reportee-outerText");
        } else {
            node.attr(TRANSFORM, this.translate(y, x));
        }
    }

    private removePeerAndReporteeNodes() {
        d3.select("g.peerNode").remove();
        d3.select("g.directReporteeNode").remove();
    }

    private peerReporteeNodeClicked(nodeName) {
        if (nodeName === REPORTEE_TEXT) {
            this.addNewNode(this.selectedOrgNode);
        } else {
            this.addNewNode(this.selectedOrgNode.parent);
        }
    }

    private transformNode(x, y) {
        let angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    private setNodeLabelVisiblity() {
        d3.selectAll("text[data-id='name']").style("visibility", () => {
            if (this.showFirstNameLabel || this.showLastNameLabel) return "visible";
            else return "hidden";
        });

        d3.selectAll("text[data-id='description']").style("visibility", () => {
            if (this.showDescriptionLabel) return "visible";
            else return "hidden";
        });
    }

    private createLines(lineData, className) {
        let line = d3.svg.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });

        this.svg.append(PATH)
            .attr("d", line(lineData))
            .attr(STROKE, PATH_STORKE_COLOR)
            .attr("stroke-width", 0.4)
            .attr(FILL, NONE)
            .attr(CLASS, className);
    }

    private createArrows() {
        let arrowsData = [{ "points": ARROW_POINTS, "transform": "", "id": "right" },
        { "points": ARROW_POINTS, "transform": `${this.translate(58, 55)} rotate(-180)`, "id": "left" },
        { "points": ARROW_POINTS, "transform": `${this.translate(2, 58)} rotate(-90)`, "id": "top" },
        { "points": ARROW_POINTS, "transform": `${this.translate(56, -2)} rotate(90)`, "id": "bottom" }];

        let arrows = this.arrows;
        arrowsData.forEach(function (data) {
            arrows.append(POLYGON)
                .attr("id", data.id)
                .attr("points", data.points)
                .attr(TRANSFORM, data.transform);
        });
    }

    private hideAllArrows() {
        // hides all arrows by making transparent
        d3.selectAll(`#arrows ${POLYGON}`)
            .attr(STROKE, TRANSPARENT_COLOR)
            .attr(FILL, TRANSPARENT_COLOR);
    }


    private getNode(nodeID: number, rootNode: any) {
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

    private addParentToNode(isFake: boolean, node: OrgNodeModel) {
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

    private addEmptyChildToParent(node: OrgNodeModel) {
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

    private highlightAndCenterNode(d) {
        this.highlightSelectedNode(d);
        this.render(d);
        this.centerNode(d);
        this.hideTopArrow(d);
    }

    private hideTopArrow(d) {
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
                                .attr(STROKE, TRANSPARENT_COLOR)
                                .attr(FILL, TRANSPARENT_COLOR);
                        }
                    }
                });
            }
        }
    }

    private nodeClicked(d) {
        if ((d3.event as Event) && (d3.event as Event).defaultPrevented) return; // click suppressed
        if (this.isBuildMode()) {
            if (this.isNodeMoved || this.selectedOrgNode && this.selectedOrgNode.NodeID === -1 || this.isAddOrEditModeEnabled) {
                return;
            }
            this.expandCollapse(d);
            this.highlightAndCenterNode(d);
            this.isNodeMoved = false;
        } else if (this.isExploreMode()) {
            this.highlightSelectedNode(d);
            this.render(d);
        }
    }

    private highlightSelectedNode(d, raiseEvent: boolean = true) {
        if (this.selectedOrgNode) {
            this.selectedOrgNode.IsSelected = false;
        }
        if (d != null) {
            if (this.selectedOrgNode && this.selectedOrgNode.NodeID !== d.ParentNodeID && this.isBuildMode()) {
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

    private updateSelectedOrgNode(node: OrgNodeModel) {
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

    private deselectNode() {
        if (this.selectedOrgNode && !this.isAddOrEditModeEnabled) {
            if (this.selectedOrgNode.NodeID !== -1) {
                this.resetDragNode(null);
                //  Save the last selection temp so that the graph maintains its position
                this.lastSelectedNode = this.selectedOrgNode;
                this.highlightSelectedNode(null);
                this.render(this.root);
                this.centerNode(this.lastSelectedNode);
            }
        }
    }

    private expanParentAndChildNodes(rootNode) {
        if (rootNode) {
            this.expandTree(rootNode);
            let parentNode = this.getNode(rootNode.ParentNodeID, this.root);
            if (parentNode) {
                this.expandTree(parentNode);
                let children = parentNode.children;
                for (let k = 0; k < children.length; k++) {
                    this.collapseExceptSelectedNode(children[k]);
                };
                let parent = this.getNode(rootNode.ParentNodeID, this.root);
                this.expanParentAndChildNodes(parent);
            }
        }
    }

    private markAncestors(d: OrgNodeModel) {
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

    private collapseExceptSelectedNode(d) {
        this.isAncestorOrRelated(d);

        if ((!d.Show && !d.IsAncestor) || (d.IsSibling && !d.IsSelected) || d.IsChild) {
            this.collapseTree(d);
        }
        if (d.children) {
            for (let i = 0; i < d.children.length; i++) {
                this.collapseExceptSelectedNode(d.children[i]);
            };
        }
    }


    private scrollToCenter() {
        if (this.isBuildMode()) {
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

    private addEmptyRootNode() {
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

    private getIndexOfNode(parentNode: OrgNodeModel, currentNode: OrgNodeModel, rootNode) {
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

    private getPreviousNodeIfAddedOrDeleted() {
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

    private getPreviousSiblingNode(node: OrgNodeModel, rootNode) {
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

    private getGrandParentID(node: d3.layout.tree.Node) {
        if (node && node.parent) {
            let orgNode = node.parent as OrgNodeModel;
            return orgNode;
        }
        return null;
    }

    private collapseTree(d) {
        if (d.children) {
            d._children = d.children;
            for (let i = 0; i < d._children.length; i++) {
                this.collapseTree(d._children[i]);
            };
            d.children = null;
        }
    }

    private expandTree(d) {
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

    private expandCollapse(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    private showChildren(d) {
        if (!d.children) {
            d.children = d._children;
            d._children = null;
        }
    }

    private hideChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        }
    }

    private childCount(level, node) {
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

    private calculateLevelDepth() {
        this.levelDepth = [1];
        this.childCount(0, this.root);
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        return updatedNode.NodeID === currentNode.NodeID;
    }

    private isAncestorOrRelated(node: OrgNodeModel) {
        node.IsChild = false;
        node.IsParent = false;
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
                }
            }
        }
        if (!this.isBuildMode()) {
            node.Show = true;
        }
        return false;
    }

    private translate(x, y) {
        return `translate(${x}, ${y})`;
    }

    private isBuildMode() {
        return this.currentMode === ChartMode.build ? true : false;
    }
    private isExploreMode() {
        return this.currentMode === ChartMode.explore ? true : false;
    }
    private isReportMode() {
        return this.currentMode === ChartMode.report ? true : false;
    }
}