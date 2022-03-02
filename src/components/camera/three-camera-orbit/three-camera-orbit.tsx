import { Component, Listen } from '@stencil/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { loadComplete } from '@_interface/Loadtracker';

// https://threejs.org/docs/index.html#examples/en/controls/OrbitControls
// <three-camera-orbit></three-camera-orbit>

@Component({
  tag: 'three-camera-orbit',
  shadow: false,
})
export class ThreeCameraOrbit {
  /** Listen to scene load complete event  */
  @Listen('loadComplete', {
    target: 'body',
    capture: false,
    passive: true
  })
  loadCompleteHandler(event: CustomEvent<loadComplete>) {
    this._addControls();
  }

  // -----------------

  private _scene: Scene;
  private _orbitControls: OrbitControls;

  componentWillLoad() {
    this._scene = Scene.getInstance();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _addControls(): void {
    this._orbitControls = new OrbitControls(this._scene.camera, this._scene.render.domElement);
    this._orbitControls.minDistance = 1;
    this._orbitControls.maxDistance = 5;
    this._orbitControls.minPolarAngle = 0;
    this._orbitControls.maxPolarAngle = THREE.MathUtils.degToRad(100);
    this._orbitControls.target.set(0, 0.8, 0);
    this._orbitControls.update();
  }
}
