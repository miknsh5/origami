import {Person} from './person';
export var HEROES: Hero[] = [
    { "id": 11, "name": "Mr. Nice" },
    { "id": 12, "name": "Narco" },
    { "id": 13, "name": "Bombasto" },
    { "id": 14, "name": "Celeritas" },
    { "id": 15, "name": "Magneta" },
    { "id": 16, "name": "RubberMan" },
    { "id": 17, "name": "Dynama" },
    { "id": 18, "name": "Dr IQ" },
    { "id": 19, "name": "Magma" },
    { "id": 20, "name": "Tornado" }
];

export function loadPeople() {
    if (People.find().count() === 0) {

        var people = [
            {"name":"Kevin Hixon","manager":"Alberto Valcarlos"},
            {"name":"Matthew J. Wright","manager":"Alberto Valcarlos"},
            {"name":"Manish Kakade","manager":"Alberto Valcarlos"},
            {"name":"Clark Smithson","manager":"Alberto Valcarlos"},
            {"name":"Frank Zhang","manager":"Alberto Valcarlos"},
            {"name":"Matthew Carlisle","manager":"Anders Brown"},
            {"name":"Jim Darrin","manager":"Anders Brown"},
            {"name":"Sarah Hansen","manager":"Anders Brown"},
            {"name":"Chris Ingrao","manager":"Anders Brown"},
            {"name":"Lincoln Popp","manager":"Anders Brown"}
        ];

        for (var i = 0; i < people.length; i++) {
            People.insert(people[i]);
        }
    }
}