import { Component, Prop, Watch } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { makeRandomString } from '@_utils/uuid';
import IntersectTools from '@_utils/3d/intersectTools';

// <three-hud dom-id="canvasbox" visible hires></three-hud>

@Component({
  tag: 'three-hud',
  shadow: false,
})
export class ThreeHud {
  /** Location on page where canvas is placed before rendered as material */
  @Prop({ mutable: false }) domId: string = '';

  /** Switch to higher density of pixels of canvas material */
  @Prop({ mutable: false }) hires: boolean = false;

  /** HUD is only visible in VR */
  @Prop({ mutable: true, reflect: true }) armed: boolean = false;
  
  @Watch('armed')
  activateController(newValue) {
    if (newValue) {
      this._plane.visible = newValue;
    } else {
      this._plane.visible = newValue;
    }
  }

  // -----------------

  private _scene: Scene;
  private _plane: THREE.Mesh;
  private _resMultiplier: number;
  private _randomID: string;

  private _canvasBox: HTMLElement;
  private _canvasElement: HTMLCanvasElement;
  private _canvasTexture: THREE.CanvasTexture;
  private _canvasMaterial: THREE.MeshBasicMaterial;
  private _canvasContext: CanvasRenderingContext2D;

  private _intersectHelper: IntersectTools;

  private _width: number;
  private _height: number;

  constructor() {
    this._width = 0.2;
    this._height = 0.04;

    this._canvasBox = null;
    this._canvasContext = null;
    this._intersectHelper = new IntersectTools();

    this._resMultiplier = (this.hires) ? 2000 : 1000;
    this._randomID = makeRandomString(6);
  }

  componentWillLoad() {
    this._createUIplane();

    this._scene = Scene.getInstance();
    this._poolAddition();

    this._canvasContext = this._canvasElement.getContext('2d');
    this._redraw();
  }

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
    this._canvasElement.setAttribute('width', (this._width * this._resMultiplier).toString());
    this._canvasElement.setAttribute('height', (this._height * this._resMultiplier).toString());

    // canvas texture
    this._canvasTexture = new THREE.CanvasTexture(this._canvasElement);
    this._canvasTexture.needsUpdate = true;

    // New plane for canvas
    const plGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(this._width, this._height, 1);
    this._canvasMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      map: this._canvasTexture
    });

    // UI plane
    this._plane = new THREE.Mesh(plGeometry, this._canvasMaterial);
    this._plane.name = 'hudMesh';
    this._plane.position.set(0.01, 0.08, -0.2);
    this._plane.rotation.set(THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(0), THREE.MathUtils.degToRad(0), 'XYZ');
    this._plane.visible = this.armed;
  }

  private _poolAddition(): THREE.Mesh {
    let poolAddition: Pool = {
      name: 'hud',
      type: 'persona',
      objectID: this._plane.uuid,
      isGrouped: true,
      interactWithHand: '',
      latchToController: '',
      priority: 10
    };
    checkAndAddToGroup(this._scene, poolAddition, this._plane);
  }

  // -----------------

  private _redraw(): void {
    // This does NOT update with FPS. On demand only!!!
    this._intersectHelper.menuBackground(this._canvasContext, this._width, this._height, this._resMultiplier);
    this._canvasTexture.needsUpdate = true;
  }
}
