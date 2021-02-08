const REQUIRED_NAME_LENGTH = [2, 25];
const REQUIRED_INFO_LENGTH = 5;

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum PersonExperience {
  junior,
  middle,
  senior,
  architect,
}

enum PersonSpecialty {
  "front-end",
  "back-end",
  QA,
  manager,
}

class Person {
  constructor(
    public id: string,
    public name: string,
    public info: string,
    public position: number,
    public experience: PersonExperience
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

class PersonState extends State<Person> {
  private persons: Person[] = [];
  private personId: number = 0;
  private static instance: PersonState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new PersonState();
    }
    return this.instance;
  }

  addPerson(name: string, info: string, position: number) {
    const id = (this.personId++).toString();

    const newPerson = new Person(id, name, info, position, PersonExperience.junior);
    this.persons.push(newPerson);

    this.updateListeners();
  }

  movePerson(id: string, experience: PersonExperience) {
    const person = this.persons.find((person) => person.id === id);

    if (person && person.experience !== experience) {
      person.experience = experience;
      this.updateListeners();
    }
  }

  private updateListeners() {
    this.listeners.forEach((listener) => {
      listener(this.persons.slice());
    });
  }
}

const personState = PersonState.getInstance();

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
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

function autoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(templateId: string, hostElId: string, insertAtStart: boolean, newElId?: string) {
    this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElId)! as T;

    const importedFormNode = document.importNode(this.templateEl.content, true);
    this.element = importedFormNode.firstElementChild as U;
    if (newElId) {
      this.element.id = newElId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostEl.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
  }

  abstract configure?(): void;
  abstract renderContent(): void;
}

class PersonItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private person: Person;

  constructor(hostId: string, person: Person) {
    super("person-stack", hostId, false, `person-${person.id}`);

    this.person = person;
    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.person.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_event: DragEvent) {}

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.person.name;
    this.element.querySelector("h3")!.textContent = PersonSpecialty[this.person.position];
    this.element.querySelector("p")!.textContent = this.person.info;
  }
}

class PersonList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedPersons: Person[];

  constructor(private type: "junior" | "middle" | "senior" | "architect") {
    super("person-list", "container", false, `${type}-persons`);
    this.assignedPersons = [];

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autoBind
  dropHandler(event: DragEvent) {
    const personId = event.dataTransfer!.getData("text/plain");
    personState.movePerson(personId, PersonExperience[this.type]);

    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  @autoBind
  dragLeaveHandler(_event: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    personState.addListener((persons: Person[]) => {
      this.assignedPersons = persons.filter((subject) => {
        return PersonExperience[subject.experience] === this.type;
      });
      this.renderPersons();
    });
  }

  renderContent() {
    const listId = `${this.type}-person-list`.toLowerCase();
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = `${this.type} list`.toUpperCase();
  }

  private renderPersons() {
    const listEl = document.getElementById(`${this.type}-person-list`.toLowerCase())! as HTMLUListElement;
    listEl.innerHTML = "";

    for (const prjItem of this.assignedPersons) {
      new PersonItem(listEl.id, prjItem);
    }
  }
}

class PersonInput extends Component<HTMLDivElement, HTMLFormElement> {
  nameInputEl: HTMLInputElement;
  aboutTextEl: HTMLTextAreaElement;
  positionSelectEl: HTMLSelectElement;

  constructor() {
    super("person-input", "container", true, "user-input");

    this.nameInputEl = this.element.querySelector("#p-name") as HTMLInputElement;
    this.aboutTextEl = this.element.querySelector("#p-about") as HTMLTextAreaElement;
    this.positionSelectEl = this.element.querySelector("#p-position") as HTMLSelectElement;

    this.configure();
  }

  @autoBind
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherPersonInput(): [string, string, PersonSpecialty] | undefined {
    const enteredName = this.nameInputEl.value;
    const enteredAbout = this.aboutTextEl.value;
    const enteredPosition = this.positionSelectEl.value;

    const nameValidatable: Validatable = {
      value: enteredName,
      required: true,
      minLength: REQUIRED_NAME_LENGTH[0],
      maxLength: REQUIRED_NAME_LENGTH[1],
    };

    const aboutValidatable: Validatable = {
      value: enteredAbout,
      required: true,
      minLength: REQUIRED_INFO_LENGTH,
    };

    const positionValidatable: Validatable = {
      value: enteredPosition,
      required: true,
      max: 4,
    };

    if (validate(nameValidatable) && validate(aboutValidatable) && validate(positionValidatable)) {
      return [enteredName, enteredAbout, +enteredPosition];
    } else {
      alert("Invalid input, please try again!");
      return;
    }
  }

  private clearForm() {
    this.element.reset();
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherPersonInput();

    if (Array.isArray(userInput)) {
      const [name, info, position] = userInput;
      personState.addPerson(name, info, position);
      this.clearForm();
    }
  }
}

const persInput = new PersonInput();
const jPersList = new PersonList("junior");
const mPersList = new PersonList("middle");
const sPersList = new PersonList("senior");
const aPersList = new PersonList("architect");
