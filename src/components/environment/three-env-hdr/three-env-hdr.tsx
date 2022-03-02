import { Component, Prop, Event, Watch, EventEmitter } from '@stencil/core';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import Scene from '@_utils/3d/scene';
import { loadTracker } from '@_interface/Loadtracker';
import { makeRandomString } from '@_utils/uuid';

// <three-env-hdr path="https://envirovr.com/vr_assets/equirectangular/" name="venice_sunset_1k.hdr"></three-env-hdr>

@Component({
  tag: 'three-env-hdr',
  shadow: false,
})
export class ThreeEnvHdr {
  /** path to file location */
  @Prop({ mutable: true }) path: string = '';

  /** file name */
  @Prop({ mutable: true }) name: string = '';

  /** amount of light emitted by HDR texture 0 - 1(normal) - 2 */
  @Prop({ mutable: false }) exposure: number = 1;

  @Watch('path')
  pathController(newValue) {
    this._initiateLoad(this.path, this.name);
  }

  @Watch('name')
  nameController(newValue) {
    this._initiateLoad(this.path, this.name);
  }

  /** transmit load status of this element */
  @Event({
    eventName: 'loadTracker',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) loadTrackerEvent: EventEmitter<loadTracker>;

  // -----------------

  private _scene: Scene;
  private _randomID: string;

  constructor() {
    this._randomID = makeRandomString(6);
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._initiateLoad(this.path, this.name);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _initiateLoad(path: string, name: string): void {
    if (name.endsWith('.hdr')) {
      this._loadHDRfile(path, name);
    } else if (name.endsWith('.exr')) {
      this._loadEXRfile(path, name);
    } else {
      console.error('File needs to be HDR or EXR');
    }
  }

  private _loadHDRfile(path: string, name: string): void {
    this._loadTrackerFunction('start');

    // Load - HDR
    const loader: RGBELoader = new RGBELoader();
    loader.setPath(path);
    loader.load(
      name,
      (texture) => this._pullHDR(texture),
      (xhr) => this._pullLoading(xhr),
      (error) => this._pullError(error)
    );
  }

  private _loadEXRfile(path: string, name: string): void {
    this._loadTrackerFunction('start');

    // Load - EXR
    const loader: EXRLoader = new EXRLoader();
    loader.setPath(path);
    loader.setDataType(THREE.UnsignedByteType)
    loader.load(
      name,
      (texture) => this._pullHDR(texture),
      (xhr) => this._pullLoading(xhr),
      (error) => this._pullError(error)
    );
  }

  // -----------------

  private _pullHDR(texture: THREE.Texture): void {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this._scene.scene.background = texture;
    this._scene.scene.environment = texture;

    this._scene.render.toneMappingExposure = this.exposure;

    this._loadTrackerFunction('success');
  }

  private _pullLoading(xhr: ProgressEvent): void {
    // console.log('_pullLoading - xhr', xhr);
  }

  private _pullError(error: ProgressEvent): void {
    this._loadTrackerFunction('fail');
  }

  private _loadTrackerFunction(state: string): void {
    // Load tracking
    let loadFileData: loadTracker = {
      id: this._randomID,
      file: this.path + this.name,
      load: state,
      time: Date.now()
    }
    this.loadTrackerEvent.emit(loadFileData);
  }
}
