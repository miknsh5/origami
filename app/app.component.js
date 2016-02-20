System.register(['angular2/core', './person-detail.component', './people.service', './searchbar.component', './nav.component'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, person_detail_component_1, people_service_1, searchbar_component_1, nav_component_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (person_detail_component_1_1) {
                person_detail_component_1 = person_detail_component_1_1;
            },
            function (people_service_1_1) {
                people_service_1 = people_service_1_1;
            },
            function (searchbar_component_1_1) {
                searchbar_component_1 = searchbar_component_1_1;
            },
            function (nav_component_1_1) {
                nav_component_1 = nav_component_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent(_peopleService) {
                    this._peopleService = _peopleService;
                }
                AppComponent.prototype.getPeople = function () {
                    var _this = this;
                    this._peopleService.getPeople().then(function (people) { return _this.people = people; });
                };
                AppComponent.prototype.ngOnInit = function () {
                    this.getPeople();
                };
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'app',
                        directives: [person_detail_component_1.PersonDetailComponent, searchbar_component_1.SearchbarComponent, nav_component_1.NavComponent],
                        template: "\n    <nav></nav>\n    <h1>Welcome to Origami</h1>\n    <ul>\n      <li *ngFor=\"#person of people\">\n        <span class=\"badge\">{{person.name}}</span> {{person.manager}}\n      </li>\n    </ul>\n    <my-person-detail>MyPerson</my-person-detail>\n    <searchbar></searchbar>\n  ",
                        styles: ["\n\n    "],
                        providers: [people_service_1.PeopleService]
                    }), 
                    __metadata('design:paramtypes', [people_service_1.PeopleService])
                ], AppComponent);
                return AppComponent;
            })();
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map