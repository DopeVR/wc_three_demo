import { Component, Prop } from '@stencil/core';
import * as THREE from 'three';
import { Pool } from '@_interface/Pool';
import { makeRandomString } from '@_utils/uuid';
import Scene from '@_utils/3d/scene';
import { checkAndAddToGroup } from '@_utils/3d/poolTools';
import { domStringToVector } from '@_utils/3d/helper';

// <three-mesh-floor color="#BBBBBB" offset="0,0,0" rotation="0,0,0" size="10" type="circle"></three-mesh-floor>

@Component({
  tag: 'three-mesh-floor',
  shadow: false,
})
export class ThreeMeshFloor {
  /** 2D floor color */
  @Prop({ mutable: false }) color: string = '#FF0000';

  /** 2D floor shape */
  @Prop({ mutable: false }) type: string = 'square';        // [triangle, square, penta, hexa, octa, circle]

  /** 2D floor size */
  @Prop({ mutable: false }) size: number = 100;

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '0,0,0';

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '0,0,0';

  /** indicate whether this object is visible or not */
  @Prop({ mutable: false }) visible: boolean = false;

  /** indicate whether this floor is the first one user will land upon entry */
  @Prop({ mutable: false }) default: boolean = false;     // This prop is only used to be collected by parent group

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true }) uiid: string = '';

  /** Shift place where user lands after long distance teleport */
  @Prop({ mutable: false }) shiftOrigin: string = '';     // This prop is only used to be collected by parent group

  /** UI link to icon for long distance teleport */
  @Prop({ mutable: false }) link: string = '';            // This prop is only used to be collected by parent group

  /** path to icon for UI */
  @Prop({ mutable: false }) thumbnail: string = '';       // This prop is only used to be collected by parent group

  // -----------------

  private _scene: Scene;
  private _offset: THREE.Vector3;
  private _rotation: THREE.Vector3;
  private _floor: THREE.Mesh;
  private _randomID: string;

  constructor() {
    this._offset = domStringToVector(this.offset);
    this._rotation = domStringToVector(this.rotation);
    this._randomID = makeRandomString(6);
    this._floor = this._makeFloor(this._randomID, this.size, this.type, this._offset, this._rotation);
  }

  componentWillLoad() {
    this._scene = Scene.getInstance();
    this._scene.scene.add(this._floor);

    let poolAddition: Pool = {
      name: 'floor-' + this._randomID,
      type: 'floor',
      objectID: this._floor.uuid,
      isGrouped: true,
      groupID: this.uigroup,
      uiID: this.uiid,
      interactWithHand: 'right',
      latchToController: '',
      priority: 100
    };
    checkAndAddToGroup(this._scene, poolAddition, this._floor);
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _makeFloor(rndID: string, size: number, type: string, offset: THREE.Vector3, rotation: THREE.Vector3): THREE.Mesh {
    let plGeometry: THREE.Mesh = null;
    switch (type) {
      case 'triangle':
        plGeometry = new THREE.CircleGeometry(size, 3);
        break;

      case 'penta':
        plGeometry = new THREE.CircleGeometry(size, 5);
        break;

      case 'hexa':
        plGeometry = new THREE.CircleGeometry(size, 6);
        break;

      case 'octa':
        plGeometry = new THREE.CircleGeometry(size, 8);
        break;

      case 'circle':
        plGeometry = new THREE.CircleGeometry(size, 64);
        break;

      default:
        plGeometry = new THREE.PlaneGeometry(size, size, ((size / 10).toFixed(0)) + 1);
        break;
    }

    const plMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      side: THREE.DoubleSide
    });

    let returnFloor: THREE.Mesh = new THREE.Mesh(plGeometry, plMaterial);
    returnFloor.position.set(offset.x, offset.y, offset.z);
    returnFloor.rotation.set(THREE.MathUtils.degToRad(rotation.x + 90), THREE.MathUtils.degToRad(rotation.y), THREE.MathUtils.degToRad(rotation.z), 'XYZ');
    returnFloor.name = 'floor-' + rndID;
    returnFloor.visible = this.visible;
    return (returnFloor);
  }
}
