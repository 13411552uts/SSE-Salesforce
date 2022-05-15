import { LightningElement, track, wire } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStudents from '@salesforce/apex/StudentCtrl.getStudents';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

const actions = [{ label: 'Show details', name: 'show_details' }];

const actionButtons = [
  {
    label: 'Add',
    variant: 'brand',
    name: 'Add'
  }
];

const columns = [
  {
    label: 'Name',
    fieldName: 'Name',
    type: 'text',
    editable: true,
    sortable: true
  },
  {
    label: 'Course',
    fieldName: 'Course',
    type: 'textarea',
    sortable: true
  },
  {
    label: 'Faculty',
    fieldName: 'Faculty',
    type: 'text',
    sortable: true
  },
  {
    label: 'Date of Birth',
    fieldName: 'dob__c',
    type: 'text'
  },
  {
    label: 'Application Status',
    fieldName: 'ApplicationStatus__c',
    type: 'textarea',
    sortable: true
  },
  {
    label: 'Faculty Approved',
    fieldName: 'FacultyApprovalStatus__c',
    type: 'text',
    sortable: true
  },
  {
    type: 'action',
    typeAttributes: { rowActions: actions }
  }
];

export default class StudentPage extends LightningElement {
  // Action buttons
  actionButtons = actionButtons;

  // Datatable
  columns = columns;
  defaultSortDirection = 'asc';
  sortDirection = 'asc';
  sortedBy;

  // Modal
  @track isAddOpen = false;
  @track isDetailOpen = false;
  @track title = '';

  // Use for reset after saved
  @track fieldItemValues = [];

  // Record detail
  @track recordId;
  @track data;

  @track apexResponse;
  @wire(getStudents)
  cons(res) {
    this.apexResponse = res;
    this.data = res?.error ? undefined : this.relationMap(res?.data);
  }

  relationMap(data) {
    // Sanitize
    if (!data) return [];

    return data.map((x) => ({
      ...x,
      Faculty: x?.Faculty__r?.Name,
      Course: x?.Course__r?.Name
    }));
  }

  sortBy(field, reverse, primer = null) {
    const key = primer
      ? function (x) {
          return primer(x[field]);
        }
      : function (x) {
          return x[field];
        };

    return function (a, b) {
      a = key(a);
      b = key(b);
      return reverse * ((a > b) - (b > a));
    };
  }

  onHandleSort(event) {
    const { fieldName: sortedBy, sortDirection } = event.detail;
    const cloneData = [...this.data];

    cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
    this.data = cloneData;
    this.sortDirection = sortDirection;
    this.sortedBy = sortedBy;
  }

  async refreshList() {
    await refreshApex(this.apexResponse);
  }

  renderedCallback() {
    this.refreshList();
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
      case 'show_details':
        this.showRowDetails(row);
        break;
      default:
    }
  }

  handleButtonAction(event) {
    const buttonLabel = event.target.dataset.name;

    switch (buttonLabel) {
      case 'Add':
        this.onAdd();
        break;
      default:
        break;
    }
  }

  onAdd() {
    this.isAddOpen = true;
  }

  closeAdd() {
    this.isAddOpen = false;
    this.refreshList();
  }

  showRowDetails(row) {
    const { Id } = row;
    this.isDetailOpen = true;
    this.recordId = Id;
  }

  closeRowDetails() {
    this.isDetailOpen = false;
    this.recordId = null;
    this.refreshList();
  }

  saveHandler(event) {
    // Get draft values
    const draftValues = event.detail.draftValues;

    // Map to inputItems for save
    const inputItems = draftValues.slice().map((x) => {
      const fields = { ...x };
      return { fields };
    });

    // Assert promises
    const promises = inputItems.map((x) => updateRecord(x));

    // Handle promises
    Promise.all(promises)
      .then((res) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Success',
            message: `${res.length} ${
              res.length > 1 ? 'Students' : 'Student'
            } updated Successfully!`,
            variant: 'success'
          })
        );
        this.fieldItemValues = [];
        this.refreshList();
      })
      .catch((err) => {
        console.error(err);

        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error',
            message: 'Error while trying to save students',
            variant: 'error'
          })
        );
      });
  }
}
