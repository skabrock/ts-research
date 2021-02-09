export enum PersonExperience {
  junior,
  middle,
  senior,
  architect,
}

export enum PersonSpecialty {
  "front-end",
  "back-end",
  QA,
  manager,
}

export class Person {
  constructor(
    public id: string,
    public name: string,
    public info: string,
    public position: number,
    public experience: PersonExperience
  ) {}
}
