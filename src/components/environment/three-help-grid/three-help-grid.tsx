import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// https://threejs.org/docs/index.html#api/en/helpers/GridHelper
// <three-help-grid size="20" divisions="20"></three-help-grid>

@Component({
  tag: 'three-help-grid',
  shadow: false,
})
export class ThreeHelpGrid {
  /** Size of the XZ grid in meters */
  @Prop({ mutable: false }) size: number = 100;

  /** number of grid divisions */
  @Prop({ mutable: false }) divisions: number = 10;

  /** indicate whether this object is visible or not */
  @Prop({ mutable: false }) visible: boolean = true;

  // -----------------

  private _scene: Scene;
  private _gridHelper: THREE.GridHelper;

  constructor() {
    this._gridHelper = new THREE.GridHelper(this.size, this.divisions);
    this._gridHelper.visible = this.visible;
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._gridHelper);
  }

  render() { }     // <<< cannot be removed
}
