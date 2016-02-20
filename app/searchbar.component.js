System.register(['angular2/core'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1;
    var SearchbarComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            SearchbarComponent = (function () {
                function SearchbarComponent() {
                }
                SearchbarComponent = __decorate([
                    core_1.Component({
                        selector: 'searchbar',
                        template: "\n    <div class=\"search-wrap\">\n        <div class=\"search-icon\"></div>\n        <input class=\"search-input\" [(ngModel)]=\"search\" placeholder=\"John Doe\"/>\n    </div>\n    ",
                        styles: ["\n        .search-wrap {\n            background-color: #009688;\n            width: 300px;\n            height: 50px;\n            position: fixed;\n            left: 20px;\n            bottom: 5px;\n         }\n\n        .search-input {\n            height: 25px;\n            margin: 15px;\n            margin-top: 10px;\n            margin-left: 15%;\n            width: 80%;\n            background-color: #009688;\n            border-color: #ccc;\n\n        }\n\n        .search-icon {\n            background-image: url(\"app/images/search.png\");\n            top: 16px;\n            position: absolute;\n            height: 20px;\n            width: 20px;\n            background-repeat: no-repeat;\n            left: 12px;\n        }\n\n    "]
                    }), 
                    __metadata('design:paramtypes', [])
                ], SearchbarComponent);
                return SearchbarComponent;
            })();
            exports_1("SearchbarComponent", SearchbarComponent);
        }
    }
});
//# sourceMappingURL=searchbar.component.js.map