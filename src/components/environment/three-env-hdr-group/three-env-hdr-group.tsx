import { Component, Element, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';
import { uiObjectEvent } from '@_interface/Intersect';
import { hdrOption } from '@_interface/JSONData';

@Component({
  tag: 'three-env-hdr-group',
  shadow: false,
})
export class ThreeEnvHdrGroup {
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
      if (event.detail.action === 'hdrGroups') {
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
  private _hdrOptions: hdrOption[];

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();

    this._objectElements = ['three-env-hdr'];
    this._optionElements = ['three-option'];
    this._hdrOptions = [];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    this._hdrOptions = this._gatherOptions();
    this._updateAltMenu(this._hdrOptions);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _gatherOptions(): hdrOption[] {
    let elements: HTMLCollection = this.host.children;
    let countIndex: number = 0;
    let resultArray: hdrOption[] = [];

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._optionElements.includes(element.localName)) {
        let randomID: string = '';
        let optionObject: hdrOption = {
          index: countIndex,
        }

        if (!(element.getAttribute('path') === null || element.getAttribute('path') === '')) {
          optionObject.path = element.getAttribute('path');
        }

        if (!(element.getAttribute('name') === null || element.getAttribute('name') === '')) {
          optionObject.name = element.getAttribute('name');
        }

        if (!(element.getAttribute('thumbnail') === null || element.getAttribute('thumbnail') === '')) {
          optionObject.thumbnail = element.getAttribute('thumbnail');
          randomID = makeRandomString(8);
          optionObject.thumbnailID = randomID;
          element.setAttribute('thumbnail-id', randomID);
        }

        resultArray[countIndex] = optionObject;
        countIndex++;
      }
    }

    return (resultArray);
  }

  private _updateAltMenu(options: hdrOption[]): void {
    let submitObject: uiObjectEvent = {
      from: this.uiid,
      to: '',
      toGroup: this.uigroup,
      action: 'hdrGroups',
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
        element.setAttribute('path', this._hdrOptions[index].path);
        element.setAttribute('name', this._hdrOptions[index].name);
      }
    }
  }
}
