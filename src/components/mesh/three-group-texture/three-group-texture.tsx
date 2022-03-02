import { Component, Element, Prop, Listen } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { makeRandomString } from '@_utils/uuid';
import { uiObjectEvent } from '@_interface/Intersect';
import { textureOption, objectOptionsJSON, searchResultsJSON } from '@_interface/JSONData';

// Dynamic object
// 1:1 - 1 texture to 1 object
// <three-group-texture objects="'Suzanne','Doors'">
//   ...
// </three-group-texture>

@Component({
  tag: 'three-group-texture',
  shadow: false,
})
export class ThreeGroupTexture {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** DOM location of canvas element */
  @Prop({ mutable: false }) domId: string = '';                     // Dom location for the canvas element

  /** object that will receive texture update */
  @Prop({ mutable: false }) object: string = '';                    // 'Suzanne','Doors','starts*','*contains*','*ends'

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
        let payloadJSON: any = JSON.parse(event.detail.payload);

        if (payloadJSON.action === 'objectLink') {
          // Objects that match search criteria
          this._objectIDs[payloadJSON.slug].push(payloadJSON);
        }

        if (payloadJSON.action === 'textureUpdate') {
          // Call from UI to update color of object
          this._selectObjectGroup(payloadJSON.value.texture, payloadJSON.uuid, payloadJSON.value.placement);
        }
      }
    }
  }

  // -----------------

  private _scene: Scene;
  private _uigroup: string;
  private _uiid: string;
  private _objectElements: string[];
  private _menuElements: string[];
  private _optionElements: string[];
  private _objectIDs: string[][];
  private _textureOption: textureOption[];
  private _blockTextureLoader: THREE.TextureLoader;

  constructor() {
    this._scene = Scene.getInstance();

    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();
    this._objectElements = [
      'three-gltf'
    ];
    this._menuElements = [
      'three-canvas-texture'
    ];
    this._optionElements = [
      'three-option'
    ];
    this._objectIDs = [];
    this._textureOption = [];
    this._blockTextureLoader = new THREE.TextureLoader();
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    this._textureOption = this._gatherOptions();
    let objectJSON: string = this._parseObjectsString(this.object);
    let texturesJSON: string = this._parseTextureData(this._textureOption);
    this._traverseDOM(objectJSON, texturesJSON);
  }
  componentDidLoad() { }

  render() { }     // <<< cannot be removed

  // -----------------

  private _gatherOptions(): textureOption[] {
    let elements: HTMLCollection = this.host.children;
    let countIndex: number = 0;
    let resultArray: textureOption[] = [];

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._optionElements.includes(element.localName)) {
        let randomID: string = '';
        let optionObject: textureOption = {
          index: countIndex,
        }

        if (this.domId !== '') element.setAttribute('dom-id', this.domId);

        if (!(element.getAttribute('thumbnail') === null || element.getAttribute('thumbnail') === '')) {
          optionObject.thumbnail = element.getAttribute('thumbnail');
          randomID = makeRandomString(8);
          optionObject.thumbnailID = randomID;
          element.setAttribute('thumbnail-id', randomID);
        }

        if (!(element.getAttribute('texture') === null || element.getAttribute('texture') === '')) {
          optionObject.texture = element.getAttribute('texture');
          randomID = makeRandomString(8);
          optionObject.textureID = randomID;
          element.setAttribute('texture-id', randomID);
        }

        resultArray[countIndex] = optionObject;
        countIndex++;
      }
    }

    return (resultArray);
  }

  private _traverseDOM(objectJSON: string, texturesJSON: string): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      // menu
      if (this._menuElements.includes(element.localName)) {
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', makeRandomString(8));
        element.setAttribute('textures', texturesJSON);
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

  private _parseTextureData(data: textureOption[]): string {
    let jsonData: objectOptionsJSON = {
      from: this._uiid,
      textures: data
    }
    let texturesJSON: string = JSON.stringify(jsonData);
    return (texturesJSON);
  }

  // -----------------

  private _selectObjectGroup(texture: string, uuid: string, placement: string): void {
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
        this._updateObjectTexture(id, texture);                                   // take all IDs
      } else {
        if (oneArray.includes(uuid)) this._updateObjectTexture(id, texture);      // take some IDs
      }
    }
  }

  private _updateObjectTexture(objectUUID: string, texturePath: string): void {
    let actualObject: THREE.Mesh = null;
    actualObject = this._scene.scene.getObjectByProperty('uuid', objectUUID);

    if (actualObject) {
      this._blockTextureLoader.load(
        texturePath,
        (texture) => {
          actualObject.material.map = texture;
          actualObject.material.map.flipY = false;
          actualObject.material.needsUpdate = true;
        }
      );
    }
  }
}
