import * as angular from "@angular/core";
import {Component, Input, Output, Directive, EventEmitter, Attribute, OnChanges, DoCheck, ElementRef, OnInit, SimpleChange} from "@angular/core";
import {Inject} from "@angular/core";

import * as d3 from "d3";
import { OrgNodeModel, OrgService} from "../shared/index";

const DURATION = 250;
const TOPBOTTOM_MARGIN = 20;
const RIGHTLEFT_MARGIN = 120;
const SIBLING_RADIUS = 16.5;
const PARENTCHILD_RADIUS = 10.5;
const GRANDPARENT_RADIUS = 6.5;

const DEFAULT_RADIUS = 10.5;
const PEER_TEXT = "Peer";
const REPORTEE_TEXT = "Direct Report";
const NODE_DEFAULT_DISTANCE = 112;

const ARROW_POINTS = "48 35 48 24 53 29";
const ARROW_FILL = "#D8D8D8";

const NODE_HEIGHT = 70;
const NODE_WIDTH = 40;

@Component({
    selector: "sg-org-tree",
    template: ``
})

export class OrgTreeComponent implements OnInit, OnChanges {
    tree: any;
    diagonal: any;
    svg: any;
    graph: any;
    root: any;
    nodes: any;
    links: any;
    selectedOrgNode: any;
    treeWidth: number;
    treeHeight: number;
    previousRoot: any;
    isAddMode: boolean;
    arrows: any;

    @Input() width: number;
    @Input() height: number;
    @Input() treeData: any;
    @Output() selectNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    @Output() switchToAddMode = new EventEmitter<OrgNodeModel>();

    ngOnInit() {
        //  Todo:- We need to use the values coming from the host instead of our own
        let margin = { top: TOPBOTTOM_MARGIN, right: RIGHTLEFT_MARGIN, bottom: TOPBOTTOM_MARGIN, left: RIGHTLEFT_MARGIN };

        this.treeWidth = this.width + margin.right + margin.left;
        this.treeHeight = this.height + margin.top + margin.bottom;


        this.tree = d3.layout.tree().nodeSize([NODE_HEIGHT, NODE_WIDTH]);

        this.diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        this.svg = this.graph.append("svg")
            .attr("width", this.treeWidth)
            .attr("height", this.treeHeight)
            .append("g");

        let verticalLine: [number, number][] = [[(this.treeWidth / 2), this.treeHeight], [(this.treeWidth / 2), 0]];
        let horizontalLine: [number, number][] = [[0, (this.treeHeight / 2)], [this.treeWidth, (this.treeHeight / 2)]];

        // Creates and vertical line
        this.createLines(verticalLine);

        // Creates and horizontal line 
        this.createLines(horizontalLine);

        this.svg.append("g")
            .attr("class", "nodes")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.arrows = this.svg.append("g")
            .attr("id", "arrows")
            .attr("transform", "translate(" + ((this.treeWidth / 2) - SIBLING_RADIUS * 1.75) + "," + ((this.treeHeight / 2) - SIBLING_RADIUS * 1.75) + ")");

        this.svg = d3.select("g.nodes");

        // creates arrows directions 
        this.createArrows();

        this.root = this.treeData[0];
        for (let i = 0; i < this.root.children.length; i++) {
            this.collapseTree(this.root.children[i]);
        };
        this.highlightSelectedNode(this.root);
        this.render(this.root);
        this.centerNode(this.root);
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (this.tree != null) {
            this.previousRoot = this.root;
            this.root = this.treeData[0];
            if (this.selectedOrgNode != null) {
                this.selectedOrgNode.IsSelected = false;
                this.isAddMode = false;
                if (this.selectedOrgNode.NodeID === -1) {
                    this.selectedOrgNode = this.getPreviousSiblingNode(this.selectedOrgNode);
                    this.highlightSelectedNode(this.selectedOrgNode);
                } else {
                    let node = this.getNode(this.selectedOrgNode.NodeID, this.root);
                    // if the selected node is deleted it highlights previous sibbling or parent node
                    if (!node) {
                        this.selectedOrgNode = this.getPreviousSiblingNode(this.selectedOrgNode);
                    }
                    this.updateSelectedOrgNode(this.root);
                    this.highlightSelectedNode(this.selectedOrgNode);
                }
            }
            this.render(this.root);
            if (this.selectedOrgNode != null) {
                this.showUpdatePeerReporteeNode(this.selectedOrgNode);
                this.centerNode(this.selectedOrgNode);
                this.hideTopArrow(this.selectedOrgNode);
            }
        }
    }

