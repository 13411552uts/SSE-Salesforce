import { LightningElement, api, track } from 'lwc';

import DESCRIPTION_FIELD from '@salesforce/schema/Faculty__c.Description__c';
import MANAGED_BY from '@salesforce/schema/Faculty__c.ManagedBy__c';
import NAME_FIELD from '@salesforce/schema/Faculty__c.Name';

export default class FacultyPageForm extends LightningElement {
  fields = [NAME_FIELD, DESCRIPTION_FIELD, MANAGED_BY];

  @api facultyId;
  @api mode;

  @track title = '123';

  connectedCallback() {
    this.title = this.mode === 'add' ? 'Add Faculty' : 'Edit Faculty';
  }

  closeModal() {
    this.dispatchEvent(new CustomEvent('closemodal'));
  }

  submit() {
    this.template.querySelector('lightning-record-form').submit(this.fields);
    this.dispatchEvent(new CustomEvent('submit'));
  }
}
