import * as angular from "@angular/core";
import {Component, Input, Output, Directive, EventEmitter, Attribute, OnChanges, DoCheck, ElementRef, OnInit, SimpleChange} from "@angular/core";
import {Inject} from "@angular/core";

import * as d3 from "d3";
import { OrgNodeModel, OrgService} from "../shared/index";

@Directive({
    selector: "tree-graph"
  })

export class OrgTree implements OnInit {
    tree: any;
    diagonal: any;
    svg: any;
    graph: any;
    root: any;
    duration: number = 1555;
    nodes: any;
    links: any;
    nodeID: number = 300;

    @Output() selectNode = new EventEmitter<OrgNodeModel>();
    @Output() addNode = new EventEmitter<OrgNodeModel>();
    selectedNode: any;
    @Input() treeData: any;
    constructor(private orgService: OrgService,
        @Inject(ElementRef) elementRef: ElementRef,
        @Attribute("width") width: number,
        @Attribute("height") height: number) {

        let el: any = elementRef.nativeElement;
        this.graph = d3.select(el);
    }

    ngOnInit() {
        alert("init called" + this.treeData);
        let margin = { top: 20, right: 120, bottom: 20, left: 120 },
            width = 960 - margin.right - margin.left,
            height = 500 - margin.top - margin.bottom;
        this.tree = d3.layout.tree().size([height, width]);
        this.diagonal = d3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        this.svg = this.graph.append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        this.root = this.treeData[0];
        this.root.children.forEach(element => {
            this.collapseTree(element);
        });
        this.highlightSelectedNode(this.root);
        this.render(this.root);
        this.centerNode(this.root);
    }
    collapseTree(d) {
        if (d.children) {
            d._children = d.children;
            d._children = d.children;
            d._children.forEach(element => {
                this.collapseTree(element);
            });
            d.children = null;
        }
    }
    centerNode(source) {

        let x = -source.y0;
        let y = -source.x0;
        x = x * 1 + 720 / 2;
        y = y * 1 + 460 / 2;
        d3.select("g").transition()
            .duration(this.duration)
            .attr("transform", "translate(" + x + "," + y + ")");

    }


