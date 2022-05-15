import { LightningElement, track, wire } from 'lwc';
import {
  createRecord,
  deleteRecord,
  updateRecord
} from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCourseByUser from '@salesforce/apex/CourseCtrl.getCourseByUser';
import { refreshApex } from '@salesforce/apex';

const actionButtons = [
  {
    label: 'Add',
    variant: 'brand',
    name: 'Add'
  }
];

const actions = [
  { label: 'Show details', name: 'show_details' },
  { label: 'Delete', name: 'delete' }
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
    label: 'Description',
    fieldName: 'Description__c',
    type: 'textarea',
    editable: true
  },
  {
    label: 'Faculty',
    fieldName: 'Faculty',
    type: 'text',
    sortable: true
  },
  {
    label: 'Coordinator',
    fieldName: 'Coordinator',
    type: 'text',
    sortable: true
  },
  {
    label: 'Status',
    fieldName: 'Status__c',
    type: 'text',
    sortable: true
  },
  {
    type: 'action',
    typeAttributes: { rowActions: actions }
  }
];

export default class CoursePage extends LightningElement {
  // Action buttons
  actionButtons = actionButtons;

  // Datatable
  columns = columns;
  defaultSortDirection = 'asc';
  sortDirection = 'asc';
  sortedBy;

  // Modal
  @track isAddOpen = false;
  @track isEditOpen = false;
  @track isDeleteOpen = false;
  @track title = '';

  // Use for reset after saved
  @track fieldItemValues = [];

  // Record detail
  @track recordId;
  @track data;

  @track apexResponse;
  @wire(getCourseByUser)
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
      Coordinator: x?.Coordinator__r?.Name
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
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
      case 'delete':
        this.deleteRow(row);
        break;
      case 'show_details':
        this.showRowDetails(row);
        break;
      default:
    }
  }

  deleteRow(row) {
    const { Id, Name } = row;
    this.title = `Delete ${Name} ?`;
    this.recordId = Id;
    this.isDeleteOpen = true;
  }

  closeDelete() {
    this.isDeleteOpen = false;
    this.recordId = null;
  }

  handleDelete() {
    deleteRecord(this.recordId)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Success',
            message: `Deleted successfully!`,
            variant: 'success'
          })
        );
        this.refreshList();
      })
      .catch((err) => {
        console.error(err);

        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error',
            message: 'Error while trying to delete course',
            variant: 'error'
          })
        );
      })
      .finally(() => {
        this.closeDelete();
      });
  }

  showRowDetails(row) {
    const { Id } = row;
    this.recordId = Id;
    this.isEditOpen = true;
  }

  closeEdit() {
    this.isEditOpen = false;
    this.recordId = null;
  }

  async refreshList() {
    await refreshApex(this.apexResponse);
  }

  renderedCallback() {
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
              res.length > 1 ? 'Courses' : 'Course'
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
            message: 'Error while trying to save courses',
            variant: 'error'
          })
        );
      });
  }
}
