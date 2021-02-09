import { autoBind } from "../decorators/auto-bind.js";
import { PersonSpecialty } from "../models/person.js";
import { personState } from "../state/person-state.js";
import { Validatable, validate } from "../utils/validation.js";
import { Component } from "./component.js";

const REQUIRED_NAME_LENGTH = [2, 25];
const REQUIRED_INFO_LENGTH = 5;

export class PersonInput extends Component<HTMLDivElement, HTMLFormElement> {
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
