import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// Static object
// <three-mesh-plane color="#BBBBBB" size="10"></three-mesh-plane>

@Component({
  tag: 'three-mesh-plane',
  shadow: false,
})
export class ThreeMeshPlane {
  /** color of square plane object */
  @Prop({ mutable: false }) color: string = '#444444';

  /** side length in meters */
  @Prop({ mutable: false }) size: number = 100;

  // -----------------

  private _scene: Scene;
  private _planeMesh: THREE.PlaneGeometry;
  private _planeMaterial: THREE.MeshBasicMaterial;
  private _plane: THREE.Mesh;

  constructor() {
    this._planeMesh = new THREE.PlaneGeometry(this.size, this.size, ((this.size / 10).toFixed(0)) + 1);
    this._planeMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      side: THREE.DoubleSide
    });
    this._plane = new THREE.Mesh(this._planeMesh, this._planeMaterial);
    this._plane.position.y = -3;
    this._plane.rotation.x = - Math.PI / 2;
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._plane);
  }

  render() { }     // <<< cannot be removed
}
