import { Component, Element, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';
import { uiObjectEvent } from '@_interface/Intersect';
import { objectOptionsJSON, thumbnailOption } from '@_interface/JSONData';

// Dynamic object
// <three-group-object dom-id="imageBox">
//   ...
// </three-group-object>

@Component({
  tag: 'three-group-object',
  shadow: false,
})
export class ThreeGroupObject {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';     // self generate and update

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';        // self generate and update

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '';                    // '0,0,0'

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '';                  // '0,0,0'

  /** scale multiplier passed down to children */
  @Prop({ mutable: false }) scale: string = '';                     // '1,1,1'

  /** Listen to calls coming from other components */
  @Listen('uiObjectBus', {
    target: 'body',
    capture: false,
    passive: true
  })
  uiObjectBusHandler(event: CustomEvent<uiObjectEvent>) {
    //                                                                            Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.to === this.uiid && event.detail.from !== this.uiid) {
      if (event.detail.type === 'json') {
        let payloadJSON: any = JSON.parse(event.detail.payload);       // TODO - define payload interface

        if (payloadJSON.action === 'thumbnailUpdate') {
          // Call from UI to show or hide one of the GLTF files
          this._showHideScene(payloadJSON);
        }
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
  private _menuElements: string[];
  private _thumbnailOptions: thumbnailOption[];
  private _activeOptionIndex: number;

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();
    this._activeOptionIndex = -1;

    this._objectElements = [
      'three-gltf'
    ];
    this._menuElements = [
      'three-canvas-thumbnail'
    ];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    this._thumbnailOptions = this._gatherOptions();
    let thumbnailJSON: string = this._parseThumbnailData(this._thumbnailOptions);
    this._traverseDOM(thumbnailJSON);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _gatherOptions(): thumbnailOption[] {
    let elements: HTMLCollection = this.host.children;
    let countIndex: number = 0;
    let resultArray: thumbnailOption[] = [];

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._objectElements.includes(element.localName)) {
        // Scene clocks, group and self ID
        let randomUIID = makeRandomString(8);
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', randomUIID);

        // Pass down / override transformation settings
        if (this.offset !== '') element.setAttribute('offset', this.offset);
        if (this.rotation !== '') element.setAttribute('rotation', this.rotation);
        if (this.scale !== '') element.setAttribute('scale', this.scale);

        let optionObject: thumbnailOption = null;
        if (!(element.getAttribute('thumbnail') === null || element.getAttribute('thumbnail') === '')) {
          optionObject = {
            index: countIndex,
            uiid: randomUIID,
            uigroup: this._uigroup,
            thumbnail: element.getAttribute('thumbnail')
          };
        }

        // find visible scenes
        if (!(element.getAttribute('visible') === null || element.getAttribute('visible') === '')) {
          // this._activeOptionIndex = countIndex;
          if (element.getAttribute('visible') === 'true') this._activeOptionIndex = countIndex;
        } else {
          this._activeOptionIndex = countIndex;
        }

        resultArray[countIndex] = optionObject;
        countIndex++;
      }
    }

    return (resultArray);
  }

  private _parseThumbnailData(data: thumbnailOption[]): string {
    let jsonData: objectOptionsJSON = {
      from: this._uiid,
      thumbnails: data
    }
    let thumbnailJSON: string = JSON.stringify(jsonData);
    return (thumbnailJSON);
  }

  private _traverseDOM(dataJSON: string): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      // menu
      if (this._menuElements.includes(element.localName)) {
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', makeRandomString(8));
        element.setAttribute('thumbnails', dataJSON);
      }

      // Attributes of the HTML elements
      let attributes: any = element.attributes;
      for (let j = 0; j < attributes.length; j++) {
        let attribute: any = attributes[j];
        if (attribute.name === 'dynamic') {
          element.setAttribute('clock-name', this.clockName);
        }
      }
    }
  }

  private _showHideScene(payloadJSON: any): void {
    // Hide current option
    this._notifyScene(this._thumbnailOptions[this._activeOptionIndex].uiid, false);

    // Show next one
    this._activeOptionIndex = payloadJSON.value.index;
    this._notifyScene(this._thumbnailOptions[this._activeOptionIndex].uiid, true);
  }

  private _notifyScene(to: string, visible: boolean): void {
    let payload: any = {
      action: 'updateVisibility',
      value: visible,
    };

    let submitObject: uiObjectEvent = {
      from: this.uiid,
      to: to,
      toGroup: this.uigroup,
      action: 'updateVisibility',
      type: 'json',
      payload: JSON.stringify(payload)
    };
    this.uiObjectBusEvent.emit(submitObject);
  }
}
