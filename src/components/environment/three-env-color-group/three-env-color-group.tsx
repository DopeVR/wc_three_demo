import { Component, Element, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';
import { uiObjectEvent } from '@_interface/Intersect';

@Component({
  tag: 'three-env-color-group',
  shadow: false,
})
export class ThreeEnvColorGroup {
  @Element() host: HTMLElement;

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';     // self generate and update

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';        // self generate and update

  /** Listen to calls coming from other components */
  @Listen('uiObjectBus', {
    target: 'body',
    capture: false,
    passive: true
  })
  uiObjectBusHandler(event: CustomEvent<uiObjectEvent>) {
    //                                          Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.from !== this.uiid) {
      if (event.detail.action === 'colorGroups') {
        let newIndex = JSON.parse(event.detail.payload);
        this._setNewOption(newIndex);
      }
    }
  }

  /** Transmit data to other components */
  @Event({
    eventName: 'uiObjectBus',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) uiObjectBusEvent: EventEmitter<uiObjectEvent>;


  // -----------------

  private _uigroup: string;
  private _uiid: string;
  private _objectElements: string[];
  private _optionElements: string[];
  private _colorOptions: string[];

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();

    this._objectElements = ['three-env-background', 'three-env-fog'];
    this._optionElements = ['three-option'];
    this._colorOptions = [];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;
    
    this._colorOptions = this._gatherOptions();
    this._updateAltMenu(this._colorOptions);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _gatherOptions(): string[] {
    let elements: HTMLCollection = this.host.children;
    let resultArray: string[] = [];

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._optionElements.includes(element.localName)) {
        let colorOption: string = '';
        if (!(element.getAttribute('color') === null || element.getAttribute('color') === '')) {
          colorOption = element.getAttribute('color');
        }
        resultArray.push(colorOption);
      }
    }
    return (resultArray);
  }

  private _updateAltMenu(options: string[]): void {
    let submitObject: uiObjectEvent = {
      from: this.uiid,
      to: '',
      toGroup: this.uigroup,
      action: 'colorGroups',
      type: 'string',
      payload: JSON.stringify(options)
    };
    this.uiObjectBusEvent.emit(submitObject);
  }

  // -----------------

  private _setNewOption(index: number): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._objectElements.includes(element.localName)) {
        element.setAttribute('color', this._colorOptions[index]);
      }
    }
  }
}
