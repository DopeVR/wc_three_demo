import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { domStringToVector } from '@_utils/3d/helper';

// https://threejs.org/docs/index.html#api/en/lights/HemisphereLight
// https://threejs.org/docs/index.html#api/en/helpers/HemisphereLightHelper

// <three-light-hemi sky-color="#dddddd" ground-color="#444444" intensity="0.3" helper></three-light-hemi>

@Component({
  tag: 'three-light-hemi',
  shadow: false,
})
export class ThreeLightHemi {
  /** Color above horizon */
  @Prop({ mutable: false }) skyColor: string = '#ffffbb';

  /** Color below horizon */
  @Prop({ mutable: false }) groundColor: string = '#080820';

  /** Light intensity multiplier */
  @Prop({ mutable: false }) intensity: number = 1;

  /** Show helper object to help locate the light */
  @Prop({ mutable: false }) helper: boolean = false;

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '';               // '0,0,0' (0, 0.1, 0);

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '';             // '0,0,0'

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;

  private _lightHemi: THREE.HemisphereLight;
  private _lightHemiHelper: THREE.HemisphereLightHelper;

  componentWillLoad() {
    this._scene = Scene.getInstance();

    this._offset = (this.offset === '') ? null : domStringToVector(this.offset);
    this._rotation = (this.rotation === '') ? null : domStringToVector(this.rotation);

    this._light();
    this._helper();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _light(): void {
    this._lightHemi = new THREE.HemisphereLight(this.skyColor, this.groundColor, this.intensity);
    if (this._offset) this._lightHemi.position.set(this._offset.x, this._offset.y, this._offset.z);
    if (this._rotation) this._lightHemi.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
    this._scene.scene.add(this._lightHemi);
  }

  private _helper(): THREE.HemisphereLightHelper {
    if (this.helper) {
      this._lightHemiHelper = new THREE.HemisphereLightHelper(this._lightHemi, 3);
      this._scene.scene.add(this._lightHemiHelper);
    }
  }
}
