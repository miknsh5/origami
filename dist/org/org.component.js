System.register(['@angular/core', '@angular/http', '@angular/router-deprecated', './org-node-detail/index', './shared/index', './d3-tree/org-tree'], function(exports_1, context_1) {
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
    var core_1, http_1, router_deprecated_1, index_1, index_2, org_tree_1;
    var OrgComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (router_deprecated_1_1) {
                router_deprecated_1 = router_deprecated_1_1;
            },
            function (index_1_1) {
                index_1 = index_1_1;
            },
            function (index_2_1) {
                index_2 = index_2_1;
            },
            function (org_tree_1_1) {
                org_tree_1 = org_tree_1_1;
            }],
        execute: function() {
            OrgComponent = (function () {
                function OrgComponent(orgService, router) {
                    this.orgService = orgService;
                    this.router = router;
                    this.getAllNodes();
                }
                OrgComponent.prototype.getAllNodes = function () {
                    var _this = this;
                    this.orgService.getNodes()
                        .subscribe(function (data) { return _this.setOrgChartData(data); }, function (err) { return _this.orgService.logError(err); }, function () { return console.log('Random Quote Complete'); });
                };
                OrgComponent.prototype.onNodeSelected = function (node) {
                    this.selectedNode = node;
                };
                OrgComponent.prototype.onNodeDeleted = function (deletedNode) {
                    var _this = this;
                    var index = this.orgNodes.indexOf(deletedNode, 0);
                    if (index > -1) {
                        this.orgNodes.splice(index, 1);
                        this.selectedNode = null;
                    }
                    else {
                        this.orgNodes.forEach(function (element) {
                            var index = element.children.indexOf(deletedNode, 0);
                            if (index > -1) {
                                element.children.splice(index, 1);
                                _this.selectedNode = null;
                            }
                        });
                    }
                };
                OrgComponent.prototype.onNodeUpdated = function (updatedNode) {
                    var _this = this;
                    if (updatedNode) {
                        if (this.compareNodeID(updatedNode, this.selectedNode)) {
                            var index = this.orgNodes.indexOf(this.selectedNode, 0);
                            if (index > -1) {
                                this.selectedNode = updatedNode;
                                this.orgChart.OrgNodes[index] = this.selectedNode;
                                this.setOrgChartData(this.orgChart);
                                this.selectedNode = null;
                            }
                            else {
                                this.orgNodes.forEach(function (element) {
                                    var index = element.children.indexOf(_this.selectedNode, 0);
                                    console.log(index);
                                    if (index > -1) {
                                        _this.selectedNode = updatedNode;
                                        element.children[index] = _this.selectedNode;
                                        _this.setOrgChartData(_this.orgChart);
                                        _this.selectedNode = null;
                                    }
                                });
                            }
                        }
                    }
                };
                OrgComponent.prototype.compareNodeID = function (updatedNode, currentNode) {
                    return updatedNode.NodeID === currentNode.NodeID;
                };
                OrgComponent.prototype.setOrgChartData = function (data) {
                    this.orgChart = data;
                    this.orgNodes = this.orgChart.OrgNodes;
                    this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
                    console.log(this.orgChart);
                };
                OrgComponent.prototype.logout = function () {
                    localStorage.removeItem('profile');
                    localStorage.removeItem('id_token');
                    this.router.navigate(['/Login']);
                };
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', index_2.OrgNodeModel)
                ], OrgComponent.prototype, "selectedNode", void 0);
                OrgComponent = __decorate([
                    core_1.Component({
                        selector: 'origami-org',
                        directives: [org_tree_1.OrgTree, index_1.OrgNodeDetailComponent],
                        templateUrl: 'app/org/org.component.html',
                        styleUrls: ['app/org/org.component.css'],
                        providers: [index_2.OrgService, http_1.HTTP_PROVIDERS]
                    }), 
                    __metadata('design:paramtypes', [index_2.OrgService, router_deprecated_1.Router])
                ], OrgComponent);
                return OrgComponent;
            }());
            exports_1("OrgComponent", OrgComponent);
        }
    }
});
//# sourceMappingURL=org.component.js.map