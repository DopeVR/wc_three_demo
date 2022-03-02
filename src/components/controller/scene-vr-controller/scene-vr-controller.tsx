import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { Component, Prop, Watch, Event, EventEmitter, State } from '@stencil/core';

import { ControllerEvent } from '@_interface/Controller';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import Scene from '@_utils/3d/scene';

// Two components are required for full experience
// <scene-vr-controller controller-id="0" controller-name="right" armed="false"></scene-vr-controller>    // Right hand
// <scene-vr-controller controller-id="1" controller-name="left" armed="false"></scene-vr-controller>     // Left hand

@Component({
  tag: 'scene-vr-controller',
  shadow: false,
})
export class SceneVrController {
  /** numeric ID that is assigned by headset */
  @Prop({ mutable: false }) controllerId: number = null;

  /** verbal identification assigned by user */
  @Prop({ mutable: false }) controllerName: string = '';

  /** controller is only active in VR */
  @Prop({ mutable: true, reflect: true }) armed: boolean = false;
  
  @Watch('armed')
  activateController(newValue) {
    if (newValue) {
      this._addControllers();
    } else {
      this._removeControllers();
    }
  }

  /** Transmit actions performed by user */
  @Event({
    eventName: 'controllerAction',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) controllerActionEvent: EventEmitter<ControllerEvent>;

  @State() xrControllerObject: ControllerEvent;

  // -----------------

  private _scene: Scene;
  private _xrController: any;
  private _xrControllerGrip: any;

  private _showLines: boolean;
  private _line: THREE.Line;
  private _lineScale: Number;
  private _lineMaterial: THREE.LineBasicMaterial;

  constructor() {
    this._showLines = true;
    this._line = null;
    this._lineScale = 0.1;
    if (this._showLines) {
      this._lineMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff
      });
    }
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();

    this._xrController = null;
    this._xrControllerGrip = null;
    this.xrControllerObject = {
      index: this.controllerId,
      hand: this.controllerName,
      button: '',
      action: ''
    };
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _addControllers(): void {
    this._xrController = this._scene.render.xr.getController(this.controllerId);
    this._xrController.name = 'controller-' + this.controllerId;
    this._xrController.addEventListener('selectstart', () => this._onSelectStart());
    this._xrController.addEventListener('selectend', () => this._onSelectEnd());
    this._xrController.addEventListener('squeezestart', () => this._onSqueezeStart());
    this._xrController.addEventListener('squeezeend', () => this._onSqueezeEnd());
    this._scene.scene.add(this._xrController);

    const controllerModelFactory: any = new XRControllerModelFactory();
    this._xrControllerGrip = this._scene.render.xr.getControllerGrip(this.controllerId);
    this._xrControllerGrip.name = 'controllerGrip-' + this.controllerId;
    this._xrControllerGrip.add(controllerModelFactory.createControllerModel(this._xrControllerGrip));
    this._scene.scene.add(this._xrControllerGrip);

    // Wrap camera and controllers into group  -> These objects require special treatment upon entering to VR
    let controllerAddition: Pool = {
      name: 'controller-' + this.controllerId,
      type: 'persona',
      objectID: this._xrController.uuid,
      isGrouped: true,
      interactWithHand: '',
      latchToController: '',
      priority: 100
    };
    checkAndAddToGroup(this._scene, controllerAddition, this._xrController);

    let controllerGripAddition: Pool = {
      name: 'controllerGrip-' + this.controllerId,
      type: 'persona',
      objectID: this._xrControllerGrip.uuid,
      isGrouped: true,
      interactWithHand: '',
      latchToController: '',
      priority: 100
    };
    checkAndAddToGroup(this._scene, controllerGripAddition, this._xrControllerGrip);

    // Hand sticks
    const points: THREE.Vector3[] = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 0, -1));

    if (this._showLines) {
      const geometry: any = new THREE.BufferGeometry().setFromPoints(points);
      this._line = new THREE.Line(geometry, this._lineMaterial);
      this._line.name = 'line';
      this._line.scale.z = this._lineScale;
      this._xrController.add(this._line);
    }
  }

  private _removeControllers(): void {
    this._scene.scene.remove(this._xrController);
    this._scene.scene.remove(this._xrControllerGrip);
  }

  private _onSelectStart(): void {
    this.xrControllerObject.button = 'select';
    this.xrControllerObject.action = 'start';
    this.controllerActionEvent.emit(this.xrControllerObject);

    if (this._showLines && this._lineScale < 1) {
      this._lineScale = 2;
      this._line.scale.z = this._lineScale;
    }
  }
  private _onSelectEnd(): void {
    this.xrControllerObject.button = 'select';
    this.xrControllerObject.action = 'end';
    this.controllerActionEvent.emit(this.xrControllerObject);

    if (this._showLines && this._lineScale > 1) {
      this._lineScale = 0.1;
      this._line.scale.z = this._lineScale;
    }
  }

  private _onSqueezeStart(): void {
    this.xrControllerObject.button = 'squeeze';
    this.xrControllerObject.action = 'start';
    this.controllerActionEvent.emit(this.xrControllerObject);

    if (this._showLines) {
      this._lineMaterial.color.set(0xffffff);
    }
  }
  private _onSqueezeEnd(): void {
    this.xrControllerObject.button = 'squeeze';
    this.xrControllerObject.action = 'end';
    this.controllerActionEvent.emit(this.xrControllerObject);

    if (this._showLines) {
      this._lineMaterial.color.set(0x0000ff);
    }
  }
}
