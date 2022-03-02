import { Component, Element, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';
import { loadComplete } from '@_interface/Loadtracker';
import { floorOption } from '@_interface/JSONData';
import { uiObjectEvent } from '@_interface/Intersect';
import { domStringToVector } from '@_utils/3d/helper';

// <three-env-group>
//   ...
// </three-env-group>

@Component({
  tag: 'three-env-group',
  shadow: false,
})
export class ThreeEnvGroup {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** Listen to scene load complete event  */
  @Listen('loadComplete', {
    target: 'body',
    capture: false,
    passive: true
  })
  loadCompleteHandler(event: CustomEvent<loadComplete>) {
    // if (event.detail.scene === 'loaded') {}
    if (event.detail.scene === 'open') {
      this._collectGroups();
      this._updateAltMenu();
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

  private _floorElements: string[];
  private _floorGroups: floorOption[];

  constructor() {}

  componentWillLoad() {
    this._floorElements = [
      'three-gltf-floor',
      'three-mesh-floor'
    ];

    this._traverseDOM();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _traverseDOM(): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: any = elements[i] as HTMLElement;

      // Attributes of the HTML elements
      let attributes: any = element.attributes;
      for (let j = 0; j < attributes.length; j++) {
        let attribute: any = attributes[j];

        // dynamic elements
        if (attribute.name === 'dynamic') {
          element.setAttribute('clock-name', this.clockName);
        }
      }

      // floor objects
      if (this._floorElements.includes(element.localName)) {
        let tempUigroup = makeRandomString(8);
        let tempUiID = makeRandomString(8);
        element.setAttribute('uigroup', tempUigroup);     // each floor is its own group
        element.setAttribute('uiid', tempUiID);
      }
    }
  }

  private _collectGroups(): void {
    this._floorGroups = [];

    let elements: HTMLCollection = this.host.children;
    let index: number = 0;

    for (let i = 0; i < elements.length; i++) {
      let element: any = elements[i] as HTMLElement;

      // floor objects
      if (this._floorElements.includes(element.localName)) {
        this._addFloorGroup(index, element);
        index++;
      }
    }
  }

  private _addFloorGroup(index: number, element: HTMLElement) {
    let uigroup = element.getAttribute('uigroup');
    let uiid = element.getAttribute('uiid');

    // Collect link and thumbnail
    let thumbnailPath = element.getAttribute('thumbnail');
    let link = element.getAttribute('link');
    let offset = element.getAttribute('offset');
    let rotation = element.getAttribute('rotation');
    let shiftOrigin = element.getAttribute('shift-origin');
    let defaultParam = element.getAttribute('default');

    // Verify and apply new target location
    if (shiftOrigin) {
      let tempShift = domStringToVector(shiftOrigin);
      let tempOffsetString = (offset === null) ? '0,0,0' : offset;
      let tempOffset = domStringToVector(tempOffsetString);
      let newOffsetVector = tempOffset.add(tempShift);

      // New shifted offset 
      offset = newOffsetVector.x + ',' + newOffsetVector.y + ',' + newOffsetVector.z;
    }

    let floorGroup: floorOption = {
      index: index,
      uiid: uiid,
      uigroup: uigroup,
      link: (link === null) ? '' : link,
      thumbnail: (thumbnailPath === null) ? '' : thumbnailPath,
      offset: (offset === null) ? '0,0,0' : offset,
      shiftOrigin: (shiftOrigin === null) ? '0,0,0' : offset,
      rotation: (rotation === null) ? '0,0,0' : rotation,
      default: (defaultParam === null) ? false : true
    }
    this._floorGroups.push(floorGroup);
  }


  // TODO - Update origin landing position in VR, OR update position after session is open and shift user within first few frames.

  private _updateAltMenu(): void {
    let submitObject: uiObjectEvent = {
      from: 'environment',
      to: '',
      toGroup: '',
      action: 'floorGroups',
      type: 'string',
      payload: JSON.stringify(this._floorGroups)
    };
    this.uiObjectBusEvent.emit(submitObject);
  }
}