    render(source) {

        let i: number = 0;
        this.nodes = this.tree.nodes(this.root).reverse();
        this.links = this.tree.links(this.nodes);
        source.x0 = source.x;
        source.y0 = source.y;
        // Normalize for fixed-depth.
        this.nodes.forEach(function (d) { d.y = d.depth * 180; });

        // Update the nodes…
        let node = this.svg.selectAll("g.node")
            .data(this.nodes, function (d) { return d.NodeID || (++i); });


        // Enter any new nodes at the parent"s previous position.
        let nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", (ev) => this.click(ev));

        nodeEnter.append("circle")

            .attr("r", 1e-6);


        nodeEnter.append("text")
            .attr("x", function (d) { return 15; })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) { return "start"; })

            .style("fill-opacity", 1e-6);


        nodeEnter.append("text")
            .attr("id", "abbr")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")

            .style("fill-opacity", 1);
        node.select("#abbr").text(function (d) {
            let fn = "";
            let ln = "";
            if (d.NodeFirstName) {
                fn = d.NodeFirstName.slice(0, 1);
            }
            if (d.NodeLastName) {
                ln = d.NodeLastName.slice(0, 1);
            }
            return fn + ln;
        });
        node.select("text").text(function (d) { return d.IsSelected ? "" : d.NodeFirstName; });
        node.select("circle").style("fill", function (d) { console.log(d.IsSelected); return d.IsSelected ? "green" : "#fff"; });
        // Transition nodes to their new position.
        let nodeUpdate = node.transition()
            .duration(this.duration)
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 12.5)
            .style("fill", function (d) { console.log(d.NodeFirstName + d.IsSelected); return d.IsSelected ? "green" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);





        // Transition exiting nodes to the parent"s new position.
        /* let nodeExit = node.exit().transition().
             duration(this.duration)
             
             .remove();
       
         nodeExit.select("circle").transition()
             .duration(this.duration)
             .remove();
       
         nodeExit.select("text").transition()
             .duration(this.duration)
             .remove(); */

        let nodeExit = node.exit().transition().delay(100).
            duration(this.duration)
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
            .attr("id", function (d) { console.log("link" + d.source.NodeID + "-" + d.target.NodeID); return ("link" + d.source.NodeID + "-" + d.target.NodeID); })

            .attr("d", function (d) {

                return diagCoords2;
            });

        // Transition links to their new position.
        link.transition()
            .duration(this.duration)
            .attr("d", this.diagonal)
            ;
        link.style("stroke", function (d) { return (d.source.IsSelected ? "#ccc" : "none"); });
        // Transition exiting nodes to the parent"s new position.
        link.exit().transition()
            .duration(this.duration)
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
    }


    bodyClicked(d) {
        if(event.srcElement.nodeName=="svg")
        {
        this.deselectNode();
    }}

    deselectNode() {
        if (this.selectedOrgNode != null) {
            this.highlightSelectedNode(null);
            this.render(this.root);
        }

    }

    keyDown(d) {
        if (this.selectedOrgNode == null) {
            return;
        }
        // esc
        if ((event as KeyboardEvent).keyCode === 27) {
            this.deselectNode();
        }
        // enter
        if ((event as KeyboardEvent).keyCode === 13) {
            let parentID = this.selectedOrgNode.ParentNodeID;
            let newNode = this.addEmptyChildToSelectedOrgNode(parentID, this.root);
            this.addNewNode(newNode);


        }
        // tab
        else if ((event as KeyboardEvent).keyCode === 9) {
            let newNode = this.addEmptyChildToParent(this.selectedOrgNode);
            this.addNewNode(newNode);


        }
        // left arrow
        else if ((event as KeyboardEvent).keyCode === 37) {

            let node = this.selectedOrgNode as d3.layout.tree.Node;

            if (node.parent != null) {
                let parentNode = node.parent;
                this.highlightAndCenterNode(parentNode);

            }
        }
        // right arrow
        else if ((event as KeyboardEvent).keyCode === 39) {
            if (this.selectedOrgNode.children) {
                let node = this.selectedOrgNode.children[0];
                this.highlightAndCenterNode(node);

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

                }
            }
        }
    }


    getNode(nodeID: number, node: OrgNodeModel) {
        if (node.NodeID === nodeID) {

            return node;


        } else {

            if (node.children) {
                node.children.forEach(element => this.getNode(nodeID, element));
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
    selectedOrgNode: any;

    addEmptyChildToParent(node: OrgNodeModel) {
        if (!node.children) {
            node.children = new Array<OrgNodeModel>();

        }
        let newNode = new OrgNodeModel();
        newNode.ParentNodeID = node.NodeID;
        newNode.NodeFirstName = "FN";
        newNode.NodeLastName = "LN";
        newNode.OrgID = node.OrgID;

        node.children.push(newNode);

        return newNode;
    }

    highlightAndCenterNode(d) {
        this.highlightSelectedNode(d);
        this.render(d);
        this.centerNode(d);
    }
    click(d) {
        event.stopPropagation();
        this.expandCollapse(d);

        this.highlightAndCenterNode(d);
        /* d3.selectAll("path").style("stroke", "none");
         if(d.children)
         {
         d.children.forEach(element => {
               d3.selectAll("#link"+d.NodeID + "-" + element.NodeID).style("stroke", "green")
         });
         }*/
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
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (this.tree != null) {


            this.root = this.treeData[0];
            if (this.selectedOrgNode != null) {
                this.updateSelectedOrgNode(this.root);
            }
            this.render(this.treeData[0]);

        }
    }
    updateSelectedOrgNode(node: OrgNodeModel) {
        if (this.compareNodeID(node, this.selectedOrgNode)) {
            this.selectedOrgNode = node;
            return;
        } else {

            if (node.children) {
                node.children.forEach(element => this.updateSelectedOrgNode(element));
            }
        }
    }
    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        return updatedNode.NodeID === currentNode.NodeID;
    }

    private addNewNode(node) {
        if (!node) { return; }
        this.orgService.addNode(node)
            .subscribe(data => this.emitaddNodeNotification(data),
            error => this.handleError(error),
            () => console.log("Node Added Complete"));
    }
    emitaddNodeNotification(data: OrgNodeModel) {
        if (data) {
            console.log(data);
            this.highlightSelectedNode(data);
            this.addNode.emit(data);

        }

    }
    private handleError(err) {
        alert("Node could not be added on the server ");
        console.log(err);
    }

}