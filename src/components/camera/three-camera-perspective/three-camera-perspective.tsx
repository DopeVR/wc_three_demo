import { Component, Prop, Watch, Listen } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { CameraNewLocation } from '@_interface/Camera';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { uiObjectEvent } from '@_interface/Intersect';
import { floorOption } from '@_interface/JSONData';
import { domStringToVector } from '@_utils/3d/helper';

// <three-camera-perspective dom-id=""></three-camera-perspective>

@Component({
  tag: 'three-camera-perspective',
  shadow: false,
})
export class ThreeCameraPerspective {
  /** DOM id of location where threeJS is rendering, set by scene-vr  */
  @Prop({ mutable: false }) domId: string = '';

  /** Camera mode single vs. stereoscopic */
  @Prop({ mutable: true, reflect: true }) armed: boolean = false;

  @Watch('armed')
  activateController(newValue) {
    if (newValue) {
      this._updateLocation(this._floorLanding);
    } else {
      // TODO - Send User to 0,0,0????
    }
  }

  /** Listen to requests for location/rotation updates */
  @Listen('cameraUpdate', {
    target: 'body',
    capture: false,
    passive: true
  })
  cameraUpdateHandler(event: CustomEvent<CameraNewLocation>) {
    if (event.detail.onEvent === 'start' && event.detail.location !== null) {
      this._cameraGroup = this._scene.groups['persona'];
      if (event.detail.location) this._cameraGroup.position.set(event.detail.location.x, event.detail.location.y, event.detail.location.z);
      if (event.detail.rotation) this._cameraGroup.rotation.set(event.detail.rotation.x, event.detail.rotation.y, event.detail.rotation.z, event.detail.rotation.order);
    }
  }

  /** Listen to calls coming from other components */
  @Listen('uiObjectBus', {
    target: 'body',
    capture: false,
    passive: true
  })
  uiEventsHandler(event: CustomEvent<uiObjectEvent>) {
    if (event.detail.action === 'floorGroups') {
      let parsedPayload: floorOption[] = JSON.parse(event.detail.payload) as floorOption[];
      this._findDefault (parsedPayload);
    }
  }

  // -----------------

  private _canvas: Element;
  private _scene: Scene;
  private _locCamera: THREE.PerspectiveCamera;
  private _cameraGroup: THREE.Group;
  private _floorLanding: floorOption;
  private _floorGroups: floorOption[];

  constructor() {
    this._scene = Scene.getInstance();
    this._canvas = null;
    this._cameraGroup = null;
    this._floorLanding = null;
    this._floorGroups = [];
  }

  componentWillLoad() {
    // DOM element -> render target
    this._canvas = document.getElementById(this.domId);
    const domWidth: number = this._canvas.clientWidth;
    const domHeight: number = this._canvas.clientHeight;

    // Camera
    this._locCamera = new THREE.PerspectiveCamera(45, domWidth / domHeight, 0.1, 100);
    this._locCamera.name = 'perspective';
    this._locCamera.position.set(0, 1.8, 3);
    this._locCamera.aspect = domWidth / domHeight;

    this._scene.camera = this._locCamera;
    this._scene.camera.updateProjectionMatrix();
  }

  componentDidLoad() {
    // Wrap camera and controllers into group
    let poolAddition: Pool = {
      name: 'camera',
      type: 'persona',
      objectID: this._locCamera.uuid,
      isGrouped: true,
      interactWithHand: '',
      latchToController: '',
      priority: 10
    };
    checkAndAddToGroup(this._scene, poolAddition, this._locCamera);
  }

  render() { }     // <<< cannot be removed

  
  // -----------------

  private _findDefault (data: floorOption[]): void {
    this._floorGroups = data;

    if (data.length > 0) this._floorLanding = data[0];
    for (let i = 0; i < this._floorGroups.length; i++) {
      if (this._floorGroups[i].default) {
        this._floorLanding = this._floorGroups[i];
      }
    }
  }

  private _updateLocation (data: floorOption): void {
    if (this._cameraGroup === null) this._cameraGroup = this._scene.groups['persona'];

    let locOffset = domStringToVector(data.offset);
    this._cameraGroup.position.set(locOffset.x, locOffset.y, locOffset.z);

    let locRotation = domStringToVector(data.rotation);
    this._cameraGroup.rotation.set(locRotation.x, locRotation.y, locRotation.z, 'XYZ');
  }
}
