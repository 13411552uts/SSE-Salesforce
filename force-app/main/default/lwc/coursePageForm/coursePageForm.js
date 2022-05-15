import { LightningElement, api, track } from 'lwc';

import COORDINATOR_FIELD from '@salesforce/schema/Course__c.Coordinator__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Course__c.Description__c';
import FACULTY_FIELD from '@salesforce/schema/Course__c.Faculty__c';
import NAME_FIELD from '@salesforce/schema/Course__c.Name';

export default class CoursePageForm extends LightningElement {
  // fields
  fields = [NAME_FIELD, DESCRIPTION_FIELD, FACULTY_FIELD, COORDINATOR_FIELD];

  @api courseId;
  @api mode;

  @track title = '123';

  connectedCallback() {
    this.title = this.mode === 'add' ? 'Add Course' : 'Edit Course';
  }

  closeModal() {
    this.dispatchEvent(new CustomEvent('closemodal'));
  }

  submit() {
    this.template.querySelector('lightning-record-form').submit(this.fields);
    this.dispatchEvent(new CustomEvent('submit'));
  }
}
