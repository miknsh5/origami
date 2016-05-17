System.register(['@angular/core', '@angular/common', '../shared/index'], function(exports_1, context_1) {
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
    var core_1, common_1, index_1;
    var OrgNodeDetailComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (index_1_1) {
                index_1 = index_1_1;
            }],
        execute: function() {
            OrgNodeDetailComponent = (function () {
                function OrgNodeDetailComponent(orgService) {
                    this.orgService = orgService;
                    this.deleteNode = new core_1.EventEmitter();
                    this.updateNode = new core_1.EventEmitter();
                }
                OrgNodeDetailComponent.prototype.doesChildNodeExist = function (node) {
                    return (node.children.length > 0);
                };
                OrgNodeDetailComponent.prototype.onSubmit = function (form) {
                    var data = JSON.stringify(form.value, null, 2);
                    this.editNodeDetails = new index_1.OrgNodeModel();
                    this.editNodeDetails.NodeFirstName = form.value.firstName;
                    this.editNodeDetails.NodeLastName = form.value.lastName;
                    this.editNodeDetails.Description = form.value.description;
                    this.editNodeDetails.children = this.selectedOrgNode.children;
                    this.editNodeDetails.NodeID = this.selectedOrgNode.NodeID;
                    this.editNodeDetails.OrgID = this.selectedOrgNode.OrgID;
                    this.editNodeDetails.ParentNodeID = this.selectedOrgNode.ParentNodeID;
                    this.editNode(this.editNodeDetails);
                };
                OrgNodeDetailComponent.prototype.editNode = function (node) {
                    var _this = this;
                    if (!node) {
                        return;
                    }
                    this.orgService.updateNode(node)
                        .map(function (res) { return res.json(); })
                        .subscribe(function (data) { return _this.emitUpdateNodeNotification(data); }, function (error) { return _this.handleError(error); }, function () { return console.log('Node Updated Complete'); });
                };
                OrgNodeDetailComponent.prototype.onEditNodeClicked = function () {
                    this.isEditMode = true;
                };
                OrgNodeDetailComponent.prototype.onDeleteNodeClicked = function () {
                    var _this = this;
                    if (this.selectedOrgNode.children.length === 0) {
                        this.orgService.deleteNode(this.selectedOrgNode.NodeID)
                            .subscribe(function (data) { return _this.emitDeleteNodeNotification(data); }, function (error) { return _this.handleError(error); }, function () { return console.log('Node Deleted Complete'); });
                    }
                    else {
                        alert("Delete Child Node First!");
                    }
                };
                OrgNodeDetailComponent.prototype.emitDeleteNodeNotification = function (data) {
                    if (data === true) {
                        this.deleteNode.emit(this.selectedOrgNode);
                    }
                };
                OrgNodeDetailComponent.prototype.emitUpdateNodeNotification = function (data) {
                    if (data === true) {
                        this.isEditMode = false;
                        this.updateNode.emit(this.editNodeDetails);
                        this.editNodeDetails = null;
                    }
                };
                OrgNodeDetailComponent.prototype.handleError = function (err) {
                    alert("OOPs..!!Could not update..!! ");
                    console.log(err);
                };
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', index_1.OrgNodeModel)
                ], OrgNodeDetailComponent.prototype, "selectedOrgNode", void 0);
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], OrgNodeDetailComponent.prototype, "deleteNode", void 0);
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], OrgNodeDetailComponent.prototype, "updateNode", void 0);
                OrgNodeDetailComponent = __decorate([
                    core_1.Component({
                        selector: 'origami-org-node-detail',
                        templateUrl: 'app/org/org-node-detail/org-node-detail.component.html',
                        styleUrls: ['app/org/org-node-detail/org-node-detail.component.css'],
                        directives: [common_1.FORM_DIRECTIVES, common_1.COMMON_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [index_1.OrgService])
                ], OrgNodeDetailComponent);
                return OrgNodeDetailComponent;
            }());
            exports_1("OrgNodeDetailComponent", OrgNodeDetailComponent);
        }
    }
});
//# sourceMappingURL=org-node-detail.component.js.map