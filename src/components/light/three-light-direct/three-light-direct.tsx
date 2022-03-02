import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { domStringToVector } from '@_utils/3d/helper';

// https://threejs.org/docs/index.html#api/en/lights/DirectionalLight
// https://threejs.org/docs/index.html#api/en/helpers/DirectionalLightHelper

// <three-light-direct color="#dddddd" intensity="1" helper></three-light-direct>

@Component({
  tag: 'three-light-direct',
  shadow: false,
})
export class ThreeLightDirect {
  /** Light color */
  @Prop({ mutable: false }) color: string = '#FF0000';

  /** Light intensity multiplier */
  @Prop({ mutable: false }) intensity: number = 1;

  /** Show helper object to help locate the light */
  @Prop({ mutable: false }) helper: boolean = false;

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '';               // '0,0,0' (3, 10, 10);

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '';             // '0,0,0'

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;

  private _lightDirect: THREE.DirectionalLight;
  private _lightDirectHelper: THREE.DirectionalLightHelper;

  componentWillLoad() {
    this._scene = Scene.getInstance();

    this._offset = (this.offset === '') ? null : domStringToVector(this.offset);
    this._rotation = (this.rotation === '') ? null : domStringToVector(this.rotation);

    this._light();
    this._helper();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _light(): THREE.DirectionalLight {
    this._lightDirect = new THREE.DirectionalLight(this.color, this.intensity);
    if (this._offset) this._lightDirect.position.set(this._offset.x, this._offset.y, this._offset.z);
    if (this._rotation) this._lightDirect.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
    this._scene.scene.add(this._lightDirect);
  }

  private _helper(): THREE.DirectionalLightHelper {
    if (this.helper) {
      this._lightDirectHelper = new THREE.DirectionalLightHelper(this._lightDirect, 5);
      this._scene.scene.add(this._lightDirectHelper);
    }
  }
}
