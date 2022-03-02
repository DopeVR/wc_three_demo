import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { domStringToVector } from '@_utils/3d/helper';

// https://threejs.org/docs/index.html#api/en/lights/SpotLight
// https://threejs.org/docs/index.html#api/en/helpers/SpotLightHelper

// <three-light-spot color="#0000FF" intensity="1" helper></three-light-spot>

@Component({
  tag: 'three-light-spot',
  shadow: false,
})
export class ThreeLightSpot {
  /** Light color */
  @Prop({ mutable: false }) color: string = '#FF0000';

  /** Light intensity multiplier */
  @Prop({ mutable: false }) intensity: number = 1;

  /** Maximum angle of light dispersion from its direction */
  @Prop({ mutable: false }) angle: number = 30;

  /** Show helper object to help locate the light */
  @Prop({ mutable: false }) helper: boolean = false;

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '';               // '0,0,0'  (-2, 10, -2);

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '';             // '0,0,0'

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;

  private _lightSpot: THREE.SpotLight;
  private _lightSpotHelper: THREE.SpotLightHelper;
  
  private _lightDistance: number;
  private _lightAngle: number
  private _lightPenumbra: number
  private _lightDecay: number

  constructor () {
    this._lightDistance = 0;
    this._lightAngle = 0;
    this._lightPenumbra = 0.3;
    this._lightDecay = 0;
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();

    this._offset = (this.offset === '') ? null : domStringToVector(this.offset);
    this._rotation = (this.rotation === '') ? null : domStringToVector(this.rotation);

    this._lightAngle = THREE.MathUtils.degToRad(this.angle);

    this._light();
    this._helper();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _light(): void {
    this._lightSpot = new THREE.SpotLight(this.color, this.intensity, this._lightDistance, this._lightAngle, this._lightPenumbra, this._lightDecay);
    if (this._offset) this._lightSpot.position.set(this._offset.x, this._offset.y, this._offset.z);
    if (this._rotation) this._lightSpot.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
    this._scene.scene.add(this._lightSpot);
  }

  private _helper(): void {
    if (this.helper) {
      this._lightSpotHelper = new THREE.SpotLightHelper(this._lightSpot);
      this._scene.scene.add(this._lightSpotHelper);
    }
  }
}
