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

class PersonItem extends Component<HTMLUListElement, HTMLLIElement> {
  private person: Person;

  constructor(hostId: string, person: Person) {
    super("person-stack", hostId, false, `person-${person.id}`);

    this.person = person;
    this.configure();
    this.renderContent();
  }

  configure() {}

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.person.name;
    this.element.querySelector("h3")!.textContent = PersonSpecialty[this.person.position];
    this.element.querySelector("p")!.textContent = this.person.info;
  }
}

class PersonList extends Component<HTMLDivElement, HTMLElement> {
  assignedPersons: Person[];

  constructor(private type: "junior" | "middle" | "senior" | "architect") {
    super("person-list", "container", false, `${type}-persons`);
    this.assignedPersons = [];

    this.configure();
    this.renderContent();
  }

  configure() {
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

  configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  renderContent() {}

  private gatherPersonInput(): [string, string, PersonSpecialty] | undefined {
    const enteredName = this.nameInputEl.value;
    const enteredAbout = this.aboutTextEl.value;
    const enteredPosition = this.positionSelectEl.value;

    const nameValidatable: Validatable = {
      value: enteredName,
      required: true,
      minLength: 2,
      maxLength: 20,
    };

    const aboutValidatable: Validatable = {
      value: enteredAbout,
      required: true,
      minLength: 10,
    };

    const positionValidatable: Validatable = {
      value: enteredPosition,
      required: true,
      min: 0,
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
