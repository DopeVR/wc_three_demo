import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';

// <three-camera-ortho dom-id=""></three-camera-ortho>

@Component({
  tag: 'three-camera-ortho',
  shadow: false,
})
export class ThreeCameraOrtho {
  /** DOM id of location where threeJS is rendering, set by scene-vr  */
  @Prop({ mutable: false }) domId: string = '';

  // -----------------

  private _canvas: Element;
  private _scene: Scene;
  private _locCamera: THREE.OrthographicCamera;
  private _frustumSize: number;

  constructor() {
    this._scene = Scene.getInstance();
    this._canvas = null;
    this._frustumSize = 10;
  }

  componentWillLoad() {
    // DOM element -> render target
    this._canvas = document.getElementById(this.domId);
    const domWidth: number = this._canvas.clientWidth;
    const domHeight: number = this._canvas.clientHeight;
    const aspect: number = domWidth / domHeight;

    // Camera
    this._locCamera = new THREE.OrthographicCamera(this._frustumSize * aspect / - 2, this._frustumSize * aspect / 2, this._frustumSize / 2, this._frustumSize / - 2, -1000, 1000);
    this._locCamera.position.set(0, 1.8, 3);
    this._scene.camera = this._locCamera;
    this._scene.camera.updateProjectionMatrix();
  }

  render() { }     // <<< cannot be removed
}
