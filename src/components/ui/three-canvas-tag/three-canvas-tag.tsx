import { Component, Prop, Listen } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { ControllerMeshUI } from '@_interface/Controller';
import { uiObjectEvent } from '@_interface/Intersect';
import { roundedRectangle, tagTextInterface, tagText } from '@_utils/2d/shapes';
import { makeRandomString } from '@_utils/uuid';

// <three-canvas-tag dom-id="canvasbox" width="0.8" height="0.2" tag='{"headline":"Flower in Black & White","author":"Ondrej Blazek"}' hires></three-canvas-tag>

@Component({
  tag: 'three-canvas-tag',
  shadow: false,
})
export class ThreeCanvasTag {
  /** Location on page where canvas is placed before rendered as material */
  @Prop({ mutable: false }) domId: string = '';

  /** width in meters */
  @Prop({ mutable: false }) width: number = 0;

  /** height in meters */
  @Prop({ mutable: false }) height: number = 0;

  /** content of the tag in JSON format */
  @Prop({ mutable: false }) tag: string = '';

  /** Switch to higher density of pixels of canvas material */
  @Prop({ mutable: false }) hires: boolean = false;

  /** unique ID of group in which this object resides */
  @Prop({ mutable: false }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: false }) uiid: string = '';

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
        this._menuFront.visible = payloadJSON.value as boolean;
        this._plane[payloadJSON.property] = payloadJSON.value;        // <<<< potentially very dangerous
      }
    }
  }

  // -----------------

  private _scene: Scene;
  private _plane: THREE.Mesh;
  private _resMultiplier: number;
  private _randomID: string;
  private _content: tagTextInterface;

  private _canvasBox: HTMLElement;
  private _canvasElement: HTMLCanvasElement;
  private _canvasTexture: THREE.CanvasTexture;
  private _canvasMaterial: THREE.MeshBasicMaterial;
  private _canvasContext: CanvasRenderingContext2D;

  private _menuFront: ControllerMeshUI;

  constructor() {
    this._canvasBox = null;
    this._canvasContext = null;

    this._resMultiplier = (this.hires) ? 800 : 300;
    this._randomID = makeRandomString(6);

    // Front Menu
    this._menuFront = {
      visible: false,
      position: new THREE.Vector3(((this.width * 0.5) - 0.03), ((this.height * 0.5) - 0.03), -0.5),
      rotation: new THREE.Euler(0, 0, 0, 'XYZ'),
      mesh: null
    };

    this._createUIplane();
  }

  componentWillLoad() {
    this._content = JSON.parse(this.tag) as tagTextInterface;

    this._canvasContext = this._canvasElement.getContext('2d');
    this._canvasContext.clearRect(0, 0, (this.width * this._resMultiplier), (this.height * this._resMultiplier));

    this._roundedRectangle();
    this._tagText(this._content);

    // Add panel to 3D scene
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._plane);

    // Add panel to pool
    let poolName: string = 'menu-tag-' + this._randomID;
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
    this._plane.name = 'ui-menu-tag-' + this._randomID;
    this._plane.position.set(this._menuFront.position.x, this._menuFront.position.y, this._menuFront.position.z);
    this._plane.setRotationFromEuler(this._menuFront.rotation);
    this._plane.visible = this._menuFront.visible;

    this._menuFront.mesh = this._plane;
  }

  private _roundedRectangle(): void {
    roundedRectangle(this._canvasContext, 1, 1, ((this.width * this._resMultiplier) - 1), ((this.height * this._resMultiplier) - 1), (0.02 * this._resMultiplier));
  }

  private _tagText(content: tagTextInterface): void {
    tagText(this._canvasContext, this._resMultiplier, (this.height / 2), content);
  }
}
