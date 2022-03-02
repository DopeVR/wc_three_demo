import { Component, Prop, Watch } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// https://threejs.org/docs/index.html#api/en/scenes/Fog
// <three-env-fog color="#000000" near="20" far="100"></three-env-fog>

@Component({
  tag: 'three-env-fog',
  shadow: false,
})
export class ThreeEnvFog {
  /** Fog color at infinity */
  @Prop({ mutable: true }) color: string = '#000000';

  /** Fog density in proximity from camera - start */
  @Prop({ mutable: true }) near: number = 20;

  /** Fog density in proximity from camera - full */
  @Prop({ mutable: true }) far: number = 100;

  @Watch('color')
  colorUpdate(newValue) {
    this._updateColor(newValue, this.near, this.far);
  }

  @Watch('near')
  nearUpdate(newValue) {
    this._updateColor(this.color, newValue, this.far);
  }

  @Watch('far')
  farUpdate(newValue) {
    this._updateColor(this.color, this.near, newValue);
  }

  // -----------------

  private _scene: Scene;
  private _envFog: THREE.Fog;

  constructor() { }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._updateColor(this.color, this.near, this.far);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _updateColor(color: string, near: number, far: number): void {
    this._envFog = null;
    this._envFog = new THREE.Fog(color, near, far);
    this._scene.scene.fog = this._envFog;
  }
}
