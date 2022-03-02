import { ControllerIntersect, ControllerEventChange } from '@_interface/Intersect';

export function emptyControllerEvent(): ControllerIntersect {
  let returnData: ControllerIntersect = {
    name: '',
    group: '',
    index: -1,
    hand: '',
    active: false,
    coordinates: null,
    select: false,
    squeeze: false,
    state: ''
  }
  return (returnData);
}

export function emptyControllerChange(): ControllerEventChange {
  let returnData: ControllerEventChange = {
    intersectChange: false,
    selectChange: false,
    squeezeChange: false
  }
  return (returnData);
}
