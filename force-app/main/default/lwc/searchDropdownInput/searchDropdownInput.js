import { LightningElement, api, track } from 'lwc';

export default class SearchDropdownInput extends LightningElement {
  @api options;
  @api selectedValue;
  @api selectedValues = [];
  @api label;
  @api minChar = 2;
  @api disabled = false;
  @api multiSelect = false;
  @track value;
  @track values = [];
  @track optionData;
  @track searchString;
  @track message;
  @track showDropdown = false;

  connectedCallback() {
    this.showDropdown = false;
    this.optionData = JSON.parse(JSON.stringify(this.options));

    // Santiizing
    if (!this.selectedValue && !this.selectedValues) return;

    // Mark selected
    let count = 0;

    this.optionData.forEach((x, index) => {
      if (this.multiSelect) {
        if (this.selectedValues.includes(x.value)) {
          this.options[index].selected = true;
          count++;
        }
      } else {
        if (x.value === this.selectedValue) {
          this.searchString = x.label;
        }
      }
    });

    // Display string
    this.searchString = this.multiSelect
      ? `${count} Option(s) Selected`
      : this.searchString;
  }

  filterOptions(event) {
    // Get string
    this.searchString = event.target.value;

    // Sanitizing
    if (this.searchString?.length === 0) {
      this.showDropdown = false;
      return;
    }

    // Reset message
    this.message = '';

    // Search if more than min char
    if (this.searchString.length >= this.minChar) {
      let notFoundFlag = true;

      const option = JSON.parse(JSON.stringify(this.optionData));

      option.forEach((x, index) => {
        if (
          x.label.toLowerCase().includes(this.searchString.trim().toLowerCase())
        ) {
          option[index].isVisible = true;
          notFoundFlag = false;
        } else {
          option[index].isVisible = false;
        }
      });

      this.optionData = option;
      this.message = notFoundFlag
        ? `No results found for '${this.searchString}'`
        : this.message;
    }

    this.showDropdown = true;
  }

  selectItem(event) {
    const selectedVal = event.currentTarget.dataset.id;

    // Sanitizing
    if (!selectedVal) return;

    this.optionData.forEach((x, index) => {
      if (x.value === selectedVal) {
        if (this.multiSelect) {
          // Toggle in select
          if (this.values.includes(x.value)) {
            this.values.splice(this.values.indexOf(x.value), 1);
          } else {
            this.values.push(x.value);
          }

          // Toggle selected state
          this.optionData[index].selected = !this.optionData[index].selected;
        } else {
          this.value = x.value;
          this.searchString = x.label;
        }
      }
    });

    // Search string
    this.searchString = this.multiSelect
      ? `${this.optionData.filter((x) => x.selected).length} Option(s) Selected`
      : this.searchString;

    // Event prevent
    if (this.multiSelect) event.preventDefault();
    else this.showDropdown = false;
  }

  showOptions() {
    // Sanitize
    if (this.disabled || !this.options) return;

    this.message = '';
    this.searchString = '';

    this.optionData = this.optionData.map((x) => ({
      isVisible: true,
      ...x
    }));

    this.showDropdown = this.optionData.length > 0;
  }

  removePill(event) {
    const value = event.currentTarget.name;

    this.optionData.forEach((x, index) => {
      if (x.value === value) {
        this.optionData[index].selected = false;
        this.values.splice(this.values.indexOf(x.value), 1);
      }
    });

    // Search string
    this.searchString = this.multiSelect
      ? `${this.optionData.filter((x) => x.selected).length} Option(s) Selected`
      : this.searchString;
  }

  blurEvent() {
    // Get previous label
    const previousLabel = this.optionData.filter(
      (x) => x.value === this.value
    )?.[0]?.label;

    // Search string
    this.searchString = this.multiSelect
      ? `${this.optionData.filter((x) => x.selected).length} Option(s) Selected`
      : previousLabel;

    this.showDropdown = false;

    this.dispatchEvent(
      new CustomEvent('select', {
        detail: {
          payloadType: 'multi-select',
          payload: {
            value: this.value,
            values: this.values
          }
        }
      })
    );
  }
}