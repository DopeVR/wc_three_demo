import { Component, Element, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { makeRandomString } from '@_utils/uuid';
import { uiObjectEvent } from '@_interface/Intersect';
import { searchResultsJSON, objectOptionsJSON } from '@_interface/JSONData';

// Dynamic object
// 1:n - 1 color to n objects
// <three-group-color objects="'Suzanne','Doors'" colors="'#77B4E0','#E08482','#6CE0D3','#E0A855','#60E089'">
//   ...
// </three-group-color>

@Component({
  tag: 'three-group-color',
  shadow: false,
})
export class ThreeGroupColor {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** objects designated to change color */
  @Prop({ mutable: false }) objects: string = '';                // 'Suzanne','Doors','starts*','*contains*','*ends'

  /** color options */
  @Prop({ mutable: false }) colors: string = '';                 // '#77B4E0','#E08482','#6CE0D3','#E0A855','#60E089'

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';

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
  uiObjectBusHandler(event: CustomEvent<uiObjectEvent>): void {
    //                                                                            Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.to === this.uiid && event.detail.from !== this.uiid) {
      if (event.detail.type === 'json') {
        let payloadJSON: any = JSON.parse(event.detail.payload);

        if (payloadJSON.action === 'objectLink') {
          // Objects that match search criteria
          this._objectIDs[payloadJSON.slug].push(payloadJSON);
        }

        if (payloadJSON.action === 'colorUpdate') {
          // Call from UI to update color of object
          this._selectObjectGroup(payloadJSON.color, payloadJSON.uuid, payloadJSON.placement);
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

  private _scene: Scene;
  private _uigroup: string;
  private _uiid: string;
  private _objectElements: string[];
  private _menuElements: string[];
  private _objectIDs: string[][];

  constructor() {
    this._scene = Scene.getInstance();

    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();
    this._objectElements = [
      'three-gltf'
    ];
    this._menuElements = [
      'three-canvas-color'
    ];
    this._objectIDs = [];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    let objectJSON: string = this._parseObjectsString(this.objects);
    let colorJSON: string = this._parseColorsString(this.colors);
    this._traverseDOM(objectJSON, colorJSON);
  }
  componentDidLoad() { }

  render() { }     // <<< cannot be removed

  // -----------------

  private _traverseDOM(objectJSON: string, colorJSON: string): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;
      // menu
      if (this._menuElements.includes(element.localName)) {
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', makeRandomString(8));
        element.setAttribute('colors', colorJSON);
      }

      // active objects
      if (this._objectElements.includes(element.localName)) {
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', makeRandomString(8));
        element.setAttribute('objects', objectJSON);

        // Pass down / override transformation settings
        if (this.offset !== '') element.setAttribute('offset', this.offset);
        if (this.rotation !== '') element.setAttribute('rotation', this.rotation);
        if (this.scale !== '') element.setAttribute('scale', this.scale);
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

  // -----------------

  private _rinseText(dataBit: string): string {
    dataBit = dataBit.trim();
    dataBit = dataBit.replace(/'/g, '');
    dataBit = dataBit.replace(/"/g, '');
    dataBit = dataBit.trim();
    return (dataBit);
  }

  private _parseObjectsString(data: string): string {
    let dataDirtyArray: string[] = data.split(',');
    let exactArray: string[] = [];
    let startsArray: string[] = [];
    let containsArray: string[] = [];
    let endsArray: string[] = [];

    let keyName: string = '';
    for (let dataBit of dataDirtyArray) {
      dataBit = this._rinseText(dataBit);

      // exact, starts, contains, ends
      keyName = dataBit.replace(/\*/g, '');
      this._objectIDs[keyName] = [];

      if (dataBit.includes('*')) {
        if (dataBit.startsWith('*') && dataBit.endsWith('*')) {
          containsArray.push(keyName);
        } else {
          if (dataBit.startsWith('*')) endsArray.push(keyName);     // String ends with
          if (dataBit.endsWith('*')) startsArray.push(keyName);     // String starts with
        }
      } else {
        exactArray.push(keyName);
      }
    }

    let jsonData: searchResultsJSON = {
      from: this._uiid,
      exact: exactArray,
      starts: startsArray,
      contains: containsArray,
      ends: endsArray
    }
    let objectJSON: string = JSON.stringify(jsonData);
    return (objectJSON);
  }

  private _parseColorsString(data: string): string {
    let dataDirtyArray: string[] = data.split(',');
    let dataCleanArray: string[] = [];

    for (let dataBit of dataDirtyArray) {
      dataBit = this._rinseText(dataBit);
      if (dataBit.startsWith('#')) {
        dataCleanArray.push(dataBit);
      }
    }

    let jsonData: objectOptionsJSON = {
      from: this._uiid,
      colors: dataCleanArray
    }
    let colorJSON: string = JSON.stringify(jsonData);
    return (colorJSON);
  }

  // -----------------

  private _selectObjectGroup(color: string, uuid: string, placement: string): void {
    let oneArray: string[] = [];

    // Collect all IDs
    for (let subArray in this._objectIDs) {
      let oneSubArray: any[] = this._objectIDs[subArray];
      for (let dataObject of oneSubArray) {
        oneArray.push(dataObject.uuid);
      }
    }

    // Make change to those IDs
    for (let id of oneArray) {
      if (placement === 'static') {
        this._updateObjectColor(id, color);                                   // take all IDs
      } else {
        if (oneArray.includes(uuid)) this._updateObjectColor(id, color);      // take some IDs
      }
    }
  }

  private _updateObjectColor(objectUUID: string, color: string): void {
    let actualObject: THREE.Mesh = null;
    actualObject = this._scene.scene.getObjectByProperty('uuid', objectUUID);

    if (actualObject) {
      actualObject.material.color.set(color);
    }
  }
}
