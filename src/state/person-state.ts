import { Person, PersonExperience } from "../models/person.js";

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

export class PersonState extends State<Person> {
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

export const personState = PersonState.getInstance();
