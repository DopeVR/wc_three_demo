import * as THREE from 'three';

export interface ControllerMeshIntersect {
  name: string;
  point: THREE.Vector3;
  rotation: THREE.Euler;
  uv: THREE.Vector2;
  distance: number;
}

export interface ControllerIntersect {
  name: string;
  group: string;
  index: number;
  hand: string;
  active: boolean;
  coordinates: ControllerMeshIntersect;
  select: boolean;
  squeeze: boolean;
  state: string;             // '', 'select', 'squeeze', 'both'
}

export interface ControllerEventChange {
  intersectChange: boolean;
  selectChange: boolean;
  squeezeChange: boolean;
}

export interface uiObjectEvent {
  from: string;              // UI or Object initiating the call
  to: string;                // 1-1 talking to speciffic object or UI
  toGroup: string;           // 1-n talking to group
  action?: string;           // specify the 
  type: string;              // payload type to help with parsing    // [boolean, number, string, json]
  payload: string;           // JSON string
}

export interface gltfUImeta {
  animations?: string[];     // ^^^ follow types from above interface except string
  additive?: string[];
  // skeleton?: string[];
  // lights?: string[];
  // cameras?: string[];
}

export interface weightAction {
  weight: number;
  action: THREE.AnimationAction;
}
