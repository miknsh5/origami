System.register(['@angular/core', 'd3'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, core_2, d3;
    var OrgTree;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
                core_2 = core_1_1;
            },
            function (d3_1) {
                d3 = d3_1;
            }],
        execute: function() {
            OrgTree = (function () {
                function OrgTree(elementRef, width, height) {
                    this.duration = 1555;
                    this.selectNode = new core_1.EventEmitter();
                    var el = elementRef.nativeElement;
                    this.graph = d3.select(el);
                }
                OrgTree.prototype.ngOnInit = function () {
                    alert("init called" + this.treeData);
                    var margin = { top: 20, right: 120, bottom: 20, left: 120 }, width = 960 - margin.right - margin.left, height = 500 - margin.top - margin.bottom;
                    this.tree = d3.layout.tree().size([height, width]);
                    this.diagonal = d3.svg.diagonal()
                        .projection(function (d) { return [d.y, d.x]; });
                    this.svg = this.graph.append("svg")
                        .attr("width", width + margin.right + margin.left)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    this.root = this.treeData[0];
                    this.render(this.root);
                };
                OrgTree.prototype.render = function (source) {
                    var _this = this;
                    var i = 0;
                    this.nodes = this.tree.nodes(this.root).reverse(),
                        this.links = this.tree.links(this.nodes);
                    source.x0 = source.x;
                    source.y0 = source.y;
                    // Normalize for fixed-depth.
                    this.nodes.forEach(function (d) { d.y = d.depth * 180; });
                    // Update the nodes…
                    var node = this.svg.selectAll("g.node")
                        .data(this.nodes, function (d) { return d.id || (d.id = ++i); });
                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                        .on("click", function (ev) { return _this.click(ev); });
                    nodeEnter.append("circle")
                        .attr("r", 1e-6)
                        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });
                    nodeEnter.append("text")
                        .attr("x", function (d) { return d.children || d._children ? -10 : 10; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
                        .style("fill-opacity", 1e-6);
                    node.select("text").text(function (d) { return d.NodeFirstName; });
                    // Transition nodes to their new position.
                    var nodeUpdate = node.transition()
                        .duration(this.duration)
                        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });
                    nodeUpdate.select("circle")
                        .attr("r", 4.5)
                        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });
                    nodeUpdate.select("text")
                        .style("fill-opacity", 1);
                    // Transition exiting nodes to the parent's new position.
                    /* var nodeExit = node.exit().transition().
                         duration(this.duration)
                         
                         .remove();
                   
                     nodeExit.select("circle").transition()
                         .duration(this.duration)
                         .remove();
                   
                     nodeExit.select("text").transition()
                         .duration(this.duration)
                         .remove(); */
                    var nodeExit = node.exit().transition().delay(100).
                        duration(this.duration)
                        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
                        .remove();
                    nodeExit.select("circle")
                        .attr("r", 1e-6);
                    nodeExit.select("text")
                        .style("fill-opacity", 1e-6);
                    var sourceCoords = { x: source.x0, y: source.y0 };
                    var diagCoords = this.diagonal({ source: sourceCoords, target: sourceCoords });
                    var sourceCoords2 = { x: source.x, y: source.y };
                    var diagCoords2 = this.diagonal({ source: sourceCoords2, target: sourceCoords2 });
                    // Update the links…
                    var link = this.svg.selectAll("path.link")
                        .data(this.links, function (d) { return d.target.id; });
                    // Enter any new links at the parent's previous position.
                    link.enter().insert("path", "g")
                        .attr("class", "link")
                        .attr("d", function (d) {
                        return diagCoords;
                    });
                    // Transition links to their new position.
                    link.transition()
                        .duration(this.duration)
                        .attr("d", this.diagonal);
                    // Transition exiting nodes to the parent's new position.
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
                };
                OrgTree.prototype.click = function (d) {
                    this.selectNode.emit(d);
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    }
                    else {
                        d.children = d._children;
                        d._children = null;
                    }
                    this.render(d);
                };
                OrgTree.prototype.ngOnChanges = function (changes) {
                    if (this.tree != null) {
                        this.root = this.treeData[0]; //JSON.parse(JSON.stringify(this.treeData[0]));
                        this.render(this.treeData[0]);
                    }
                };
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], OrgTree.prototype, "selectNode", void 0);
                OrgTree = __decorate([
                    core_1.Directive({
                        selector: 'tree-graph',
                        inputs: ['treeData'],
                    }),
                    __param(0, core_2.Inject(core_1.ElementRef)),
                    __param(1, core_1.Attribute('width')),
                    __param(2, core_1.Attribute('height')), 
                    __metadata('design:paramtypes', [core_1.ElementRef, Number, Number])
                ], OrgTree);
                return OrgTree;
            }());
            exports_1("OrgTree", OrgTree);
        }
    }
});
//# sourceMappingURL=org-tree.js.map