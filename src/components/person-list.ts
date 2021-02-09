import { autoBind } from "../decorators/auto-bind.js";
import { Component } from "./component.js";
import { PersonItem } from "./person-item.js";
import { DragTarget } from "../models/drag-and-drop.js";
import { Person, PersonExperience } from "../models/person.js";
import { personState } from "../state/person-state.js";

export class PersonList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
