import { LightningElement, api, track } from 'lwc';

import COURSE_FIELD from '@salesforce/schema/Student__c.Course__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Student__c.Description__c';
import DOB_FIELD from '@salesforce/schema/Student__c.dob__c';
import FACULTY_FIELD from '@salesforce/schema/Student__c.Faculty__c';
import NAME_FIELD from '@salesforce/schema/Student__c.Name';

export default class StudentPageForm extends LightningElement {
  fields = [
    NAME_FIELD,
    DESCRIPTION_FIELD,
    FACULTY_FIELD,
    COURSE_FIELD,
    DOB_FIELD
  ];

  @api studentId;
  @api mode;

  @track title = '123';

  connectedCallback() {
    this.title = this.mode === 'add' ? 'Add Student' : 'Edit Student';
  }

  closeModal() {
    this.dispatchEvent(new CustomEvent('closemodal'));
  }

  submit() {
    this.template.querySelector('lightning-record-form').submit(this.fields);
    this.dispatchEvent(new CustomEvent('submit'));
  }
}
