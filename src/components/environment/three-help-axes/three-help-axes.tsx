import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// https://threejs.org/docs/index.html#api/en/helpers/AxesHelper
// <three-help-axes size=5></three-help-axes>

@Component({
  tag: 'three-help-axes',
  shadow: false,
})
export class ThreeHelpAxes {
  /** Axes helper size in meters */
  @Prop({ mutable: false }) size: number = 5;

  // -----------------

  private _scene: Scene;
  private _axesHelper: THREE.AxesHelper;

  componentWillLoad() {
    this._axesHelper = new THREE.AxesHelper(this.size);

    this._scene = Scene.getInstance();
    this._scene.scene.add(this._axesHelper);
  }

  render() { }     // <<< cannot be removed
}
