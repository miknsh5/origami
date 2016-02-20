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
    var PersonDetailComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            }],
        execute: function() {
            PersonDetailComponent = (function () {
                function PersonDetailComponent() {
                }
                PersonDetailComponent = __decorate([
                    core_1.Component({
                        selector: 'my-hero-detail',
                        inputs: ['person'],
                        template: "\n      <div *ngIf=\"person\">\n        <h2>{{hero.name}} details!</h2>\n        <div><label>id: </label>{{hero.id}}</div>\n        <div>\n          <label>name: </label>\n          <input [(ngModel)]=\"person.name\" placeholder=\"name\"/>\n        </div>\n      </div>\n    ",
                    }), 
                    __metadata('design:paramtypes', [])
                ], PersonDetailComponent);
                return PersonDetailComponent;
            })();
            exports_1("PersonDetailComponent", PersonDetailComponent);
        }
    }
});
//# sourceMappingURL=person-detail.component.js.map