import { Component, Element, Prop, Listen, Event, EventEmitter } from '@stencil/core';

import { makeRandomString } from '@_utils/uuid';
import { uiObjectEvent } from '@_interface/Intersect';
import { objectOptionsJSON, thumbnailOption } from '@_interface/JSONData';

// <three-group-animation offset="0,0,-3" rotation="0,180,0" dom-id="imageBox">
//   ...
// </three-group-animation>

@Component({
  tag: 'three-group-animation',
  shadow: false,
})
export class ThreeGroupAnimation {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** DOM location of canvas element */
  @Prop({ mutable: false }) domId: string = '';                     // Dom location for the canvas element

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';     // self generate and update

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';        // self generate and update

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '';                    // '0,0,0'

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '';                  // '0,0,0'

  /** scale multiplier for imported scene */
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
          // Send command to switch animation
          this._switchAnimation(payloadJSON);
        }
      }
    }

    //                                          Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.from !== this.uiid) {
      if (event.detail.action === 'playAnimation') {
        this._playAnimations = JSON.parse(event.detail.payload);
      }
      if (event.detail.action === 'additiveAnimation') {
        this._additiveAnimation = JSON.parse(event.detail.payload);
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
  private _optionElements: string[];

  private _thumbnailOptions: thumbnailOption[];
  private _playAnimations: string[];
  private _additiveAnimation: string[];

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();

    this._objectElements = [
      'three-gltf-animated',
      'three-proxy'
    ];
    this._menuElements = [
      'three-canvas-thumbnail'
    ];
    this._optionElements = [
      'three-option'
    ];

    this._thumbnailOptions = [];
    this._playAnimations = [];
    this._additiveAnimation = [];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    this._thumbnailOptions = this._gatherOptions();
    let thumbnailJSON: string = this._parseThumbnailData(this._thumbnailOptions);
    this._updateParams(thumbnailJSON);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _gatherOptions(): thumbnailOption[] {
    let elements: HTMLCollection = this.host.children;
    let countIndex: number = 0;
    let resultArray: thumbnailOption[] = [];

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._optionElements.includes(element.localName)) {
        // Scene clocks, group and self ID
        let randomUIID = makeRandomString(8);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', randomUIID);

        let optionObject: thumbnailOption = {
          index: countIndex,
          uiid: randomUIID,
          uigroup: this.uigroup
        }

        if (this.domId !== '') element.setAttribute('dom-id', this.domId);
        if (!(element.getAttribute('thumbnail') === null || element.getAttribute('thumbnail') === '')) {
          let randomID: string = '';
          optionObject.thumbnail = element.getAttribute('thumbnail');
          randomID = makeRandomString(8);
          optionObject.thumbnailID = randomID;
          element.setAttribute('thumbnail-id', randomID);
        }
        if (!(element.getAttribute('link') === null || element.getAttribute('link') === '')) {
          optionObject.link = element.getAttribute('link');
        }

        resultArray[countIndex] = optionObject;
        countIndex++;
      }
    }

    return (resultArray);
  }

  private _updateParams(dataJSON: string): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      // Scene clocks, group and self ID
      if (this._objectElements.includes(element.localName)) {
        let randomUIID = makeRandomString(8);
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', randomUIID);

        // Pass down / override transformation settings
        if (this.offset !== '') element.setAttribute('offset', this.offset);
        if (this.rotation !== '') element.setAttribute('rotation', this.rotation);
        if (this.scale !== '') element.setAttribute('scale', this.scale);
      }

      // Menu
      if (this._menuElements.includes(element.localName)) {
        let randomUIID = makeRandomString(8);
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', randomUIID);
        element.setAttribute('thumbnails', dataJSON);
      }
    }
  }

  private _parseThumbnailData(data: thumbnailOption[]): string {
    let jsonData: objectOptionsJSON = {
      from: this._uiid,
      thumbnails: data
    }
    let thumbnailJSON: string = JSON.stringify(jsonData);
    return (thumbnailJSON);
  }

  private _switchAnimation(payloadJSON: any): void {
    let animationName = payloadJSON.value.link;
    let isPlayAnimation: boolean = (this._playAnimations.includes(animationName)) ? true : false;
    let isAdditiveAnimation: boolean = (this._additiveAnimation.includes(animationName)) ? true : false;

    let submitObject: uiObjectEvent = {
      from: this.uiid,
      to: '',
      toGroup: this.uigroup,
      action: '',
      type: 'string',
      payload: animationName
    };

    if (isPlayAnimation) submitObject.action = 'playAnimationUpdate';
    if (isAdditiveAnimation) submitObject.action = 'additiveAnimationUpdate';                   // TODO animation name AND weight in case of additive animations
    if (isPlayAnimation || isAdditiveAnimation) this.uiObjectBusEvent.emit(submitObject);       // Transmit event IF criteria match
  }
}
