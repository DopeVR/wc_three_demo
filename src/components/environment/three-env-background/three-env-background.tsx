import { Component, Prop, Watch } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// <three-env-background color="#000000"></three-env-background>

@Component({
  tag: 'three-env-background',
  shadow: false,
})
export class ThreeEnvBackground {
  /** Background color at infinity */
  @Prop({ mutable: true }) color: string = '#FF0000';

  @Watch('color')
  colorUpdate(newValue) {
    this._updateColor(newValue);
  }

  // -----------------

  private _scene: Scene;
  private _envBackgroundColor: THREE.Color;

  constructor() { }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._updateColor(this.color);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _updateColor(color: string): void {
    this._envBackgroundColor = null;
    this._envBackgroundColor = new THREE.Color(color);
    this._scene.scene.background = this._envBackgroundColor;
  }
}
