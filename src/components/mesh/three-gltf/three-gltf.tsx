import { Component, Prop, Watch, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { makeRandomString } from '@_utils/uuid';
import { Pool } from '@_interface/Pool';
import { uiObjectEvent } from '@_interface/Intersect';
import { loadTracker } from '@_interface/Loadtracker';
import Scene from '@_utils/3d/scene';
import { domStringToVector } from '@_utils/3d/helper';

// Static object
// <three-gltf path="https://wc-three.web.app/vr_assets/3d/cthulhu/" name="scene.gltf" offset="2,0.95,0" rotation="0,-90,0" scale="0.3,0.3,0.3"></three-gltf>
// Mixer code source:  https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_additive_blending.html

@Component({
  tag: 'three-gltf',
  shadow: false,
})
export class ThreeGltf {
  /** path to file location */
  @Prop({ mutable: false }) path: string = '';

  /** file name */
  @Prop({ mutable: false }) name: string = '';

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: true }) offset: string = '';               // '0,0,0'

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: true }) rotation: string = '';             // '0,0,0'

  /** scale multiplier for imported scene */
  @Prop({ mutable: true }) scale: string = '';                // '1,1,1'

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';           // Auto added by parent

  /** unique ID of group in which this object resides */
  @Prop({ mutable: false }) uigroup: string = '';             // Auto added by parent

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: false }) uiid: string = '';                // Auto added by parent

  /** objects that will be designated as active with additional functionality */
  @Prop({ mutable: false }) objects: string = '';             // JSON format

  /** path to thumbnail for UI integration */
  @Prop({ mutable: false }) thumbnail: string = '';           // This parameter is only used to link UI thumbnail for the menu

  /** indicate whether this object is visible or not */
  @Prop({ mutable: true }) visible: boolean = true;

  /** Development tool to gain access to more information */
  @Prop({ mutable: true }) developer: boolean = false;

  @Watch('offset')
  offsetController(newValue) {
    this._offset = (newValue === '') ? null : domStringToVector(newValue);
    if (this._offset && this._model) this._model.position.set(this._offset.x, this._offset.y, this._offset.z);
  }

  @Watch('rotation')
  rotationController(newValue) {
    this._rotation = (newValue === '') ? null : domStringToVector(newValue);
    if (this._rotation && this._model) this._model.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
  }

  @Watch('scale')
  scaleController(newValue) {
    this._scale = (newValue === '') ? null : domStringToVector(newValue);
    if (this._scale && this._model) this._model.scale.set(this._scale.x, this._scale.y, this._scale.z);
  }

  @Watch('visible')
  visibleController(newValue) {
    if (newValue && this._model) this._model.visible = newValue;
  }

  /** Listen to calls coming from other components */
  @Listen('uiObjectBus', {
    target: 'body',
    capture: false,
    passive: true
  })
  uiEventsHandler(event: CustomEvent<uiObjectEvent>) {
    //                                                                            Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.to === this.uiid && event.detail.from !== this.uiid) {
      if (event.detail.type === 'json') {
        let payloadJSON: any = JSON.parse(event.detail.payload);
        if (payloadJSON.action === 'updateVisibility') {
          this._model.visible = payloadJSON.value;
        }
      }
    }
  }

  /** Transmit data to other components */
  @Event({
    eventName: 'uiObjectBus',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) uiObjectBusEvent: EventEmitter<uiObjectEvent>;

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
  private _scale: THREE.Vector3;

  private _mixer: THREE.AnimationMixer;
  private _clockFraction: number;
  private _randomID: string;

  private _model: THREE.Group;
  private _skeletonData: THREE.SkeletonHelper;
  private _objects: any;          // <<<< Needs proper interface definition

  constructor() {
    this._mixer = new THREE.AnimationMixer(null);
    this._clockFraction = 0.01;
    this._randomID = makeRandomString(6);
    this._objects = null;
  }

  componentWillLoad() {
    this._offset = (this.offset === '') ? null : domStringToVector(this.offset);
    this._rotation = (this.rotation === '') ? null : domStringToVector(this.rotation);
    this._scale = (this.scale === '') ? null : domStringToVector(this.scale);

    // Objects in GLTF file that are of interest
    if (this.objects !== '') this._objects = JSON.parse(this.objects);

    this._scene = Scene.getInstance();
    if (this.path !== '' && this.name !== '') this._loadGLTFfile();
  }

  componentDidLoad() { }

  render() { }     // <<< cannot be removed

  // -----------------

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

  private _pullLoading(xhr: ProgressEvent): void { }

  private _pullError(error: ProgressEvent): void {
    this._loadTrackerFunction('fail');
  }

  private _pullMesh(gltf: any): void {
    const roughnessMipmapper: RoughnessMipmapper = new RoughnessMipmapper(this._scene.render);

    this._model = gltf.scene;
    this._model.traverse((child) => {
      if (child.isMesh) {
        roughnessMipmapper.generateMipmaps(child.material);
        if (this._objects !== null) this._checkForActiveObject(child.name, child.uuid);
        if (this.developer) console.log('child.name', child.name);
      }
    });

    // Apply transform parameters
    if (this._offset) this._model.position.set(this._offset.x, this._offset.y, this._offset.z);
    if (this._rotation) this._model.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
    if (this._scale) this._model.scale.set(this._scale.x, this._scale.y, this._scale.z);

    this._model.name = 'gltf-file__' + this.name;
    this._model.visible = this.visible;

    // Character Skeleton 
    this._skeleton();

    // Add to Pool and scene
    this._addToScene();

    roughnessMipmapper.dispose();
  }

  private _animate(): void {
    if (this._mixer) {
      this._mixer.update(this._clockFraction);
    }
  }

  // -----------------

  private _checkForActiveObject(objectName: string, uuid: string): void {
    let gltfHasObject: boolean = false;
    let searchTerm: string = '';

    // exact match
    if (!gltfHasObject) {
      gltfHasObject = this._objects.exact.includes(objectName);
      searchTerm = objectName;
    }

    // starts
    if (!gltfHasObject && this._objects.starts.length > 0) {
      for (let oneName of this._objects.starts) {
        gltfHasObject = objectName.includes(oneName);
        searchTerm = oneName;
      }
    }

    // contains
    if (!gltfHasObject && this._objects.contains.length > 0) {
      for (let oneName of this._objects.contains) {
        gltfHasObject = objectName.includes(oneName);
        searchTerm = oneName;
      }
    }

    // ends
    if (!gltfHasObject && this._objects.ends.length > 0) {
      for (let oneName of this._objects.ends) {
        gltfHasObject = objectName.includes(oneName);
        searchTerm = oneName;
      }
    }

    if (gltfHasObject) {
      // Update group state
      let payload: any = {
        action: 'objectLink',
        name: objectName,
        uuid: uuid,
        slug: searchTerm
      }

      let submitObject: uiObjectEvent = {
        from: this.uiid,
        to: this._objects.from,
        toGroup: this.uigroup,
        action: 'objectLink',
        type: 'json',
        payload: JSON.stringify(payload)
      };
      this.uiObjectBusEvent.emit(submitObject);
    }
  }

  // -----------------
  // Skeleton
  // -----------------

  private _skeleton(): void {
    this._skeletonData = new THREE.SkeletonHelper(this._model);
    this._skeletonData.visible = false;
    // this._scene.scene.add(this._skeletonData);     // <<< Does the skeleton needs to be added to main scene?
  }

  // -----------------
  // Add to scene
  // -----------------

  private _addToScene(): void {
    // If this is part of bigger group then this needs to be ready to intersect with raycaster
    if (this.uigroup !== '' && this.uiid !== '') {
      // Add to pool and interaction group
      let poolAddition: Pool = {
        name: 'gltf-file__' + this.name,
        type: 'gltf-interactive',
        objectID: this._model.uuid,
        isGrouped: true,
        groupID: this.uigroup,
        uiID: this.uiid,
        interactWithHand: 'left',
        latchToController: '',
        priority: 50
      };
      let additionResult: boolean = checkAndAddToGroup(this._scene, poolAddition, this._model);
      if (additionResult) this._loadTrackerFunction('success');

    } else {
      // Add loaded file to main scene
      this._scene.scene.add(this._model);
      this._loadTrackerFunction('success');
    }
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
