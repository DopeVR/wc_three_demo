import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// !!!!! DELETE THIS ONE !!!!!
// <three-env-ground color="#777777" size ="1000"></three-env-ground>

@Component({
  tag: 'three-env-ground',
  shadow: false,
})
export class ThreeEnvGround {
  /** Large plane color */
  @Prop({ mutable: false }) color: string = '#FF0000';

  /** Size of plane in meters */
  @Prop({ mutable: false }) size: number = 1000;

  // -----------------

  private _scene: Scene;
  private _envPlane: THREE.PlaneBufferGeometry;
  private _envPlaneMaterial: THREE.MeshPhongMaterial;
  private _envGround: THREE.Mesh;

  constructor() {
    this._envPlane = new THREE.PlaneBufferGeometry(this.size, this.size);
    this._envPlaneMaterial = new THREE.MeshPhongMaterial({
      color: this.color,
      depthWrite: false
    });

    this._envGround = new THREE.Mesh(this._envPlane, this._envPlaneMaterial);
    this._envGround.rotation.x = - Math.PI / 2;
    this._envGround.receiveShadow = true;
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._envGround);
  }

  render() { }     // <<< cannot be removed
}
