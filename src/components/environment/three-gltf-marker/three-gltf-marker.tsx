import { Component, Prop, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { makeRandomString } from '@_utils/uuid';
import { Pool } from '@_interface/Pool';
import { CameraNewLocation } from '@_interface/Camera';
import { ControllerIntersect, ControllerEventChange } from '@_interface/Intersect';
import { loadTracker } from '@_interface/Loadtracker';
import Scene from '@_utils/3d/scene';
import { emptyControllerEvent, emptyControllerChange } from '@_utils/3d/uiTools';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';

// <three-gltf-marker path="/vr_assets/3d/" name="floor.glb"></three-gltf-marker>

@Component({
  tag: 'three-gltf-marker',
  shadow: false,
})
export class ThreeGltfMarker {
  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';         // This is added by parent group, if object is marked dynamic

  /** path to file location */
  @Prop({ mutable: false }) path: string = '';

  /** file name */
  @Prop({ mutable: false }) name: string = '';

  /** This flag allows users avatar to align with rotation of floor object !!!! POTENTIALLY extremely nauseating !!!! */
  @Prop({ mutable: false }) mcescher: boolean = false;

  /** Listen to data coming from ray-caster */
  @Listen('intersect', {
    target: 'body',
    capture: false,
    passive: true
  })
  intersectHandler(event: CustomEvent<ControllerIntersect>) {
    if (event.detail.group === 'floor') {
      this._intersectData[event.detail.hand] = event.detail;
    }
  }

  /** Transmit event of new camera location / rotation */
  @Event({
    eventName: 'cameraUpdate',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) cameraUpdateEvent: EventEmitter<CameraNewLocation>;

  /** transmit load status of this element */
  @Event({
    eventName: 'loadTracker',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) loadTrackerEvent: EventEmitter<loadTracker>;

  // -----------------

  private _scene: Scene;
  private _indicator: THREE.Mesh | THREE.Group;
  private _mixer: THREE.AnimationMixer;
  private _clockFraction: number;
  private _randomID: string;

  private _rightCrossChange: boolean;

  private _intersectPoint: THREE.Vector3;
  private _intersectRotation: THREE.Euler;
  private _intersectData: ControllerIntersect[];
  private _intersectDataChange: ControllerEventChange[];
  private _cameraLocationUpdate: CameraNewLocation;

  constructor() {
    this._indicator = null;
    this._mixer = new THREE.AnimationMixer(null);
    this._clockFraction = 0.01;
    this._randomID = makeRandomString(6);

    this._intersectPoint = null;
    this._intersectRotation = null;
    this._rightCrossChange = false;

    this._intersectData = new Array();
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();

    this._intersectDataChange = new Array();
    this._intersectDataChange['right'] = emptyControllerChange();
    this._intersectDataChange['left'] = emptyControllerChange();

    this._cameraLocationUpdate = {
      onEvent: '',
      location: null,
      rotation: null
    };
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();

    if (this.path === '' || this.name === '') {
      // use the ball thingy
      this._objectLogistics(this._makeBall());
    } else {
      // Load 
      this._loadGLTFfile();
    }
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
    this._loadTrackerFunction('success');

    // use of RoughnessMipmapper is optional
    const roughnessMipmapper: RoughnessMipmapper = new RoughnessMipmapper(this._scene.render);

    let GLTFscene: any = gltf.scene;
    GLTFscene.name = 'floor-indicator';
    // for (let child of GLTFscene.children) {
    //   if (child.isMesh) {
    //     child.castShadow = true;
    //   }
    // }
    roughnessMipmapper.dispose();

    // Animations from GLTF/GLB file
    this._mixer = new THREE.AnimationMixer(GLTFscene);
    const animations: any = gltf.animations;
    let animationAllNumber: number = animations.length;
    if (animationAllNumber > 0) {
      let clip: any = animations[0];
      let action: any = this._mixer.clipAction(clip);
      action.enabled = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(1);
      action.play();
    }

    this._objectLogistics(GLTFscene);
  }

  private _objectLogistics(model: THREE.Mesh | THREE.Group): void {
    this._indicator = model;
    this._scene.scene.add(model);

    let poolAddition: Pool = {
      name: 'floor-indicator',
      type: 'floor',
      objectID: model.uuid,
      isGrouped: false,
      interactWithHand: '',
      latchToController: '',
      priority: 20
    };
    checkAndAddToGroup(this._scene, poolAddition, model);
  }

  private _makeBall(): THREE.Mesh {
    const spGeometry: THREE.SphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const spMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
      color: 0x2182ff,
      specular: 0x050505,
      shininess: 20,
      flatShading: true
    });

    let returnBall: THREE.Mesh = new THREE.Mesh(spGeometry, spMaterial);
    returnBall.position.set(this._intersectPoint);
    returnBall.visible = false;
    returnBall.name = 'floor-indicator';
    return (returnBall);
  }

  // -----------------

  private _animate(): void {
    if (this._indicator) {
      // Intersect / Select / Squeeze button events 
      this._handEvents();
      // Show the position of intersection and next location upon release
      if (this._intersectPoint) this._indicator.position.set(this._intersectPoint.x, this._intersectPoint.y, this._intersectPoint.z);
      if (this._intersectRotation) this._indicator.rotation.set(this._intersectRotation.x, this._intersectRotation.y, this._intersectRotation.z, this._intersectRotation.order);
    }

    if (this._mixer) {
      this._mixer.update(this._clockFraction);
    }

    // Reset state 
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();
  }

  // -----------------

  private _handEvents(): void {
    // Right hand - Two button cross-switch - Location change
    if (this._intersectData['right'].select) {
      this._indicator.visible = true;

      if (this._intersectData['right'].squeeze) {
        if (this._rightCrossChange === false) {
          this._rightCrossChange = true;
          this._rightCrossChangeStart();
        }
      } else {
        if (this._rightCrossChange === true) {
          this._rightCrossChange = false;
          this._rightCrossChangeEnd();
        }
      }

      this._rightCrossChangeDown();

    } else {
      this._intersectPoint = null;
      this._intersectRotation = null;
      this._indicator.visible = false;

      if (this._rightCrossChange === true) {
        this._rightCrossChange = false;
        this._rightCrossChangeEnd();
      }
    }
  }

  private _rightCrossChangeStart(): void {
    this._cameraLocationUpdate.onEvent = 'start';
    this._cameraLocationUpdate.location = this._intersectPoint;
    this._cameraLocationUpdate.rotation = this._intersectRotation;
    this.cameraUpdateEvent.emit(this._cameraLocationUpdate);
  }
  private _rightCrossChangeDown(): void {
    this._intersectPoint = this._intersectData['right'].coordinates.point;
    if (this.mcescher) this._intersectRotation = this._intersectData['right'].coordinates.rotation;
  }
  private _rightCrossChangeEnd(): void {
    this._cameraLocationUpdate.onEvent = 'end';
    this._cameraLocationUpdate.location = this._intersectPoint;
    this._cameraLocationUpdate.rotation = this._intersectRotation;
    this.cameraUpdateEvent.emit(this._cameraLocationUpdate);
  }
}
