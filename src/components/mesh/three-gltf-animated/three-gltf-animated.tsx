import { Component, Prop, Watch, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { makeRandomString } from '@_utils/uuid';
import { Pool } from '@_interface/Pool';
import { uiObjectEvent, weightAction } from '@_interface/Intersect';
import { loadTracker } from '@_interface/Loadtracker';
import Scene from '@_utils/3d/scene';
import { domStringToVector } from '@_utils/3d/helper';

// Static object
// <three-gltf-animated path="https://wc-three.web.app/vr_assets/3d/cthulhu/" name="scene.gltf" offset="2,0.95,0" rotation="0,-90,0" scale="0.3,0.3,0.3"></three-gltf-animated>
// Mixer code source:  https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_additive_blending.html

@Component({
  tag: 'three-gltf-animated',
  shadow: false,
})
export class ThreeGltfAnimated {
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
    //                                           Prevent self calling bus message
    if (event.detail.toGroup === this.uigroup && event.detail.from !== this.uiid) {
      if (event.detail.action === 'playAnimationUpdate') this._switchToAnimation(event.detail.payload);
      if (event.detail.action === 'additiveAnimationUpdate') console.info ('additiveAnimationUpdate', event.detail.payload);       // TODO - add weight to the payload
    }

    //                                                                          Prevent self calling bus message
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

  private _animationAllNumber: number;
  private _animationBase: weightAction[];
  private _animationBaseNumber: number;
  private _animationBaseName: string[];
  private _animationAdditive: weightAction[];
  private _animationAdditiveNumber: any;
  private _animationAdditiveName: string[];

  private _currentBaseAction: string;
  private _additiveSuffix: string;
  private _animationNames: string[];

  constructor() {
    this._mixer = new THREE.AnimationMixer(null);
    this._clockFraction = 0.01;
    this._randomID = makeRandomString(6);

    this._animationAllNumber = 0;
    this._animationBase = [];
    this._animationBaseNumber = 0;
    this._animationBaseName = [];
    this._animationAdditive = [];
    this._animationAdditiveNumber = 0;
    this._animationAdditiveName = [];

    this._currentBaseAction = '';
    this._additiveSuffix = '_pose';
    this._animationNames = [];

    // this._objects = null;
  }

  componentWillLoad() {
    this._offset = (this.offset === '') ? null : domStringToVector(this.offset);
    this._rotation = (this.rotation === '') ? null : domStringToVector(this.rotation);
    this._scale = (this.scale === '') ? null : domStringToVector(this.scale);

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

    // Handle animations
    this._animation(gltf);

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
  // Skeleton
  // -----------------

  private _skeleton(): void {
    this._skeletonData = new THREE.SkeletonHelper(this._model);
    this._skeletonData.visible = false;
    // this._scene.scene.add(this._skeletonData);     // <<< Does the skeleton needs to be added to main scene?
  }

  // -----------------
  // Animations
  // -----------------

  private _animation(gltf: THREE.Mesh): void {
    // Animations from GLTF/GLB file
    const animations: any = gltf.animations;
    this._mixer = new THREE.AnimationMixer(this._model);
    this._modifyTimeScale(1);

    this._animationAllNumber = animations.length;
    for (let i = 0; i < this._animationAllNumber; i++) {
      let clip: any = animations[i];
      let clipName: string = clip.name;
      let action: any = null;
      this._animationNames.push(clipName);

      // define objects and set default states
      if (clipName.endsWith(this._additiveSuffix)) {
        // Additive animations / modifiers
        this._animationAdditive[clipName] = {
          weight: 0,
          action: null
        };
        this._animationAdditiveNumber++;
        this._animationAdditiveName.push(clipName);

        // Make the clip additive and remove the reference frame
        THREE.AnimationUtils.makeClipAdditive(clip);
        clip = THREE.AnimationUtils.subclip(clip, clipName, 2, 3, 30);

        action = this._mixer.clipAction(clip);
        this._activateAction(action);
        this._animationAdditive[clipName].action = action;

      } else {
        // Base animations
        this._animationBase[clipName] = {
          weight: 0,
          action: null
        };
        this._animationBaseNumber++;
        this._animationBaseName.push(clipName);

        action = this._mixer.clipAction(clip);
        this._activateAction(action);
        this._animationBase[clipName].action = action;
      }
    }

    // Trigger default animation / first on the list
    if (this._animationBaseNumber > 0) {
      this._currentBaseAction = this._animationBaseName[0];
      this._animationBase[this._currentBaseAction].weight = 1;
      this._switchToAnimation(this._currentBaseAction);
    }

    // Notify UI with list of animations
    if (this.uigroup !== '' && this._animationBaseNumber > 0) {
      let submitObject: uiObjectEvent = {
        from: this.uiid,
        to: '',
        toGroup: this.uigroup,
        action: 'playAnimation',
        type: 'json',
        payload: JSON.stringify(this._animationBaseName)
      };
      this.uiObjectBusEvent.emit(submitObject);
    }

    if (this.uigroup !== '' && this._animationAdditiveNumber > 0) {
      let submitObject: uiObjectEvent = {
        from: this.uiid,
        to: '',
        toGroup: this.uigroup,
        action: 'additiveAnimation',
        type: 'json',
        payload: JSON.stringify(this._animationAdditiveName)
      };
      this.uiObjectBusEvent.emit(submitObject);
    }
  }

  private _switchToAnimation(name: string) {
    let nextAnimationObj: any = null;
    if (this._animationBaseName.includes(name)) nextAnimationObj = this._animationBase[name];
    if (this._animationAdditiveName.includes(name)) nextAnimationObj = this._animationAdditive[name];
    let nextAnimation: any = nextAnimationObj ? nextAnimationObj.action : null;

    let currentAnimationObj: any = null;
    if (this._animationBaseName.includes(this._currentBaseAction)) currentAnimationObj = this._animationBase[this._currentBaseAction];
    if (this._animationAdditiveName.includes(this._currentBaseAction)) currentAnimationObj = this._animationAdditive[this._currentBaseAction];
    let currentAnimation: any = currentAnimationObj ? currentAnimationObj.action : null;

    if (currentAnimation === null && nextAnimation === null) {
      // do nothing
    } else {
      this._prepareCrossFade(currentAnimation, nextAnimation, 0.35);
    }
  }

  private _activateAction(action: THREE.AnimationAction) {
    const clip: any = action.getClip();
    const settings: any = this._animationBase[clip.name] || this._animationAdditive[clip.name];
    this._setWeight(action, settings.weight);
    action.play();
  }

  private _modifyTimeScale(speed) {
    this._mixer.timeScale = speed;
  }

  private _prepareCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
    // If the current action is 'walk', execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if (!startAction || !endAction) {
      this._executeCrossFade(startAction, endAction, duration);
    } else {
      this._synchronizeCrossFade(startAction, endAction, duration);
    }

    // Update control colors
    if (endAction) {
      const clip: any = endAction.getClip();
      this._currentBaseAction = clip.name;
    } else {
      this._currentBaseAction = '';
    }
  }

  private _synchronizeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
    if (this._mixer && this._mixer._listeners && this._mixer._listeners.loop.length > 0) {
      this._mixer._listeners.loop = [];
    }

    this._mixer.addEventListener(
      'loop',
      (event) => this._onLoopFinished(event, startAction, endAction, duration)
    );
  }

  private _onLoopFinished(event, startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
    if (event.action === startAction) {
      this._mixer.removeEventListener('loop', this._onLoopFinished);
      this._executeCrossFade(startAction, endAction, duration);
    }
  }

  private _executeCrossFade(startAction: THREE.AnimationAction, endAction: THREE.AnimationAction, duration: number) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    if (endAction) {
      this._setWeight(endAction, 1);
      endAction.time = 0;
      if (startAction) {
        // Crossfade with warping
        if (startAction) startAction.crossFadeTo(endAction, duration, true);
      } else {
        // Fade in
        if (endAction) endAction.fadeIn(duration);
      }
    } else {
      // Fade out
      if (startAction) startAction.fadeOut(duration);
    }
  }

  // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
  // the start action's timeScale to ((start animation's duration) / (end animation's duration))
  private _setWeight(action: THREE.AnimationAction, weight: number) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
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
