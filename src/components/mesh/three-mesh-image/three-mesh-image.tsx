import { Component, Prop, Event, EventEmitter, Watch } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { domStringToVector } from '@_utils/3d/helper';
import { makeRandomString } from '@_utils/uuid';
import { Pool } from '@_interface/Pool';
import { uiObjectEvent } from '@_interface/Intersect';

// Static object
// <three-mesh-image ratio="5:4" size="1"></three-mesh-image>

// TODO - consider adding LOD to this component: https://github.com/mrdoob/three.js/blob/master/examples/webgl_lod.html  /  https://threejs.org/docs/#api/en/objects/LOD.levels

@Component({
  tag: 'three-mesh-image',
  shadow: false,
})
export class ThreeMeshImage {
  /** path to file location */
  @Prop({ mutable: false }) path: string = '';

  /** file name */
  @Prop({ mutable: false }) name: string = '';

  /** unique ID of group in which this object resides */
  @Prop({ mutable: false }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: false }) uiid: string = '';

  /** aspect ratio of image that will be used */
  @Prop({ mutable: false }) ratio: string = '1:1';        // Aspect ration  5:4 = landscape  4:5 = portrait

  /** color for the 5 unused sides of the box */
  @Prop({ mutable: false }) color: string = '#080808';    // color of 5 sides of the box

  /** Size of the image in meters */
  @Prop({ mutable: true }) size: number = 1;              // size of the square to fill OR biggest scale number by which holder was scaled by

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: true }) offset: string = '0,0,0';

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: true }) rotation: string = '0,0,0';

  /** indicate whether this object is visible or not */
  @Prop({ mutable: true }) visible: boolean = false;

  /** helper GLTF file links to obejcts with that helper */
  @Prop({ mutable: false }) link: string = '';             // This parameter is used by parent to link helper geometry transformation with image transformation

  @Watch('size')
  scaleController(newValue) {
    this._scale = (newValue === '') ? null : this._sizeCalc(newValue, this._ratio);
    if (this._scale && this._model) this._model.scale.set(this._scale.x, this._scale.y, this._scale.z);
  }

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

  @Watch('visible')
  visibleController(newValue) {
    if (newValue && this._model) this._model.visible = newValue;
  }

  /** Transmit data to other components */
  @Event({
    eventName: 'uiObjectBus',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) uiObjectBusEvent: EventEmitter<uiObjectEvent>;

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;
  private _scale: THREE.Vector3;
  private _randomID: string;
  private _ratio: number;

  private _modelTextureLoader: THREE.TextureLoader;
  private _model: THREE.Mesh;

  constructor() {
    this._randomID = makeRandomString(6);
    this._modelTextureLoader = new THREE.TextureLoader();
  }

  componentWillLoad() {
    this._ratio = this._ratioCalc(this.ratio);
    this._offset = domStringToVector(this.offset);
    this._rotation = domStringToVector(this.rotation);
    this._scale = this._sizeCalc(this.size, this._ratio);

    this._model = this._makeBlock(this.color);
    this._scene = Scene.getInstance();

    // Notify UI of this image presence
    if (this.uigroup !== '') {
      let submitObject: uiObjectEvent = {
        from: this.uiid,
        to: '',
        toGroup: this.uigroup,
        type: 'string',
        payload: 'show-up'
      };
      this.uiObjectBusEvent.emit(submitObject);
    }

    // Add to active pool
    if (this.uigroup !== '' && this.uiid !== '') {
      // Add to pool and interaction group
      let poolAddition: Pool = {
        name: '3d-image-' + this._randomID,
        type: 'gltf-interactive',
        objectID: this._model.uuid,
        isGrouped: true,
        groupID: this.uigroup,
        uiID: this.uiid,
        interactWithHand: 'left',
        latchToController: '',
        priority: 50
      };
      checkAndAddToGroup(this._scene, poolAddition, this._model);
    } else {
      // Add loaded file to main scene
      this._scene.scene.add(this._model);
    }
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _makeBlock(color: string): THREE.Mesh {
    const mesh: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const materials: THREE.MeshPhongMaterial[] = [            // From perspective of user
      new THREE.MeshBasicMaterial({ color: color }),
      new THREE.MeshBasicMaterial({ color: color }),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: this._modelTextureLoader.load(this.path + this.name),
        flatShading: true 
      }),
      new THREE.MeshBasicMaterial({ color: color }),
      new THREE.MeshBasicMaterial({ color: color }),
      new THREE.MeshBasicMaterial({ color: color })
    ];

    let returnMesh: THREE.Mesh = null;
    returnMesh = new THREE.Mesh(mesh, materials);
    returnMesh.name = '3d-image-' + this._randomID;
    returnMesh.position.set(this._offset.x, this._offset.y, this._offset.z);
    returnMesh.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
    returnMesh.scale.set(this._scale.x, this._scale.y, this._scale.z);
    returnMesh.visible = this.visible;
    return (returnMesh);
  }

  private _ratioCalc(ratioData: string): number {
    let stringArray: string[] = ratioData.split(':');
    let returnData: number = +stringArray[1] / +stringArray[0];
    return (returnData);
  }

  private _sizeCalc(size: number, ratio: number): THREE.Vector3 {
    const boxWidth: number = (ratio > 1) ? (size / ratio) : size;
    const boxHeight: number = (ratio > 1) ? size : (size * ratio);
    const boxDepth: number = 0.05;

    let returnSize: THREE.Vector3 = new THREE.Vector3(boxWidth, boxDepth, boxHeight);
    return (returnSize);
  }
}
