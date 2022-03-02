import { Component, Prop, Watch, State, Listen, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';

import Scene from '@_utils/3d/scene';
import { ControllerEvent, ControllerAction } from '@_interface/Controller';
import { ControllerMeshIntersect, ControllerIntersect, uiObjectEvent } from '@_interface/Intersect';
import { poolByHandAndPriority, poolByControllerLatch, poolByObjectID } from '@_utils/3d/poolTools';
import { StringSignal } from '@_interface/Signal';
import { Pool } from '@_interface/Pool';

// <three-raycaster group-controller="camera" group-floor="floor" group-boundary="walls"></three-raycaster>

@Component({
  tag: 'three-raycaster',
  shadow: false,
})
export class ThreeRaycaster {
  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** Align controller name with index according to user definition */
  @Prop({ mutable: false }) leftIndex: number = 1;

  /** Align controller name with index according to user definition */
  @Prop({ mutable: false }) rightIndex: number = 0;

  /** Ray-caster is only active in VR */
  @Prop({ mutable: true, reflect: true }) armed: boolean = false;
  
  @Watch('armed')
  activateController(newValue) {
    if (newValue) {
      this._controllersArmed();
    } else {
      this._controllersSafe();
    }
  }

  /** Listen to events that are coming from controllers */
  @Listen('controllerAction', {
    target: 'body',
    capture: false,
    passive: true
  })
  controllerActionHandler(event: CustomEvent<ControllerEvent>) {
    this.xrControllerObject = event.detail;

    // Set controller actions to current state
    if (this.xrControllerObject.button === 'select') {
      this.xrControllerActions[this.xrControllerObject.index].select = (this.xrControllerObject.action === 'start') ? true : false;
    }
    if (this.xrControllerObject.button === 'squeeze') {
      this.xrControllerActions[this.xrControllerObject.index].squeeze = (this.xrControllerObject.action === 'start') ? true : false;
    }
  }

  /** Transmit intersect data */
  @Event({
    eventName: 'intersect',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) intersectEvent: EventEmitter<ControllerIntersect>;

  /** Transmit data to other components */
  @Event({
    eventName: 'uiObjectBus',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) uiObjectBusEvent: EventEmitter<uiObjectEvent>;

  @State() xrControllerObject: ControllerEvent;
  @State() xrControllerActions: Array<ControllerAction>;

  // -----------------

  private _scene: Scene;
  private _controller_One: any;
  private _controller_Two: any;
  private _indexHandRight: number;
  private _indexHandLeft: number;

  private _interactionGroupNamesRight: string[];
  // private _attachedGroupNamesRight: string[];
  private _interactionGroupNamesLeft: string[];
  private _attachedGroupNamesLeft: string[];

  private _staticMenuID: StringSignal;
  private _leftMenuID: StringSignal;
  private _leftAltMenuID: StringSignal;
  private _oldLeftHandIntersect: string;

  private _rightSelect: boolean;
  private _rightSqueeze: boolean;
  private _leftSelect: boolean;
  private _leftSqueeze: boolean;

  private _tempMatrix: THREE.Matrix4;
  private _raycaster: THREE.Raycaster;

  private _menuPaletteVisible: boolean;
  private _menuFrontVisible: boolean;

  private _leftTriggerChange: boolean;
  private _leftSqueezeChange: boolean;

  constructor() {
    this._scene = Scene.getInstance();
    this._tempMatrix = new THREE.Matrix4();
    this._raycaster = new THREE.Raycaster();
    this._raycaster.near = 0;
    this._raycaster.far = 10;

    // initiate response object
    this.xrControllerObject = {
      index: null,
      hand: '',
      button: '',
      action: ''
    };

    // initiate controller array 0 (right), 1 (left)
    this.xrControllerActions = [];
    this.xrControllerActions.push(this._emptyControllerAction());        // 0 - right
    this.xrControllerActions.push(this._emptyControllerAction());        // 1 - left

    // Button states
    this._rightSelect = false;
    this._rightSqueeze = false;
    this._leftSelect = false;
    this._leftSqueeze = false;

    // Controller objects
    this._controller_One = null;
    this._controller_Two = null;
    this._indexHandRight = this.rightIndex;
    this._indexHandLeft = this.leftIndex;

    this._interactionGroupNamesRight = [];
    // this._attachedGroupNamesRight = [];
    this._interactionGroupNamesLeft = [];
    this._attachedGroupNamesLeft = [];

    // Right hand squeeze signal
    this._leftTriggerChange = false;
    this._leftSqueezeChange = false;
  }

  componentWillLoad() {
    this._menuPaletteVisible = false;
    this._menuFrontVisible = false;
  }

  componentDidLoad() { }

  render() { }     // <<< cannot be removed

  // -----------------

  private _emptyControllerAction(): ControllerAction {
    const returnObject: ControllerAction = {
      select: false,
      squeeze: false
    };
    return (returnObject);
  }

  private _controllersArmed(): void {
    // Initiate!
    this._staticMenuID = {
      default: '',
      current: '',
      previous: ''
    };

    this._leftMenuID = {
      default: '',
      current: '',
      previous: ''
    };

    this._leftAltMenuID = {
      default: '',
      current: '',
      previous: ''
    };

    this._oldLeftHandIntersect = '';

    // Controller matrix updates
    this._controller_One = this._scene.scene.getObjectByName('controller-' + this._indexHandRight);
    this._controller_One.matrixAutoUpdate = true;
    this._controller_One.matrixWorldNeedsUpdate = true;

    this._controller_Two = this._scene.scene.getObjectByName('controller-' + this._indexHandLeft);
    this._controller_Two.matrixAutoUpdate = true;
    this._controller_Two.matrixWorldNeedsUpdate = true;

    // Groups to interact with
    this._interactionGroupNamesRight = poolByHandAndPriority(this._scene.pool, 'right');
    this._interactionGroupNamesLeft = poolByHandAndPriority(this._scene.pool, 'left');

    // Groups that attach to controller
    // this._attachedGroupNamesRight = poolByControllerLatch(this._scene.pool, 'right');     // Highly unlikely there will be anything attached to right hand
    this._attachedGroupNamesLeft = poolByControllerLatch(this._scene.pool, 'left');

    // Is there menu group and default menu (front)
    let hasMenu: boolean = this._attachedGroupNamesLeft.includes('ui-menu');
    if (this._controller_Two !== null && hasMenu) {
      this._controller_Two.add(this._scene.groups['ui-menu']);

      for (let poolItem of this._scene.pool) {      // confirm default menu
        if (poolItem.name === 'menu-front') {
          this._leftMenuID.default = poolItem.objectID;
          this._leftMenuID.current = poolItem.objectID;
        }
      }
    }

    // Is there alt-menu group and default alt-menu (side)
    let hasAltMenu: boolean = this._attachedGroupNamesLeft.includes('ui-altmenu');
    if (this._controller_Two !== null && hasAltMenu) {
      this._controller_Two.add(this._scene.groups['ui-altmenu']);

      for (let poolItem of this._scene.pool) {      // confirm default altMenu
        if (poolItem.name === 'menu-side') {
          this._leftAltMenuID.default = poolItem.objectID;
          this._leftAltMenuID.current = poolItem.objectID;
        }
      }
    }
  }

  private _controllersSafe(): void {
    this._controller_One = null;
    this._controller_Two = null;
  }

  // -----------------

  private _frameAction(): void { }

  private _frameActionThin(): void {
    if (this._interactionGroupNamesRight.length > 0) this._handRightEvents();
    if (this._interactionGroupNamesLeft.length > 0 || this._attachedGroupNamesLeft.length > 0) this._handLeftEvents();
  }

  private _stateName(select: boolean, squeeze: boolean): string {
    let retunValue: string = '';
    if (select && !squeeze) retunValue = 'select';
    if (!select && squeeze) retunValue = 'squeeze';
    if (select && squeeze) retunValue = 'both';
    return retunValue;
  }

  private _handRightEvents(): void {
    // Intersections
    let ctrlOneIntersect: any = null;
    let oneRightGroup: THREE.Group = null;
    let oneRightGroupName: string = '';

    for (let groupName of this._interactionGroupNamesRight) {
      oneRightGroup = (this._scene.groups[groupName]) ? this._scene.groups[groupName] : null;
      if (ctrlOneIntersect === null) {
        ctrlOneIntersect = this._objectsKabob(this._controller_One, oneRightGroup, false);
        oneRightGroupName = (ctrlOneIntersect !== null) ? groupName : null;
      } else {
        break;
      }
    }

    if (ctrlOneIntersect === null) {
      // Gotch ya!!  You are reading this line!!
    } else {
      let intersectObject: ControllerIntersect = {
        name: ctrlOneIntersect.name,
        group: oneRightGroupName,
        index: this._indexHandRight,
        hand: 'right',
        active: true,
        coordinates: ctrlOneIntersect,
        select: this._rightSelect,
        squeeze: this._rightSqueeze,
        state: this._stateName(this._rightSelect, this._rightSqueeze)
      };
      this.intersectEvent.emit(intersectObject);
    }

    // Buttons
    if (this.xrControllerActions[this._indexHandRight].select) {
      this._rightSelect = true;
    } else {
      this._rightSelect = false;
    }

    if (this.xrControllerActions[this._indexHandRight].squeeze) {
      this._rightSqueeze = true;
    } else {
      this._rightSqueeze = false;
    }
  }

  private _handLeftEvents(): void {
    // Intersections
    let ctrlTwoIntersect: any = null;
    let oneLeftGroup: THREE.Group = null;
    let oneLeftGroupName: string = '';

    for (let groupName of this._interactionGroupNamesLeft) {
      oneLeftGroup = (this._scene.groups[groupName]) ? this._scene.groups[groupName] : null;
      if (ctrlTwoIntersect === null) {
        ctrlTwoIntersect = this._objectsKabob(this._controller_Two, oneLeftGroup, true);
        oneLeftGroupName = (ctrlTwoIntersect !== null) ? groupName : null;
      } else {
        break;
      }
    }

    if (ctrlTwoIntersect === null) {
      // Reset state tracking
      if (this._oldLeftHandIntersect !== '') {
        this._oldLeftHandIntersect = '';
        if (this._leftTriggerChange === false) this._leftMenuID.current = this._leftMenuID.default;
        if (this._leftSqueezeChange === false) this._leftAltMenuID.current = this._leftAltMenuID.default;
      }

    } else {
      // Update as few times as possible / query the scene
      if (this._oldLeftHandIntersect !== ctrlTwoIntersect.name) {
        this._oldLeftHandIntersect = ctrlTwoIntersect.name;

        if (this._oldLeftHandIntersect === '') {
          // Set default menu ???   <<< is this a right place?
        } else {
          let uiGroupID: string = '';
          let actualObject: THREE.Mesh = null;

          // Find groupID by asking intersected object for it's groupID
          for (let poolItem of this._scene.pool) {          // first parent level
            if (poolItem.objectID === ctrlTwoIntersect.name) uiGroupID = poolItem.groupID;
          }

          // Assuming that next section is for GLTF file
          // Find actualObject.parent.uuid in this._scene.pool
          if (uiGroupID === '') {
            actualObject = this._scene.scene.getObjectByProperty('uuid', ctrlTwoIntersect.name);

            for (let poolItem of this._scene.pool) {          // first parent level
              if (actualObject.parent.uuid && poolItem.objectID === actualObject.parent.uuid) uiGroupID = poolItem.groupID;
            }
          }
          if (uiGroupID === '' && actualObject !== null) {
            for (let poolItem of this._scene.pool) {        // second parent level
              if (actualObject.parent.parent?.uuid && poolItem.objectID === actualObject.parent.parent.uuid) uiGroupID = poolItem.groupID;
            }
          }
          if (uiGroupID === '' && actualObject !== null) {
            for (let poolItem of this._scene.pool) {        // third parent level
              if (actualObject.parent.parent?.parent?.uuid && poolItem.objectID === actualObject.parent.parent.parent.uuid) uiGroupID = poolItem.groupID;
            }
          }

          // Find the menu in the pool
          for (let oneItem of this._scene.pool) {
            if (oneItem.groupID === uiGroupID && oneItem.type === 'ui-static') this._staticMenuID.current = oneItem.objectID;
            if (oneItem.groupID === uiGroupID && oneItem.type === 'ui-menu') this._leftMenuID.current = oneItem.objectID;
            if (oneItem.groupID === uiGroupID && oneItem.type === 'ui-altmenu') this._leftAltMenuID.current = oneItem.objectID;
          }
        }
      }

      let intersectObject: ControllerIntersect = {
        name: ctrlTwoIntersect.name,
        group: oneLeftGroupName,
        index: this._indexHandLeft,
        hand: 'left',
        active: true,
        coordinates: ctrlTwoIntersect,
        select: this._leftSelect,
        squeeze: this._leftSqueeze,
        state: this._stateName(this._leftSelect, this._leftSqueeze)
      };
      this.intersectEvent.emit(intersectObject);
    }

    // Buttons
    if (this.xrControllerActions[this._indexHandLeft].select) {
      this._leftSelect = true;

      if (this._leftTriggerChange === false) {
        this._leftTriggerChange = true;
        this._leftMenuID.previous = this._leftMenuID.current;
        this._leftTriggerChangeStart(this._leftMenuID.previous);
      }

      this._leftTriggerChangeDown();
    } else {
      this._leftSelect = false;

      if (this._leftTriggerChange === true) {
        this._leftTriggerChange = false;
        this._leftTriggerChangeEnd(this._leftMenuID.previous);

        // Set default menu
        this._leftMenuID.current = this._leftMenuID.default;
        this._leftMenuID.previous = '';
        this._oldLeftHandIntersect = '';
      }
    }

    if (this.xrControllerActions[this._indexHandLeft].squeeze) {
      this._leftSqueeze = true;

      if (this._leftSqueezeChange === false) {
        this._leftSqueezeChange = true;
        this._leftAltMenuID.previous = this._leftAltMenuID.current;
        this._leftSqueezeChangeStart(this._leftAltMenuID.previous);
      }

      this._leftSqueezeChangeDown();
    } else {
      this._leftSqueeze = false;

      if (this._leftSqueezeChange === true) {
        this._leftSqueezeChange = false;
        this._leftSqueezeChangeEnd(this._leftAltMenuID.previous);

        // Set default menu
        this._leftAltMenuID.current = this._leftAltMenuID.default;
        this._leftAltMenuID.previous = '';
        this._oldLeftHandIntersect = '';
      }
    }
  }

  private _objectsKabob(controller: any, objectGroup: THREE.Group, recursive: boolean): ControllerMeshIntersect {
    let returnData: ControllerMeshIntersect = null;
    let intersects: Array<any> = this._getIntersections(controller, objectGroup, recursive);
    let closeDistanceOld: number = 1000;

    const invisibleExceptions: string[] = ['floor', 'proxy'];
    let invisibleFlag: boolean = false;

    if (intersects.length > 0) {
      for (let intersectee of intersects) {
        // exceptions for invisible floor objects and animation proxy objects
        invisibleFlag = false;
        for (let exception of invisibleExceptions) {
          if (invisibleFlag === false) {
            invisibleFlag = intersectee.object.name.startsWith(exception);
          }
        }

        if (invisibleFlag) {
          // Allow invisible object ONLY for some groups
          if (intersectee.object.type === 'Mesh' && intersectee.distance < closeDistanceOld) {
            closeDistanceOld = intersectee.distance;  // First closest object
            returnData = this._intersectDataFormatter(intersectee);
          }
        } else {
          // ONLY visible objects
          if (intersectee.object.visible && intersectee.object.type === 'Mesh' && intersectee.distance < closeDistanceOld) {
            closeDistanceOld = intersectee.distance;  // First closest object
            returnData = this._intersectDataFormatter(intersectee);
          }
        }
      }
    }

    return (returnData);
  }

  private _getIntersections(controller: any, objectGroup: THREE.Group, recursive: boolean): Array<any> {
    this._tempMatrix.identity().extractRotation(controller.matrixWorld);
    this._raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this._raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(this._tempMatrix);

    let returnIntersects: any[] = [];

    if (objectGroup) {
      returnIntersects = this._raycaster.intersectObjects(objectGroup.children, recursive);
    }
    return returnIntersects;
  }

  private _intersectDataFormatter(modData: any): ControllerMeshIntersect {
    let returnData: ControllerMeshIntersect = {
      name: modData.object.uuid,
      point: modData.point,
      rotation: modData.object.rotation,              // TODO - This is OBJECT rotation not face rotation / quaternion
      uv: modData.uv,
      distance: modData.distance
    }
    return (returnData);
  }

  // -----------------

  // Left hand
  private _leftTriggerChangeStart(objectID: string): void {
    if (this._menuPaletteVisible === false) {
      this._menuFrontVisible = true;
      this._updateVisibility(objectID, this._oldLeftHandIntersect, true);
    }
  }
  private _leftTriggerChangeDown(): void { }
  private _leftTriggerChangeEnd(objectID: string): void {
    this._menuFrontVisible = false;
    this._updateVisibility(objectID, this._oldLeftHandIntersect, false);
  }

  private _leftSqueezeChangeStart(objectID: string): void {
    if (this._menuFrontVisible === false) {
      this._menuPaletteVisible = true;
      this._updateVisibility(objectID, '', true);
    }
  }
  private _leftSqueezeChangeDown(): void { }
  private _leftSqueezeChangeEnd(objectID: string): void {
    this._menuPaletteVisible = false;
    this._updateVisibility(objectID, '', false);
  }

  private _updateVisibility(objectID: string, origin: string, value: boolean) {
    let poolItem: Pool = poolByObjectID(this._scene.pool, objectID);
    let payload: any = {
      property: 'visible',
      originObjectID: origin,
      value: value
    };

    let submitObject: uiObjectEvent = {
      from: 'raycaster',
      to: (poolItem) ? poolItem.uiID : '',
      toGroup: (poolItem) ? poolItem.groupID : '',
      action: 'updateProperty',
      type: 'json',
      payload: JSON.stringify(payload)
    };
    this.uiObjectBusEvent.emit(submitObject);
  }
}
