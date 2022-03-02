import { Component, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { ControllerMeshUI } from '@_interface/Controller';
import { ControllerIntersect, uiObjectEvent } from '@_interface/Intersect';
import { emptyControllerEvent } from '@_utils/3d/uiTools';
import { makeRandomString } from '@_utils/uuid';
import { floorOption, callOut, hdrOption, icon } from '@_interface/JSONData';
import { uiButtonRound } from '@_utils/2d/ui-button-color';
import { uiButtonImage } from '@_utils/2d/ui-button-texture';
import { CameraNewLocation } from '@_interface/Camera';
import { domStringToVector } from '@_utils/3d/helper';
import { loadComplete } from '@_interface/Loadtracker';
import IntersectTools from '@_utils/3d/intersectTools';

// <three-canvas-altmenu dom-id="canvasbox" width="0.4" height="0.4" exit="/vr_assets/icons/navigation/open-door.png" default hires></three-canvas-altmenu>

@Component({
  tag: 'three-canvas-altmenu',
  shadow: false,
})
export class ThreeCanvasAltmenu {
  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** location on page where canvas is placed before rendered as material */
  @Prop({ mutable: false }) domId: string = '';

  /** width in meters */
  @Prop({ mutable: false }) width: number = 0;

  /** height in meters */
  @Prop({ mutable: false }) height: number = 0;

  /** switch to higher density of pixels of canvas material */
  @Prop({ mutable: false }) hires: boolean = false;

  /** unique ID of group in which this object resides */
  @Prop({ mutable: false }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: false }) uiid: string = '';

  /** this menu is default amongst all other alt-menus */
  @Prop({ mutable: false }) default: boolean = false;

  /** path to thumbnail of Location row */
  @Prop({ mutable: false }) rowLocation: string = '';

  /** path to thumbnail of Location row */
  @Prop({ mutable: false }) rowHdr: string = '';

  /** path to thumbnail of Location row */
  @Prop({ mutable: false }) rowTools: string = '';

  /** path to thumbnail of exit VR icon */
  @Prop({ mutable: false }) iconExit: string = '';              // Path to exit button icon, existence indicates its presence

  /** Listen to data coming from ray-caster */
  @Listen('intersect', {
    target: 'body',
    capture: false,
    passive: true
  })
  intersectHandler(event: CustomEvent<ControllerIntersect>) {
    if (event.detail.name === this._myName) {
      this._intersectData[event.detail.hand] = event.detail;
      this._intersectHelper.getData(event.detail.hand, event.detail);
    }
  }

  /** Listen to calls coming from other components */
  @Listen('uiObjectBus', {
    target: 'body',
    capture: false,
    passive: true
  })
  uiEventsHandler(event: CustomEvent<uiObjectEvent>) {
    if (event.detail.toGroup === this.uigroup && event.detail.to === this.uiid) {
      if (event.detail.action === 'updateProperty' && event.detail.type === 'json') {
        let payloadJSON: any = JSON.parse(event.detail.payload);
        this._menuSide.visible = payloadJSON.value as boolean;
        this._plane[payloadJSON.property] = payloadJSON.value;        // <<<< potentially very dangerous
      }
    }

    if (event.detail.action === 'floorGroups') {
      let parsedPayload: floorOption[] = JSON.parse(event.detail.payload) as floorOption[];
      this._getFloorThumbnails(parsedPayload);
    }

    if (event.detail.action === 'hdrGroups') {
      let parsedPayload: hdrOption[] = JSON.parse(event.detail.payload) as hdrOption[];
      if (event.detail.type === 'string') this._getHdrThumbnails(parsedPayload, event.detail.toGroup);
    }

    if (event.detail.action === 'colorGroups') {
      let parsedPayload: string[] = JSON.parse(event.detail.payload) as string[];
      if (event.detail.type === 'string') {
        this._colorCallGroup = event.detail.toGroup;
        this._colorGroups = parsedPayload;
      }
    }
  }

  /** Transmit event of new camera location / rotation */
  @Event({
    eventName: 'cameraUpdate',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) cameraUpdateEvent: EventEmitter<CameraNewLocation>;

  /** Transmit VR exit event  */
  @Event({
    eventName: 'loadComplete',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) loadCompleteEvent: EventEmitter<loadComplete>;

  /** Transmit data to other components */
  @Event({
    eventName: 'uiObjectBus',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) uiObjectBusEvent: EventEmitter<uiObjectEvent>;

  // -----------------

  private _scene: Scene;
  private _plane: THREE.Mesh;
  private _resMultiplier: number;
  private _randomID: string;
  private _myName: string;

  private _floorGroups: floorOption[];
  private _hdrGroups: hdrOption[];
  private _colorGroups: string[];
  private _hdrCallGroup: string;
  private _colorCallGroup: string;

  private _rowIcons: icon[];
  private _rowLocation: icon;
  private _rowHdr: icon;
  private _rowTools: icon;
  private _iconExit: callOut;

  private _canvasBox: HTMLElement;
  private _canvasElement: HTMLCanvasElement;
  private _canvasTexture: THREE.CanvasTexture;
  private _canvasMaterial: THREE.MeshBasicMaterial;
  private _canvasContext: CanvasRenderingContext2D;

  private _intersectHelper: IntersectTools;
  private _intersectData: ControllerIntersect[];

  private _menuSide: ControllerMeshUI;
  private _uiEventLast: boolean;

  constructor() {
    this._randomID = makeRandomString(6);

    this._floorGroups = [];
    this._hdrGroups = [];
    this._colorGroups = [];
    this._hdrCallGroup = '';
    this._colorCallGroup = '';

    this._rowIcons = [];
    this._rowLocation = {}
    this._rowHdr = {};
    this._rowTools = {};
    this._iconExit = {
      action: 'exit'
    };

    this._canvasBox = null;
    this._canvasContext = null;
    this._resMultiplier = (this.hires) ? 1000 : 700;

    this._intersectHelper = new IntersectTools();
    this._intersectData = new Array();
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();

    // Palette / side menu
    this._menuSide = {
      visible: false,
      position: new THREE.Vector3((this.width / 2), 0, -0.25),
      rotation: new THREE.Euler(THREE.MathUtils.degToRad(-30), 0, 0, 'XYZ'),
      mesh: null
    };
    this._uiEventLast = false;

    this._createUIplane();
  }

  componentWillLoad() {
    this._myName = this._plane.uuid;

    // Create canavs for alt menu
    this._canvasContext = this._canvasElement.getContext('2d');
    this._intersectHelper.altMenuBackground(this._canvasContext, this.width, this.height, 3, this._resMultiplier, null);
    this._canvasTexture.needsUpdate = true;

    // Add panel to 3D scene
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._plane);

    this._addToPool();
  }

  componentDidLoad() { }

  componentDidRender() {
    // Add canvas element to page DOM. AFTER initial render of all DOM elements.
    this._canvasBox = document.getElementById(this.domId);
    this._canvasBox.appendChild(this._canvasElement);

    // Initiate load of icons
    if (this.rowLocation !== '') this._getIcon(this.rowLocation, this._rowLocation, 0);
    if (this.rowHdr !== '') this._getIcon(this.rowHdr, this._rowHdr, 1);
    if (this.rowTools !== '') this._getIcon(this.rowTools, this._rowTools, 2);
    if (this.iconExit !== '') this._getIcon(this.iconExit, this._iconExit, null);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _addToPool(): void {
    // Add panel to pool
    let poolName: string = (this.default) ? 'menu-side' : 'menu-side-' + this._randomID;
    let poolAddition: Pool = {
      name: poolName,
      type: 'ui-altmenu',
      objectID: this._plane.uuid,
      isGrouped: true,
      groupID: this.uigroup,
      uiID: this.uiid,
      interactWithHand: 'right',
      latchToController: 'left',
      priority: 5
    };
    checkAndAddToGroup(this._scene, poolAddition, this._plane);
  }

  private _animate(): void {
    // Canvas animation / update
    if (this._canvasContext !== null) {
      this._intersectHelper.altMenuBackground(this._canvasContext, this.width, this.height, 3, this._resMultiplier, this._rowIcons);
      this._intersectHelper.pointer('right', this._canvasContext, this.width, this.height, this._resMultiplier, this._pointerActiveCall, this._pointerPassiveCall);
    }

    this._canvasTexture.needsUpdate = true;

    // Intersect / Select / Squeeze button events
    // this._intersectHelper.intersectEvents();
    this._intersectHelper.handEvents();

    // Reset state
    this._intersectHelper.resetData();
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();
  }

  // -----------------

  private _createUIplane(): void {
    // New canvas UI DOM element
    this._canvasElement = document.createElement("canvas");
    this._canvasElement.setAttribute('id', this._randomID);
    this._canvasElement.setAttribute('width', (this.width * this._resMultiplier).toString());
    this._canvasElement.setAttribute('height', (this.height * this._resMultiplier).toString());

    // canvas texture
    this._canvasTexture = new THREE.CanvasTexture(this._canvasElement);
    this._canvasTexture.needsUpdate = true;

    // New plane for canvas
    const plGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(this.width, this.height, 1);
    this._canvasMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      map: this._canvasTexture
    });

    // UI plane
    this._plane = new THREE.Mesh(plGeometry, this._canvasMaterial);
    this._plane.name = (this.default) ? 'ui-altmenu-plane' : 'ui-altmenu-plane-' + this._randomID;
    this._plane.position.set(this._menuSide.position.x, this._menuSide.position.y, this._menuSide.position.z);
    this._plane.setRotationFromEuler(this._menuSide.rotation);
    this._plane.visible = this._menuSide.visible;

    this._menuSide.mesh = this._plane;
  }

  // -----------------

  private _pointerActiveCall = (x: number, y: number, hand: string): void => {
    if (this._floorGroups.length > 0) {
      this._buttonsLocation(true, 0, x, y, hand, this._floorGroups);
      this._buttonsHDR(true, 1, x, y, hand, this._hdrGroups, this._colorGroups);
      this._buttonsExit(true, 2, x, y, hand);
    }
  }

  private _pointerPassiveCall = (x: number, y: number): void => {
    if (this._floorGroups.length > 0) {
      this._buttonsLocation(false, 0, x, y, '', this._floorGroups);
      this._buttonsHDR(false, 1, x, y, '', this._hdrGroups, this._colorGroups);
      this._buttonsExit(false, 2, x, y, '');
    }
  }

  // -----------------
  // --- Location

  private _buttonsLocation(active: boolean, row: number, x: number, y: number, hand: string, options: floorOption[]): void {
    for (let i = 0; i < options.length; i++) {
      if (options[i].thumbnailContent) {
        uiButtonImage(
          this._canvasContext,                                                                                          // ctx
          x, y,                                                                                                         // mouseX, mouseY 
          (active) ? this._intersectData[hand].state : '',                                                              // mouseState
          (0.01 + (this.height / 3)) * this._resMultiplier + ((this.height / 3 - 0.02) * i) * this._resMultiplier,      // x
          (0.02 + ((this.height / 3) * row)) * this._resMultiplier,                                                     // y
          ((this.height / 3 - 0.04) * this._resMultiplier),                                                             // size
          options[i],                                                                                                   // thumbnail
          (active) ? () => { this._uiLocationEvent(this._intersectData[hand].state, options[i]) } : () => { }           // callback / or not
        );
      }
    }
  }

  private _uiLocationEvent(eventName: string, value: floorOption): void {
    if (this._uiEventLast === false && eventName === 'select') {    // Start event
      this._uiEventLast = true;
      this._uiLocationCall('start', value);
    }
    if (this._uiEventLast === true && eventName === '') {           // Stop event
      this._uiEventLast = false;
      this._uiLocationCall('end', value);
    }
  }

  private _uiLocationCall(state: string, value: floorOption): void {
    let offsetVector: THREE.Vector3 = domStringToVector(value.offset);
    let rotation = domStringToVector(value.rotation);
    let rotationEuler: THREE.Euler = new THREE.Euler(THREE.MathUtils.degToRad(rotation.x), THREE.MathUtils.degToRad(rotation.y), THREE.MathUtils.degToRad(rotation.z), 'XYZ');

    let cameraLocationUpdate: CameraNewLocation = {
      onEvent: state,
      location: offsetVector,
      rotation: rotationEuler
    }
    this.cameraUpdateEvent.emit(cameraLocationUpdate);
  }

  // -----------------
  // --- HDR images

  private _buttonsHDR(active: boolean, row: number, x: number, y: number, hand: string, options: hdrOption[], colors: string[]): void {
    let xIndex: number = 0;
    let radius: number = 0;

    // Color buttons
    for (let i = 0; i < colors.length; i++) {
      radius = ((this.height / 3 - 0.04) * this._resMultiplier) / 2;
      
      uiButtonRound(
        this._canvasContext,                                                                                            // ctx
        x, y,                                                                                                           // mouseX, mouseY
        (active) ? this._intersectData[hand].state : '',                                                                // mouseState
        (0.03 + (this.height / 3)) * this._resMultiplier + ((this.height / 3 - 0.02) * xIndex) * this._resMultiplier + radius,   // x
        (0.04 + ((this.height / 3) * row)) * this._resMultiplier + radius,                                                       // y
        radius,                                                                                                         // radius
        colors[i],                                                                                                      // color
        (active) ? () => { this._uiColorEvent(this._intersectData[hand].state, i, this._colorCallGroup) } : () => { }   // callback
      );
      xIndex++
    }

    // HDR buttons
    for (let i = 0; i < options.length; i++) {
      if (options[i].thumbnailContent) {
        uiButtonImage(
          this._canvasContext,                                                                                          // ctx
          x, y,                                                                                                         // mouseX, mouseY 
          (active) ? this._intersectData[hand].state : '',                                                              // mouseState
          (0.01 + (this.height / 3)) * this._resMultiplier + ((this.height / 3 - 0.02) * xIndex) * this._resMultiplier, // x
          (0.02 + ((this.height / 3) * row)) * this._resMultiplier,                                                     // y
          ((this.height / 3 - 0.04) * this._resMultiplier),                                                             // size
          options[i],                                                                                                   // thumbnail
          (active) ? () => { this._uiHdrEvent(this._intersectData[hand].state, i, this._hdrCallGroup) } : () => { }     // callback / or not
        );
        xIndex++
      }
    }
  }

  private _uiHdrEvent(eventName: string, optionIndex: number, toGroup: string): void {
    if (this._uiEventLast === false && eventName === 'select') {    // Start event
      this._uiEventLast = true;
      this._uiHdrCall(optionIndex, toGroup);
    }
    if (this._uiEventLast === true && eventName === '') {           // Stop event
      this._uiEventLast = false;
    }
  }

  private _uiHdrCall(optionIndex: number, toGroup: string): void {
    let submitObject: uiObjectEvent = {
      from: this.uiid,
      to: '',
      toGroup: toGroup,
      action: 'hdrGroups',
      type: 'number',
      payload: JSON.stringify(optionIndex)
    };
    this.uiObjectBusEvent.emit(submitObject);
  }

  private _uiColorEvent(eventName: string, optionIndex: number, toGroup: string): void {
    if (this._uiEventLast === false && eventName === 'select') {    // Start event
      this._uiEventLast = true;
      this._uiColorCall(optionIndex, toGroup);
    }
    if (this._uiEventLast === true && eventName === '') {           // Stop event
      this._uiEventLast = false;
    }
  }

  private _uiColorCall(optionIndex: number, toGroup: string): void {
    let submitObject: uiObjectEvent = {
      from: this.uiid,
      to: '',
      toGroup: toGroup,
      action: 'colorGroups',
      type: 'number',
      payload: JSON.stringify(optionIndex)
    };
    this.uiObjectBusEvent.emit(submitObject);
  }

  // -----------------
  // --- Exit

  private _buttonsExit(active: boolean, row: number, x: number, y: number, hand: string): void {
    if (this.iconExit !== '') {
      uiButtonImage(
        this._canvasContext,                                                                  // ctx
        x, y,                                                                                 // mouseX, mouseY
        (active) ? this._intersectData[hand].state : '',                                      // mouseState
        (0.01 + (this.height / 3)) * this._resMultiplier,                                     // x
        (0.02 + ((this.height / 3) * row)) * this._resMultiplier,                             // y
        ((this.height / 3 - 0.04) * this._resMultiplier),                                     // size
        this._iconExit,                                                                       // thumbnail
        (active) ? () => { this._uiExitEvent(this._intersectData[hand].state) } : () => { }   // callback / or not
      );
    }
  }

  private _uiExitEvent(eventName: string): void {
    if (this._uiEventLast === false && eventName === 'select') {    // Start event
      this._uiEventLast = true;
    }
    if (this._uiEventLast === true && eventName === '') {           // Stop event
      this._uiEventLast = false;
      this._uiExitCall();
    }
  }

  private _uiExitCall(): void {
    let loadCompleteData: loadComplete = {
      buttonID: this.uiid,
      scene: 'close'
    }
    this.loadCompleteEvent.emit(loadCompleteData);
  }

  // -----------------
  // --- Image loading / handling 

  private _getFloorThumbnails(data: floorOption[]): void {
    this._floorGroups = data;

    // Collect image binary data
    for (let i = 0; i < this._floorGroups.length; i++) {
      if (this._floorGroups[i].thumbnail) {
        const thumbLoader: THREE.ImageLoader = new THREE.ImageLoader();
        thumbLoader.load(
          this._floorGroups[i].thumbnail,
          (image) => this._loadFloorImage(image, i),
          () => this._progressImage(),
          () => this._errorImage(this._floorGroups[i].thumbnail)
        );
      }
    }
  }

  private _loadFloorImage(image: any, index: number): void {
    this._floorGroups[index].thumbnailID = makeRandomString(8);
    this._floorGroups[index].thumbnailContent = image;
  }

  // -----------------

  private _getHdrThumbnails(data: hdrOption[], toGroup: string): void {
    this._hdrGroups = data;
    this._hdrCallGroup = toGroup;

    // Collect image binary data
    for (let i = 0; i < this._hdrGroups.length; i++) {
      if (this._hdrGroups[i].thumbnail) {
        const thumbLoader: THREE.ImageLoader = new THREE.ImageLoader();
        thumbLoader.load(
          this._hdrGroups[i].thumbnail,
          (image) => this._loadHdrImage(image, i),
          () => this._progressImage(),
          () => this._errorImage(this._hdrGroups[i].thumbnail)
        );
      }
    }
  }

  private _loadHdrImage(image: any, index: number): void {
    this._hdrGroups[index].thumbnailContent = image;
  }

  // -----------------

  private _getIcon(path: string, icon: callOut | icon, index: number = null): void {
    icon.thumbnail = this.iconExit;

    const thumbLoader: THREE.ImageLoader = new THREE.ImageLoader();
    thumbLoader.load(
      path,
      (image) => this._loadImage(image, icon, index),
      () => this._progressImage(),
      () => this._errorImage(path)
    );
  }

  private _loadImage(image: any, icon: callOut | icon, index: number = null): void {
    icon.thumbnailID = makeRandomString(8);
    icon.thumbnailContent = image;

    if (index !== null) this._rowIcons[index] = icon;     // TODO - Bit janky - code needs to be more versatile
  }

  private _progressImage(): void { }

  private _errorImage(path: string): void {
    console.error('Image failed to load: ', path);
  }
}
