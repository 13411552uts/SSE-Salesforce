import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
  greeting = 'World';
  changeHandler(event) {
    this.greeting = event.target.value;
  }
}