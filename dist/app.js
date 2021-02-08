"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PersonExperience;
(function (PersonExperience) {
    PersonExperience[PersonExperience["junior"] = 0] = "junior";
    PersonExperience[PersonExperience["middle"] = 1] = "middle";
    PersonExperience[PersonExperience["senior"] = 2] = "senior";
    PersonExperience[PersonExperience["architect"] = 3] = "architect";
})(PersonExperience || (PersonExperience = {}));
var PersonSpecialty;
(function (PersonSpecialty) {
    PersonSpecialty[PersonSpecialty["front-end"] = 0] = "front-end";
    PersonSpecialty[PersonSpecialty["back-end"] = 1] = "back-end";
    PersonSpecialty[PersonSpecialty["QA"] = 2] = "QA";
    PersonSpecialty[PersonSpecialty["manager"] = 3] = "manager";
})(PersonSpecialty || (PersonSpecialty = {}));
class Person {
    constructor(id, name, info, position, experience) {
        this.id = id;
        this.name = name;
        this.info = info;
        this.position = position;
        this.experience = experience;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
}
class PersonState extends State {
    constructor() {
        super();
        this.persons = [];
        this.personId = 0;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PersonState();
        }
        return this.instance;
    }
    addPerson(name, info, position) {
        const id = (this.personId++).toString();
        const newPerson = new Person(id, name, info, position, PersonExperience.junior);
        this.persons.push(newPerson);
        this.listeners.forEach((listener) => {
            listener(this.persons.slice());
        });
    }
}
const personState = PersonState.getInstance();
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value > validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value < validatableInput.max;
    }
    return isValid;
}
function autoBind(_target, _methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
class Component {
    constructor(templateId, hostElId, insertAtStart, newElId) {
        this.templateEl = document.getElementById(templateId);
        this.hostEl = document.getElementById(hostElId);
        const importedFormNode = document.importNode(this.templateEl.content, true);
        this.element = importedFormNode.firstElementChild;
        if (newElId) {
            this.element.id = newElId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostEl.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
    }
}
class PersonItem extends Component {
    constructor(hostId, person) {
        super("person-stack", hostId, false, `person-${person.id}`);
        this.person = person;
        this.configure();
        this.renderContent();
    }
    configure() { }
    renderContent() {
        this.element.querySelector("h2").textContent = this.person.name;
        this.element.querySelector("h3").textContent = PersonSpecialty[this.person.position];
        this.element.querySelector("p").textContent = this.person.info;
    }
}
class PersonList extends Component {
    constructor(type) {
        super("person-list", "container", false, `${type}-persons`);
        this.type = type;
        this.assignedPersons = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        personState.addListener((persons) => {
            this.assignedPersons = persons.filter((subject) => {
                return PersonExperience[subject.experience] === this.type;
            });
            this.renderPersons();
        });
    }
    renderContent() {
        const listId = `${this.type}-person-list`.toLowerCase();
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = `${this.type} list`.toUpperCase();
    }
    renderPersons() {
        const listEl = document.getElementById(`${this.type}-person-list`.toLowerCase());
        listEl.innerHTML = "";
        for (const prjItem of this.assignedPersons) {
            new PersonItem(listEl.id, prjItem);
        }
    }
}
class PersonInput extends Component {
    constructor() {
        super("person-input", "container", true, "user-input");
        this.nameInputEl = this.element.querySelector("#p-name");
        this.aboutTextEl = this.element.querySelector("#p-about");
        this.positionSelectEl = this.element.querySelector("#p-position");
        this.configure();
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }
    renderContent() { }
    gatherPersonInput() {
        const enteredName = this.nameInputEl.value;
        const enteredAbout = this.aboutTextEl.value;
        const enteredPosition = this.positionSelectEl.value;
        const nameValidatable = {
            value: enteredName,
            required: true,
            minLength: 2,
            maxLength: 20,
        };
        const aboutValidatable = {
            value: enteredAbout,
            required: true,
            minLength: 10,
        };
        const positionValidatable = {
            value: enteredPosition,
            required: true,
            min: 0,
            max: 4,
        };
        if (validate(nameValidatable) && validate(aboutValidatable) && validate(positionValidatable)) {
            return [enteredName, enteredAbout, +enteredPosition];
        }
        else {
            alert("Invalid input, please try again!");
            return;
        }
    }
    clearForm() {
        this.element.reset();
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherPersonInput();
        if (Array.isArray(userInput)) {
            const [name, info, position] = userInput;
            personState.addPerson(name, info, position);
            this.clearForm();
        }
    }
}
__decorate([
    autoBind
], PersonInput.prototype, "submitHandler", null);
const persInput = new PersonInput();
const jPersList = new PersonList("junior");
const mPersList = new PersonList("middle");
const sPersList = new PersonList("senior");
const aPersList = new PersonList("architect");
//# sourceMappingURL=app.js.map