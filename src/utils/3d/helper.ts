import * as THREE from 'three';

export function domStringToVector(data: string): THREE.Vector3 {
  let numberArray: string[] = data.split(',');
  let result: THREE.Vector3 = new THREE.Vector3();
  result.x = parseFloat(numberArray[0]);
  result.y = parseFloat(numberArray[1]);
  result.z = parseFloat(numberArray[2]);
  return result;
}

export function vectorToDomString(x: number, y: number, z: number): string {
  let result: string = '';
  result += x + ',';
  result += y + ',';
  result += z;
  return result;
}

export function eulerToDomString(x: number, y: number, z: number): string {
  let result: string = '';
  result += THREE.MathUtils.radToDeg(x) + ',';
  result += THREE.MathUtils.radToDeg(y) + ',';
  result += THREE.MathUtils.radToDeg(z);
  return result;
}
