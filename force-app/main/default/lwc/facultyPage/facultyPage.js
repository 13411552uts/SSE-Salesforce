import { LightningElement, track, wire } from 'lwc';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFacultyByUser from '@salesforce/apex/FacultyCtrl.getFacultyByUser';
import { refreshApex } from '@salesforce/apex';

const actions = [
  { label: 'Show details', name: 'show_details' },
  { label: 'Delete', name: 'delete' }
];

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
    label: 'Description',
    fieldName: 'Description__c',
    type: 'textarea',
    editable: true
  },
  {
    label: 'Managed By',
    fieldName: 'ManagedBy',
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

export default class FacultyPage extends LightningElement {
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
  @track isDeleteOpen = false;
  @track title = '';

  // Use for reset after saved
  fieldItemValues = [];

  // Record detail
  recordId;
  data;

  @track apexResponse;
  @wire(getFacultyByUser)
  cons(res) {
    this.apexResponse = res;
    this.data = res?.error ? undefined : this.relationMap(res?.data);
  }

  relationMap(data) {
    // Sanitize
    if (!data) return [];

    return data.map((x) => ({
      ...x,
      ManagedBy: x?.ManagedBy__r?.Name
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

  deleteRow(row) {
    const { Id, Name } = row;
    this.recordId = Id;
    this.title = `Delete ${Name} ?`;
    this.isDeleteOpen = true;
  }

  closeDelete() {
    this.isDeleteOpen = false;
  }

  handleSubmitAdd() {
    this.refreshList();
    this.isAddOpen = false;
  }

  handleSubmitDetails() {
    this.refreshList();
    this.isDetailOpen = false;
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
            message: 'Error while trying to delete faculty',
            variant: 'error'
          })
        );
      })
      .finally(() => {
        this.closeRowDelete();
      });
  }

  showRowDetails(row) {
    const { Id } = row;
    this.isDetailOpen = true;
    this.recordId = Id;
  }

  closeRowDetails() {
    this.isDetailOpen = false;
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
              res.length > 1 ? 'Faculties' : 'Faculty'
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
            message: 'Error while trying to save faculties',
            variant: 'error'
          })
        );
      });
  }
}
