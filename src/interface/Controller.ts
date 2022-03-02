import * as THREE from 'three';

export interface ControllerEvent {
  index: number;
  hand: string;
  button: string;
  action: string;
}

export interface ControllerAction {
  select: boolean;
  squeeze: boolean;
}

export interface ControllerMeshUI {
  visible: boolean;
  mesh: THREE.Mesh;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}
