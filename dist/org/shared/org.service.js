System.register(['@angular/core', '@angular/http'], function(exports_1, context_1) {
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
    var core_1, http_1, http_2;
    var OrgService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
                http_2 = http_1_1;
            }],
        execute: function() {
            OrgService = (function () {
                function OrgService(http) {
                    this.http = http;
                    this.origamiUrl = 'http://origamiapi-staging.azurewebsites.net';
                    this.getUrl = '/api/Org/GetOrgChart?orgID=1';
                    this.updateUrl = '/api/Org/EditNode';
                    this.deleteUrl = '/api/Org/DeleteNode?nodeID=';
                }
                OrgService.prototype.getNodes = function () {
                    return this.http.get(this.origamiUrl + this.getUrl)
                        .map(function (node) { return node.json(); });
                };
                OrgService.prototype.updateNode = function (orgNode) {
                    var node = JSON.stringify(orgNode);
                    var headers = new http_2.Headers({ 'Content-Type': 'application/json' });
                    var options = new http_2.RequestOptions({ headers: headers });
                    var url = this.origamiUrl + this.updateUrl;
                    return this.http.post(url, node, options);
                };
                OrgService.prototype.deleteNode = function (orgNodeID) {
                    var headers = new http_2.Headers({ 'Content-Type': 'application/json' });
                    var options = new http_2.RequestOptions({ headers: headers });
                    var url = this.origamiUrl + this.deleteUrl + orgNodeID;
                    return this.http.delete(url, options)
                        .map(function (res) { return res.json(); });
                };
                OrgService.prototype.logError = function (err) {
                    console.error(err);
                };
                OrgService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], OrgService);
                return OrgService;
            }());
            exports_1("OrgService", OrgService);
        }
    }
});
//# sourceMappingURL=org.service.js.map