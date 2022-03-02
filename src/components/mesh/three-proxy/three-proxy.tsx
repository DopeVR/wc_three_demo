import { Component, Prop, Watch } from '@stencil/core';
import * as THREE from 'three';
import Scene from '@_utils/3d/scene';
import { domStringToVector } from '@_utils/3d/helper';
import { Pool } from '@_interface/Pool';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';

// <three-proxy type="cube" size="0.4,1.8,0.2"></three-proxy>

@Component({
  tag: 'three-proxy',
  shadow: false,
})
export class ThreeProxy {
  /** unique ID of group in which this object resides */
  @Prop({ mutable: false }) uigroup: string = '';             // Auto added by parent

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: false }) uiid: string = '';                // Auto added by parent

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: true }) offset: string = '';               // '0,0,0'

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: true }) rotation: string = '';             // '0,0,0'

  /** scale multiplier */
  @Prop({ mutable: true }) scale: string = '';                // '1,1,1'

  /** type of proxy object */
  @Prop({ mutable: false }) type: string = 'cube';            // ['cube', 'sphere', 'cylinder']

  /** size of proxy object */
  @Prop({ mutable: false }) size: string = '1,1,1';           // '1,1,1'

  /** indicate whether this object is visible or not */
  @Prop({ mutable: true }) visible: boolean = false;

  @Watch('offset')
  offsetController(newValue) {
    this._offset = (newValue === '') ? null : domStringToVector(newValue);
    if (this._offset && this._proxy) this._proxy.position.set(this._offset.x, this._offset.y, this._offset.z);
  }

  @Watch('rotation')
  rotationController(newValue) {
    this._rotation = (newValue === '') ? null : domStringToVector(newValue);
    if (this._rotation && this._proxy) this._proxy.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
  }

  @Watch('scale')
  scaleController(newValue) {
    this._scale = (newValue === '') ? null : domStringToVector(newValue);
    if (this._scale && this._proxy) this._proxy.scale.set(this._scale.x, this._scale.y, this._scale.z);
  }

  @Watch('visible')
  visibleController(newValue) {
    if (newValue && this._proxy) this._proxy.visible = newValue;
  }

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;
  private _scale: THREE.Vector3;

  private _size: THREE.Vector3;
  private _proxy: THREE.Mesh;

  constructor() {
    this._scene = Scene.getInstance();
  }

  componentWillLoad() {
    this._offset = (this.offset === '') ? null : domStringToVector(this.offset);
    this._rotation = (this.rotation === '') ? null : domStringToVector(this.rotation);
    this._scale = (this.scale === '') ? null : domStringToVector(this.scale);
    this._size = (this.size === '') ? null : domStringToVector(this.size);

    this._proxy = this._makeProxy();
    this._proxy.name = 'proxy-' + this.uigroup + '-' + this.uiid;
    this._addToScene();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _makeProxy(): THREE.Mesh {
    let geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this._size.x, this._size.y, this._size.z);
    let material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    let returnProxy: THREE.Mesh = new THREE.Mesh(geometry, material);
    returnProxy.visible = this.visible;
    if (this._offset) returnProxy.position.set(this._offset.x, this._offset.y + (this._size.y / 2), this._offset.z);
    if (this._rotation) returnProxy.rotation.set(THREE.MathUtils.degToRad(this._rotation.x), THREE.MathUtils.degToRad(this._rotation.y), THREE.MathUtils.degToRad(this._rotation.z), 'XYZ');
    if (this._scale) returnProxy.scale.set(this._scale.x, this._scale.y, this._scale.z);

    return (returnProxy);
  }

  private _addToScene(): void {
    // If this is part of bigger group then this needs to be ready to intersect with raycaster
    if (this.uigroup !== '' && this.uiid !== '') {
      // Add to pool and interaction group
      let poolAddition: Pool = {
        name: 'gltf-file__proxy',
        type: 'gltf-interactive',
        objectID: this._proxy.uuid,
        isGrouped: true,
        groupID: this.uigroup,
        uiID: this.uiid,
        interactWithHand: 'left',
        latchToController: '',
        priority: 50
      };
      checkAndAddToGroup(this._scene, poolAddition, this._proxy);

    } else {
      // Add loaded file to main scene
      this._scene.scene.add(this._proxy);
    }
  }
}
