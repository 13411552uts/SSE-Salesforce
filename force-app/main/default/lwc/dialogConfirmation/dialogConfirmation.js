import { LightningElement, api } from 'lwc';

export default class DialogConfirmation extends LightningElement {
  @api title;
  @api body;
  @api confirmLabel;
  @api cancelLabel;

  handleConfirm() {
    this.dispatchEvent(new CustomEvent('confirm'));
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }
}