import { Component, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { Pool } from '@_interface/Pool';
import { ControllerMeshUI } from '@_interface/Controller';
import { ControllerIntersect, uiObjectEvent } from '@_interface/Intersect';
import { textureOption, objectOptionsJSON } from '@_interface/JSONData';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { emptyControllerEvent } from '@_utils/3d/uiTools';
import { uiButtonImage } from '@_utils/2d/ui-button-texture';
import { makeRandomString } from '@_utils/uuid';
import IntersectTools from '@_utils/3d/intersectTools';
import { domStringToVector } from '@_utils/3d/helper';

// <three-canvas-texture dom-id="canvasbox" width="1.3" height="0.3" hires></three-canvas-texture>

@Component({
  tag: 'three-canvas-texture',
  shadow: false,
})
export class ThreeCanvasTexture {
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

  /** texture options in JSON format */
  @Prop({ mutable: false }) textures: string = '';

  /** is this menu attached to left controller or static object */
  @Prop({ mutable: false }) static: boolean = false;

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '0,0,0';                    // '0,0,0'

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '0,0,0';                  // '0,0,0'

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
    //                                                                            Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.to === this.uiid && event.detail.from !== this.uiid) {
      if (event.detail.action === 'updateProperty' && event.detail.type === 'json') {
        let payloadJSON: any = JSON.parse(event.detail.payload);

        if (this.static) {
          this._menuFront.visible = true;
        } else {
          this._menuFront.visible = payloadJSON.value as boolean;
        }

        this._plane[payloadJSON.property] = payloadJSON.value;        // <<<< potentially very dangerous
        this._originObjectID = payloadJSON.originObjectID;            // origin object uuid for this menu
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

  private _optionTextures: objectOptionsJSON;
  private _menuFront: ControllerMeshUI;

  private _uiEventLast: boolean;
  private _originObjectID: string;

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
    this._originObjectID = '';

    // Front Menu
    this._menuFront = {
      visible: false,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0, 'XYZ'),
      mesh: null
    };
    this._createUIplane();
  }

  componentWillLoad() {
    this._myName = this._plane.uuid;
    this._optionTextures = (this.textures === '') ? null : JSON.parse(this.textures);

    this._canvasContext = this._canvasElement.getContext('2d');
    this._intersectHelper.menuBackground(this._canvasContext, this.width, this.height, this._resMultiplier);
    this._canvasTexture.needsUpdate = true;

    // Add panel to 3D scene
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._plane);

    // Static or dynamic
    if (this.static) {
      this._addToPoolStatic();
    } else {
      this._addToPoolDynamic();
    }
  }

  componentDidLoad() {
    if (this._optionTextures) this._getThumbnails();
  }

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
    this._plane.name = 'ui-menu-color-' + this._randomID;
    this._plane.position.set(this._menuFront.position.x, this._menuFront.position.y, this._menuFront.position.z);
    this._plane.setRotationFromEuler(this._menuFront.rotation);
    this._plane.visible = this._menuFront.visible;

    this._menuFront.mesh = this._plane;
  }

  private _pointerActiveCall = (x: number, y: number, hand: string): void => {
    if (this._optionTextures) {
      this._buttonsActive(x, y, hand, this._optionTextures);
    }
  }

  private _pointerPassiveCall = (x: number, y: number): void => {
    if (this._optionTextures) {
      this._buttonsPassive(x, y, this._optionTextures);
    }
  }

  // -----------------

  private _addToPoolDynamic(): void {
    let dynamicOffeset: THREE.Vector3 = new THREE.Vector3(((this.width * 0.5) - 0.03), (-(this.height * 0.5) + 0.03), -0.5);
    let dynamicRotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'XYZ');

    this._menuFront = {
      visible: false,
      position: dynamicOffeset,
      rotation: dynamicRotation,
      mesh: null
    };

    this._plane.position.set(this._menuFront.position.x, this._menuFront.position.y, this._menuFront.position.z);
    this._plane.setRotationFromEuler(this._menuFront.rotation);
    this._plane.visible = this._menuFront.visible;


    // Add panel to pool
    let poolName: string = 'menu-color-' + this._randomID;
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

  private _addToPoolStatic(): void {
    let staticOffeset: THREE.Vector3 = domStringToVector(this.offset);
    let tempVector: THREE.Vector3 = domStringToVector(this.rotation);
    let staticRotation: THREE.Euler = new THREE.Euler(THREE.MathUtils.degToRad(tempVector.x), THREE.MathUtils.degToRad(tempVector.y), THREE.MathUtils.degToRad(tempVector.z), 'XYZ');

    this._menuFront = {
      visible: true,
      position: staticOffeset,
      rotation: staticRotation,
      mesh: null
    };

    this._plane.position.set(this._menuFront.position.x, this._menuFront.position.y, this._menuFront.position.z);
    this._plane.setRotationFromEuler(this._menuFront.rotation);
    this._plane.visible = this._menuFront.visible;

    // Add panel to pool - set in stage as static object
    let poolName: string = 'menu-color-' + this._randomID;
    let poolAddition: Pool = {
      name: poolName,
      type: 'ui-static',
      objectID: this._plane.uuid,
      isGrouped: true,
      groupID: this.uigroup,
      uiID: this.uiid,
      interactWithHand: 'right',
      latchToController: '',
      priority: 10
    };
    checkAndAddToGroup(this._scene, poolAddition, this._plane);
  }

  private _uiEvents(eventName: string, value: textureOption, from: string, uuid: string): void {
    if (this._uiEventLast === false && eventName === 'select') {
      // Start event
      this._uiEventLast = true;

      let payload: any = {                    // TODO - define payload interface
        action: 'textureUpdate',
        value: {
          placement: (this.static) ? 'static' : 'dynamic',
          index: value.index,
          thumbnail: value.thumbnail,
          thumbnailID: value.thumbnailID,
          texture: value.texture,
          textureID: value.textureID
        },
        uuid: uuid
      };

      let submitObject: uiObjectEvent = {
        from: this.uiid,
        to: from,
        toGroup: this.uigroup,
        action: 'textureUpdate',
        type: 'json',
        payload: JSON.stringify(payload)
      };
      this.uiObjectBusEvent.emit(submitObject);
    }

    if (this._uiEventLast === true && eventName === '') {
      // Stop event
      this._uiEventLast = false;
    }
  }

  private _buttonsActive(x: number, y: number, hand: string, options: objectOptionsJSON): void {
    let textures: textureOption[] = options.textures;

    if (textures.length > 0) {
      for (let i = 0; i < textures.length; i++) {
        uiButtonImage(
          this._canvasContext,                            // ctx
          x, y, this._intersectData[hand].state,          // mouseX, mouseY, mouseState
          ((0.05 + ((this.height - 0.05) * i)) * this._resMultiplier),    // x
          (0.05 * this._resMultiplier),                   // y
          ((this.height - 0.1) * this._resMultiplier),    // size
          textures[i],                                    // texture
          () => { this._uiEvents(this._intersectData[hand].state, textures[i], options.from, this._originObjectID) }      // callback
        );
      }
    }
  }

  private _buttonsPassive(x: number, y: number, options: objectOptionsJSON): void {
    let textures: textureOption[] = options.textures;

    if (textures.length > 0) {
      for (let i = 0; i < textures.length; i++) {
        uiButtonImage(
          this._canvasContext,                            // ctx
          x, y, '',                                       // mouseX, mouseY, mouseState
          ((0.05 + ((this.height - 0.05) * i)) * this._resMultiplier),    // x
          (0.05 * this._resMultiplier),                   // y
          ((this.height - 0.1) * this._resMultiplier),    // size
          textures[i],                                    // texture
          () => { }                                       // callback
        );
      }
    }
  }

  // -----------------

  private _getThumbnails(): void {
    // Collect image binary data
    for (let i = 0; i < this._optionTextures.textures.length; i++) {
      const thumbLoader: THREE.ImageLoader = new THREE.ImageLoader();
      thumbLoader.load(
        this._optionTextures.textures[i].thumbnail,
        (image) => this._loadImage(image, i),
        () => this._progressImage(),
        () => this._errorImage(this._optionTextures.textures[i].thumbnail)
      );
    }
  }

  private _loadImage(image: any, index: number): void {
    this._optionTextures.textures[index].thumbnailContent = image;
  }

  private _progressImage(): void { }

  private _errorImage(path: string): void {
    console.error('Image failed to load: ', path);
  }

}
