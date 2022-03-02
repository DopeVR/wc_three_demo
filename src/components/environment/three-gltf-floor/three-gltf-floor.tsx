import { Component, Prop, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';
import { Pool } from '@_interface/Pool';
import { loadTracker } from '@_interface/Loadtracker';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { makeRandomString } from '@_utils/uuid';
import Scene from '@_utils/3d/scene';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { domStringToVector, vectorToDomString, eulerToDomString } from '@_utils/3d/helper';

// <three-gltf-floor path="/vr_assets/3d/" name="floor.glb" offset="0,0,0" rotation="0,0,0" visible></three-gltf-floor>

@Component({
  tag: 'three-gltf-floor',
  shadow: false,
})
export class ThreeGltfFloor {
  /** path to file location */
  @Prop({ mutable: false }) path: string = '';

  /** file name */
  @Prop({ mutable: false }) name: string = '';

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: true, reflect: true }) offset: string = '0,0,0';

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: true, reflect: true }) rotation: string = '0,0,0';

  /** indicate whether this object is visible or not */
  @Prop({ mutable: false }) visible: boolean = false;

  /** indicate whether this floor is the first one user will land upon entry */
  @Prop({ mutable: false }) default: boolean = false;      // This prop is only used to be collected by parent group

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true }) uiid: string = '';

  /** Shift place where user lands after long distance teleport */
  @Prop({ mutable: false }) shiftOrigin: string = '';     // This prop is only used to be collected by parent group

  /** link to object name within imported file - This prop is only used to be collected by parent group */
  @Prop({ mutable: false }) link: string = '';

  /** thumbnail location - This prop is only used to be collected by parent group */
  @Prop({ mutable: false }) thumbnail: string = '';

  /** transmit load status of this element */
  @Event({
    eventName: 'loadTracker',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) loadTrackerEvent: EventEmitter<loadTracker>;

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;
  private _randomID: string;

  constructor() {
    this._offset = domStringToVector(this.offset);
    this._rotation = domStringToVector(this.rotation);
    this._randomID = makeRandomString(6);
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    if (this.path !== '' && this.name !== '') this._loadGLTFfile();
  }

  render() { }     // <<< cannot be removed

  // -----------------

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

  private _loadGLTFfile(): void {
    this._loadTrackerFunction('start');

    // Load
    const loader: GLTFLoader = new GLTFLoader();
    loader.setPath(this.path);
    loader.load(
      this.name,
      (gltf) => this._pullMesh(gltf),
      (xhr) => this._pullLoading(xhr),
      (error) => this._pullError(error)
    );
  }

  private _pullLoading(xhr: any): void { }

  private _pullError(error: any): void {
    this._loadTrackerFunction('fail');
  }

  private _pullMesh(gltf: any): void {
    // use of RoughnessMipmapper is optional
    const roughnessMipmapper: RoughnessMipmapper = new RoughnessMipmapper(this._scene.render);

    let GLTFscene: any = gltf.scene;
    for (let child of GLTFscene.children) {
      let model: THREE.Mesh = null;
      if (child.isMesh) {
        // Extract mesh objects from GLTF scene and add them as floor elements
        roughnessMipmapper.generateMipmaps(child.material);

        model = child.clone(true);
        this._objectLogistics(model, this._offset, this._rotation);
      }
    }
    roughnessMipmapper.dispose();

    this._loadTrackerFunction('success');
  }

  private _objectLogistics(model: THREE.Mesh, offset: THREE.Vector3, rotation: THREE.Vector3): void {
    let randomID = 'floor-' + model.name + '-' + makeRandomString(6);
    model.name = randomID;

    let sameVectors = offset.equals(model.position);
    let sameEulers = rotation.equals(model.rotation);

    model.visible = this.visible;

    model.position.set(
      (model.position.x + offset.x),
      (model.position.y + offset.y),
      (model.position.z + offset.z)
    );
    if (!sameVectors) this.offset = vectorToDomString(model.position.x, model.position.y, model.position.z);

    model.rotation.set(
      (model.rotation.x + THREE.MathUtils.degToRad(rotation.x)),
      (model.rotation.y + THREE.MathUtils.degToRad(rotation.y)),
      (model.rotation.z + THREE.MathUtils.degToRad(rotation.z)),
      'XYZ'
    );
    if (!sameEulers) this.rotation = eulerToDomString(model.rotation.x, model.rotation.y, model.rotation.z);

    this._scene.scene.add(model);

    let poolAddition: Pool = {
      name: randomID,
      type: 'floor',
      objectID: model.uuid,
      isGrouped: true,
      groupID: this.uigroup,
      uiID: this.uiid,
      interactWithHand: 'right',
      latchToController: '',
      priority: 100
    };
    checkAndAddToGroup(this._scene, poolAddition, model);
  }
}
