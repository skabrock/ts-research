import { autoBind } from "../decorators/auto-bind.js";
import { Component } from "./component.js";
import { Draggable } from "../models/drag-and-drop.js";
import { Person, PersonSpecialty } from "../models/person.js";

export class PersonItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
