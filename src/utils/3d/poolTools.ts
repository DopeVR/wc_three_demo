import * as THREE from 'three';
import { Pool } from '@_interface/Pool';
import Scene from '@_utils/3d/scene';


// Object filters
function _onlyUnique(value, index, self): boolean {
  return (self.indexOf(value) === index);
}

export function poolByTypes(pool: Pool[]): string[] {
  let allGroupTypes: string[] = [];
  for (let poolItem of pool) {
    if (poolItem.isGrouped) allGroupTypes.push(poolItem.type);
  }

  let uniqueNames: string[] = allGroupTypes.filter(_onlyUnique);
  return (uniqueNames);
}

// Return assigned uiID of objects within group
export function poolByGroupID (pool: Pool[], groupID: string): string[] {
  let allInGroup: string[] = [];
  for (let poolItem of pool) {
    if (poolItem.groupID === groupID) allInGroup.push(poolItem.uiID);
  }
  return (allInGroup);
}

export function poolByObjectID (pool: Pool[], objectID: string): Pool {
  let oneID: Pool = null;
  for (let poolItem of pool) {
    if (poolItem.objectID === objectID) oneID = poolItem;
  }
  return (oneID);
}

function _priority(a, b) {
  if (a.priority < b.priority) return -1;
  if (a.priority > b.priority) return 1;
  return 0;
}

export function poolByHandAndPriority(pool: Pool[], hand: string): string[] {
  let someGroupNames: string[] = [];

  // Separate the hand assignment
  let somePoolItems: Pool[] = [];
  for (let poolItem of pool) {
    if (poolItem.interactWithHand === hand) somePoolItems.push(poolItem);
  }
  if (somePoolItems.length === 0) return (someGroupNames);

  // Sort the array by priority
  somePoolItems.sort(_priority);
  for (let item of somePoolItems) {
    if (item.isGrouped) someGroupNames.push(item.type);
  }

  let uniqueNames: string[] = someGroupNames.filter(_onlyUnique);
  return (uniqueNames);
}

export function poolByControllerLatch(pool: Pool[], hand: string): string[] {
  let someGroupNames: string[] = [];

  // Separate the hand assignment
  let somePoolItems: Pool[] = [];
  for (let poolItem of pool) {
    if (poolItem.latchToController === hand) somePoolItems.push(poolItem);
  }
  if (somePoolItems.length === 0) return (someGroupNames);

  // Grab only unique names
  let allGroupTypes: string[] = [];
  for (let poolItem of somePoolItems) {
    if (poolItem.isGrouped) allGroupTypes.push(poolItem.type);
  }
  someGroupNames = allGroupTypes.filter(_onlyUnique);
  return (someGroupNames);
}

export function groupExistByType(pool: Pool[], groupType: string): boolean {
  let isInPool: boolean = false;
  let allGroupTypes: string[] = poolByTypes(pool);
  isInPool = allGroupTypes.includes(groupType);
  return (isInPool);
}

export function checkAndAddToGroup(sceneInstance: Scene, poolAddition: Pool, groupObject: any): boolean {
  let result: boolean = false;

  // Make sure it is not in the pool already then add to the pool
  let alreadyInPool: boolean = false;
  for (let poolItem of sceneInstance.pool) {
    if (poolItem.objectID === poolAddition.objectID) alreadyInPool = true;
  }
  if (alreadyInPool === false) sceneInstance.pool.push(poolAddition);

  // Skip adding to group in case
  if (poolAddition.isGrouped === false) return (result);

  // Add to group
  let groupHandle: THREE.Group = null;
  if (sceneInstance.groups[poolAddition.type] === undefined) {
    // Create group
    groupHandle = new THREE.Group();
    groupHandle.name = 'group-' + poolAddition.type;
    sceneInstance.groups[poolAddition.type] = groupHandle;
    sceneInstance.scene.add(groupHandle);
  } else {
    // Grab existing group
    groupHandle = sceneInstance.groups[poolAddition.type];
  }

  // Add to the group
  groupHandle.add(groupObject);
  result = true;

  return (result);
}