    constructor(private orgService: OrgService,
        @Inject(ElementRef) elementRef: ElementRef) {
        let el: any = elementRef.nativeElement;
        this.graph = d3.select(el);
    }

    getNodeIndex(parentNode: OrgNodeModel, currentNode: OrgNodeModel) {
        let index;
        let node = this.getNode(parentNode.NodeID, this.previousRoot);
        console.log(node);
        if (node.children && node.children.length > 0) {
            node.children.forEach(function (d) {
                console.log(d);
                if (d.NodeID === currentNode.NodeID) {
                    index = node.children.indexOf(currentNode, 0);
                }
            });
        }
        return index;
    }

    getPreviousSiblingNode(node: OrgNodeModel) {
        let previousNode = this.getNode(node.ParentNodeID, this.root);
        let index = this.getNodeIndex(previousNode, node);
        if (previousNode.children && previousNode.children.length > 0) {
            if (index > 0) {
                previousNode = previousNode.children[index - 1];
            }
            else if (index === 0 && previousNode.children.length > 0) {
                previousNode = previousNode.children[index];
            }
        }
        return previousNode;
    }

    createLines(lineData) {
        let line = d3.svg.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });

        this.svg.append("path")
            .attr("d", line(lineData))
            .attr("stroke", "#B6B6B6")
            .attr("stroke-width", 0.4)
            .attr("fill", "none");
    }

    createArrows() {
        let arrowsData = [{ "points": ARROW_POINTS, "transform": "", "id": "right" },
            { "points": ARROW_POINTS, "transform": "translate(-42, 0) rotate(-180) translate(-100, -58)", "id": "left" },
            { "points": ARROW_POINTS, "transform": "translate(5,58) rotate(-90) translate(0, -5)", "id": "top" },
            { "points": ARROW_POINTS, "transform": "translate(58, 0) rotate(90)", "id": "bottom" }];

        let arrows = this.arrows;
        arrowsData.forEach(function (data) {
            arrows.append("polygon")
                .attr("id", data.id)
                .attr("points", data.points)
                .attr("transform", data.transform);
        });
    }

    hideAllArrows() {
        // hides all arrows by making transparent
        d3.selectAll("polygon")
            .attr("stroke", "transparent")
            .attr("fill", "transparent");
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
            else {
                node.IsAncestor = false;
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

    centerNode(source) {
        let x = source.y0;
        let y = source.x0;
        x = this.treeWidth / 2 - x;
        y = this.treeHeight / 2 - y;
        d3.select("g.nodes").transition()
            .duration(DURATION)
            .attr("transform", "translate(" + x + "," + y + ")");

        this.hideAllArrows();

        if (this.root.NodeID !== source.NodeID) {
            let parentNode = source.parent;
            if (parentNode == null) {
                parentNode = this.getNode(source.ParentNodeID, this.root);
            }
            this.moveParentNodesToCenter(parentNode, source);
            let grandParent = this.getGrandParentID(parentNode);
            if (grandParent != null) {
                this.moveParentNodesToCenter(grandParent, source);
            }
            d3.selectAll("polygon")
                .attr("stroke", "#FFFFFF")
                .attr("fill", ARROW_FILL);
        } else {
            d3.selectAll("polygon#right")
                .attr("stroke", "#FFFFFF")
                .attr("fill", ARROW_FILL);
        }
    }

    getGrandParentID(node: d3.layout.tree.Node) {
        if (node !== null && node.parent != null) {
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
                .attr("transform", "translate(" + parentNode.y + " , " + source.x + ")");
        }
    }

    render(source) {
        let i: number = 0;
        if (this.nodes == null || this.selectedOrgNode != null) {

            //  The tree defines the position of the nodes based on the number of nodes it needs to draw.
            // collapse out the child nodes which will not be shown
            this.markAncestors(this.selectedOrgNode);
            for (let k = 0; k < this.root.children.length; k++) {
                this.collapseExceptSelectedNode(this.root.children[k]);
            };

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
        this.nodes.forEach(function (d) { d.y = d.depth * 120; });

        // Update the nodes…
        let node = this.svg.selectAll("g.node")
            .data(this.nodes, function (d) { return d.NodeID || (++i); });

        // Enter any new nodes at the parent"s previous position.
        let nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", (ev) => this.nodeClicked(ev));

        nodeEnter.append("circle")
            .attr("r", 1e-6);

        nodeEnter.append("text")
            .attr("x", function (d) { return 18; })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) { return "start"; })
            .style("fill-opacity", 1e-6);

        nodeEnter.append("text")
            .attr("id", "abbr")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("fill-opacity", 1);

        node.select("#abbr").text(function (d) {
            if (d.IsGrandParent) {
                return "";
            }
            if (d.IsStaging) {
                return "+";
            }
            let fn = "";
            let ln = "";
            if (d.NodeFirstName) {
                fn = d.NodeFirstName.slice(0, 1);
            }
            if (d.NodeLastName) {
                ln = d.NodeLastName.slice(0, 1);
            }
            return fn + ln;
        }).style("fill", function (d) {
            return d.IsStaging ? "#0097FF" : "#FFFFFF";
        });

        node.select("text").text(function (d) { return d.IsSelected || d.IsGrandParent ? "" : d.NodeFirstName; });
        node.select("circle").attr("class", function (d) {
            return d.IsSelected ? "selectedCircle" : "normalCircle";
        });

        // Transition nodes to their new position.
        let nodeUpdate = node.transition()
            .duration(DURATION)
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", function (d) {
                if (d.IsSelected === true || d.IsSibling === true) { return SIBLING_RADIUS; }
                else if (d.IsParent === true || d.IsChild === true) { return PARENTCHILD_RADIUS; }
                else if (d.IsGrandParent === true) { return GRANDPARENT_RADIUS; }
                else { return DEFAULT_RADIUS; }
            })
            .attr("class", function (d) {
                return d.IsSelected ? d.IsStaging ? "stagedCircle" : "selectedCircle" : "normalCircle";
            });

        nodeUpdate.select("text")
            .style({ "fill-opacity": 1, "fill": "#727272" });

        let nodeExit = node.exit().transition().delay(100).
            duration(DURATION)
            .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

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
                // console.log("link" + d.source.NodeID + "-" + d.target.NodeID);
                return ("link" + d.source.NodeID + "-" + d.target.NodeID);
            })
            .attr("d", function (d) {
                return diagCoords;
            });

        // Transition links to their new position.
        link.transition()
            .duration(DURATION)
            .attr("d", this.diagonal);

        link.style("stroke", function (d) { return (d.source.IsSelected ? "#ccc" : "none"); });

        // Transition exiting nodes to the parent"s new position.
        link.exit().transition()
            .duration(DURATION)
            .attr("d", function (d) {
                return diagCoords2;
            })
            .remove();

        // Stash the old positions for transition.
        this.nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        d3.select("body").on("keydown", (ev) => this.keyDown(ev));
        d3.select("body").on("click", (ev) => this.bodyClicked(ev));

        this.showUpdatePeerReporteeNode(source);
    }

    setPeerReporteeNode(nodeName, x, y, className) {
        let node = d3.select("g." + className);
        let element = node[0][0]; // assigns the selected element
        if (element === null) {
            node = this.svg.append("g")
                .attr("class", className)
                .attr("transform", function (d) { return "translate(" + y + "," + x + ")"; })
                .on("click", (ev) => this.peerReporteeNodeClicked(nodeName));

            node.append("circle")
                .attr("r", DEFAULT_RADIUS)
                .attr("class", "new-peer_reportee-circle");

            node.append("text")
                .attr("dy", ".35em")
                .text("+")
                .attr("class", "new-peer_reportee-innerText");

            node.append("text")
                .attr("dy", "2em")
                .text(nodeName)
                .attr("class", "new-peer_reportee-outerText");
        }
        else {
            node.attr("transform", function (d) { return "translate(" + y + "," + x + ")"; });
        }
    }

    showUpdatePeerReporteeNode(source) {
        if (this.selectedOrgNode !== null) {
            if (this.selectedOrgNode.NodeID !== -1) {
                if (source.parent) {
                    let node: any;
                    node = source.parent.children ? source.parent.children : source.parent._children;
                    let childrenCount = node.length - 1;
                    if (node[childrenCount] !== null) {
                        let x = node[childrenCount].x + (childrenCount === 0 ? NODE_DEFAULT_DISTANCE : (node[childrenCount].x - node[childrenCount - 1].x));
                        this.setPeerReporteeNode(PEER_TEXT, x, source.y, "peerNode");
                    }
                }
                else {
                    d3.select("g.peerNode").remove();
                }

                if (!this.selectedOrgNode.children) {
                    let y = source.y + NODE_DEFAULT_DISTANCE;
                    this.setPeerReporteeNode(REPORTEE_TEXT, source.x, y, "directReporteeNode");
                }
                else {
                    d3.select("g.directReporteeNode").remove();
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

    bodyClicked(d) {
        if (event.srcElement.nodeName === "svg") {
            this.deselectNode();
        }
    }

    deselectNode() {
        if (this.selectedOrgNode != null) {
            if (this.selectedOrgNode.NodeID !== -1) {
                //  Save the last selection temp so that the graph maintains its position
                let lastSelectedNode = this.selectedOrgNode;
                this.highlightSelectedNode(null);
                this.render(this.root);
                this.centerNode(lastSelectedNode);
            }
        }
    }

    keyDown(d) {
        event.stopPropagation();
        if (this.selectedOrgNode == null) {
            return;
        }

        if (this.selectedOrgNode.NodeID === -1) {
            return;
        }

        // esc
        if ((event as KeyboardEvent).keyCode === 27) {
            this.deselectNode();
        }


        // left arrow
        if ((event as KeyboardEvent).keyCode === 37) {
            let node = this.selectedOrgNode as d3.layout.tree.Node;
            if (node.parent != null) {
                let parentNode = node.parent;
                this.highlightAndCenterNode(parentNode);
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

    addEmptyChildToSelectedOrgNode(parentID: number, node: OrgNodeModel) {
        if (this.selectedOrgNode == null) {
            return;
        }
        if (node.NodeID === parentID) {
            let newNode = this.addEmptyChildToParent(node);
            return newNode;
        } else {
            if (node.children) {
                for (let index = 0; index < node.children.length; index++) {
                    let element = node.children[index];
                    let newNode = this.addEmptyChildToSelectedOrgNode(parentID, element);
                    if (newNode != null) {
                        return newNode;
                    }
                }
            }
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
        newNode.OrgID = node.OrgID;
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
            if (parentNode.children && parentNode.children.length > 0) {
                parentNode.children.forEach(function (d) {
                    if (d.NodeID === currentNode.NodeID) {
                        index = parentNode.children.indexOf(currentNode, 0);
                        if (index === 0) {
                            d3.select("polygon#top")
                                .attr("stroke", "transparent")
                                .attr("fill", "transparent");
                            console.log("First Child");
                        }
                    }
                });
            }
        }
    }

    nodeClicked(d) {
        if (this.isAddMode) {
            return;
        }
        event.stopPropagation();
        this.expandCollapse(d);
        this.highlightAndCenterNode(d);
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

    highlightSelectedNode(d) {
        if (this.selectedOrgNode) {
            this.selectedOrgNode.IsSelected = false;
        }
        if (d != null) {
            if (this.selectedOrgNode != null && this.selectedOrgNode.NodeID !== d.ParentNodeID) {
                this.hideChildren(this.selectedOrgNode);
            }
            d.IsSelected = true;
            this.selectNode.emit(d);
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

    emitaddNodeNotification(data: OrgNodeModel) {
        if (data) {
            this.highlightSelectedNode(data);
            this.addNode.emit(data);
        }
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        return updatedNode.NodeID === currentNode.NodeID;
    }
    private addNewNode(node) {
        let newNode = this.addEmptyChildToParent(node as OrgNodeModel);
        this.switchToAddMode.emit(newNode);
        this.highlightAndCenterNode(newNode);
        this.hideAllArrows();
        this.isAddMode = true;
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
                if ((selectedTreeNode.parent != null) || (this.selectedOrgNode.NodeID === -1)) {
                    if (selectedTreeNode.parent == null) {
                        selectedTreeNode.parent = this.getNode(this.selectedOrgNode.ParentNodeID, this.root);
                    }
                    if (selectedTreeNode.parent.parent != null) {
                        let nodeID = (selectedTreeNode.parent as OrgNodeModel).ParentNodeID;
                        if (nodeID === node.NodeID) {
                            node.IsGrandParent = true;
                            node.Show = true;
                        }
                    }
                }

            }

        }

        return false;
    }
}