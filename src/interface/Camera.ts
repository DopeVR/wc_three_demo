import * as THREE from 'three';

export interface CameraNewLocation {
  onEvent: string;          // start / stop
  location: THREE.Vector3;
  rotation: THREE.Euler;
}
