import { Component, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { ControllerMeshUI } from '@_interface/Controller';
import { ControllerIntersect, uiObjectEvent, gltfUImeta } from '@_interface/Intersect';
import { emptyControllerEvent } from '@_utils/3d/uiTools';
import { uiButton } from '@_utils/2d/ui-button';
import { makeRandomString } from '@_utils/uuid';
import IntersectTools from '@_utils/3d/intersectTools';

// <three-canvas-menu dom-id="canvasbox" width="1" height="1" default=""></three-canvas-menu>

@Component({
  tag: 'three-canvas-menu',
  shadow: false,
})
export class ThreeCanvasMenu {
  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** Location on page where canvas is placed before rendered as material */
  @Prop({ mutable: false }) domId: string = '';

  /** width in meters */
  @Prop({ mutable: false }) width: number = 0;

  /** height in meters */
  @Prop({ mutable: false }) height: number = 0;

  /** Switch to higher density of pixels of canvas material */
  @Prop({ mutable: false }) hires: boolean = false;

  /** unique ID of group in which this object resides */
  @Prop({ mutable: false }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: false }) uiid: string = '';

  /** this menu is default amongst all other menus */
  @Prop({ mutable: false }) default: boolean = false;

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
  uiEventsHandler(data: CustomEvent<uiObjectEvent>) {
    //                                         Prevent self calling bus message
    if (data.detail.toGroup === this.uigroup && data.detail.from !== this.uiid) {
      this._processUIData(data.detail);
    }

    //                                                                          Prevent self calling bus message
    if (data.detail.toGroup === this.uigroup && data.detail.to === this.uiid && data.detail.from !== this.uiid) {
      if (data.detail.action === 'updateProperty' && data.detail.type === 'json') {
        let payloadJSON: any = JSON.parse(data.detail.payload);
        this._menuFront.visible = payloadJSON.value as boolean;
        this._plane[payloadJSON.property] = payloadJSON.value;        // <<<< potentially very dangerous
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
  private _plane: THREE.Mesh;
  private _resMultiplier: number;
  private _randomID: string;
  private _myName: string;

  private _canvasBox: HTMLElement;
  private _canvasElement: HTMLCanvasElement;
  private _canvasTexture: THREE.CanvasTexture;
  private _canvasMaterial: THREE.MeshBasicMaterial;
  private _canvasContext: CanvasRenderingContext2D;

  private _intersectHelper: IntersectTools;
  private _intersectData: ControllerIntersect[];

  private _menuFront: ControllerMeshUI;

  private _uiEventLast: boolean;
  private _uiGltfMeta: gltfUImeta;

  constructor() {
    this._canvasBox = null;
    this._canvasContext = null;

    this._resMultiplier = (this.hires) ? 800 : 300;
    this._randomID = makeRandomString(6);

    this._intersectHelper = new IntersectTools();
    this._intersectData = new Array();
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();

    this._uiEventLast = false;
    this._uiGltfMeta = {
      animations: []
    }

    // Front Menu
    this._menuFront = {
      visible: false,
      position: new THREE.Vector3((this.width * 0.3), 0, -0.5),
      rotation: new THREE.Euler(0, 0, 0, 'XYZ'),
      mesh: null
    };

    this._createUIplane();
  }

  componentWillLoad() {
    this._myName = this._plane.uuid;

    this._canvasContext = this._canvasElement.getContext('2d');
    this._intersectHelper.menuBackground(this._canvasContext, this.width, this.height, this._resMultiplier);
    this._canvasTexture.needsUpdate = true;

    // Add panel to 3D scene
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._plane);

    // Add panel to pool
    let poolName: string = (this.default) ? 'menu-front' : 'menu-front-' + this._randomID;
    let poolAddition: Pool = {
      name: poolName,
      type: 'ui-menu',
      objectID: this._plane.uuid,
      isGrouped: true,
      groupID: this.uigroup,
      uiID: this.uiid,
      interactWithHand: 'right',
      latchToController: 'left',
      priority: 10
    };
    checkAndAddToGroup(this._scene, poolAddition, this._plane);
  }

  componentDidLoad() { }

  componentDidRender() {
    // Add canvas element to page DOM. AFTER initial render of all DOM elements.
    this._canvasBox = document.getElementById(this.domId);
    this._canvasBox.appendChild(this._canvasElement);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _animate(): void {
    // Canvas animation / update
    if (this._canvasContext !== null) {
      this._intersectHelper.menuBackground(this._canvasContext, this.width, this.height, this._resMultiplier);
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
    this._plane.name = (this.default) ? 'ui-menu-plane' : 'ui-menu-plane-' + this._randomID;
    this._plane.position.set(this._menuFront.position.x, this._menuFront.position.y, this._menuFront.position.z);
    this._plane.setRotationFromEuler(this._menuFront.rotation);
    this._plane.visible = this._menuFront.visible;

    this._menuFront.mesh = this._plane;
  }

  private _pointerActiveCall = (x: number, y: number, hand: string): void => {
    this._buttonsActive(x, y, hand);
  }

  private _pointerPassiveCall = (x: number, y: number): void => {
    this._buttonsPassive(x, y);
  }

  // -----------------

  private _uiEvents(eventName: string, value: string): void {
    if (this._uiEventLast === false && eventName === 'select') {
      // Start event
      this._uiEventLast = true;

      let submitObject: uiObjectEvent = {
        from: this.uiid,
        to: '',
        toGroup: this.uigroup,
        type: 'string',
        payload: value
      };
      this.uiObjectBusEvent.emit(submitObject);
    }

    if (this._uiEventLast === true && eventName === '') {
      // Stop event
      this._uiEventLast = false;
    }
  }

  // Menu data functions
  private _processUIData(data: uiObjectEvent): void {
    // if (data.type === 'string')  // ???? Do something???
    if (data.type === 'animations') this._uiGltfMeta.animations = JSON.parse(data.payload);
    if (data.type === 'additive') this._uiGltfMeta.additive = JSON.parse(data.payload);
  }

  private _buttonsActive(x: number, y: number, hand: string): void {
    if (this._uiGltfMeta.animations.length > 0) {
      for (let i = 0; i < this._uiGltfMeta.animations.length; i++) {
        uiButton(
          this._canvasContext,
          x, y, this._intersectData[hand].state,
          (0.1 * this._resMultiplier),
          ((0.1 + (0.4 * i)) * this._resMultiplier),
          (1.5 * this._resMultiplier),
          (0.3 * this._resMultiplier),
          this._uiGltfMeta.animations[i],
          () => { this._uiEvents(this._intersectData[hand].state, this._uiGltfMeta.animations[i]) }
        );
      }
    }
  }

  private _buttonsPassive(x: number, y: number): void {
    if (this._uiGltfMeta.animations.length > 0) {
      for (let i = 0; i < this._uiGltfMeta.animations.length; i++) {
        uiButton(
          this._canvasContext,
          x, y, '',
          (0.1 * this._resMultiplier),
          ((0.1 + (0.4 * i)) * this._resMultiplier),
          (1.5 * this._resMultiplier),
          (0.3 * this._resMultiplier),
          this._uiGltfMeta.animations[i],
          () => { }
        );
      }
    }
  }
}
