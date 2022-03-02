import { Component, Element, Prop, Event, EventEmitter } from '@stencil/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadTracker } from '@_interface/Loadtracker';
import { makeRandomString } from '@_utils/uuid';

// Dynamic object -> Only to pass clockName information to all of its children
// - Helps to organize the structure of the code.
// <three-mesh-group-gallery>
//   <three-gltf-ui-group>
//     ... 
//   </three-gltf-ui-group>
// </three-mesh-group-gallery>

@Component({
  tag: 'three-mesh-group-gallery',
  shadow: false,
})
export class ThreeMeshGroupGallery {
  @Element() host: HTMLElement;
  
  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** path to file location */
  @Prop({ mutable: false }) path: string = '';

  /** file name */
  @Prop({ mutable: false }) name: string = '';

  /** Development tool to trace information */
  @Prop({ mutable: true }) developer: boolean = false;      // TODO - Delete when no longer used!

  /** transmit load status of this element */
  @Event({
    eventName: 'loadTracker',
    composed: true,
    cancelable: false,
    bubbles: true,
  }) loadTrackerEvent: EventEmitter<loadTracker>;

  // -----------------

  private _randomID: string;
  private _helperData: string[][];
  private _dynamicElements: string[];

  constructor() {
    this._randomID = makeRandomString(6);
    this._helperData = [];
    this._dynamicElements = [
      'three-gltf-ui-group'
    ];
  }

  componentWillLoad() {
    if (this.path !== '' && this.name !== '') this._loadGLTFfile();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private traverseDOM(): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      // HTML elements
      if (this._dynamicElements.includes(element.localName)) {
        let children = element.children;
        for (let j = 0; j < children.length; j++) {
          let subChild = children[j];

          if (subChild.localName === 'three-mesh-image') {
            let link = subChild.getAttribute('link');
            let dataBit = (link === null || link === '') ? null : this._helperData[link];

            if (dataBit) {
              subChild.setAttribute('size', dataBit[0]);
              subChild.setAttribute('offset', dataBit[1]);
              subChild.setAttribute('rotation', dataBit[2]);
              subChild.setAttribute('visible', 'true');
            }
          }
        }
      }
    }
  }

  // -----------------

  private _loadGLTFfile(): void {
    this._loadTrackerFunction('start');

    // Load
    const loader: GLTFLoader = new GLTFLoader();
    loader.setPath(this.path);
    loader.load(
      this.name,
      (gltf) => this._pullMesh(gltf),
      (xhr) => this._pullLoading(xhr),
      (error) => this._pullError(error)
    );
  }

  private _pullLoading(xhr: ProgressEvent): void { }

  private _pullError(error: ProgressEvent): void {
    this._loadTrackerFunction('fail');
  }

  private _pullMesh(gltf: any): void {
    let tempScene = gltf.scene;
    tempScene.traverse((child) => {
      if (child.isMesh) {
        let dataPoint: string[] = [];
        dataPoint.push(this._vectorToSize(child.scale));
        dataPoint.push(this._vectorToString(child.position));
        dataPoint.push(this._eulerToString(child.rotation));
        this._helperData[child.name] = dataPoint;
      }
    });

    this._loadTrackerFunction('success');

    this.traverseDOM();
  }

  // -----------------

  private _loadTrackerFunction(state: string): void {
    // Load tracking
    let loadFileData: loadTracker = {
      id: this._randomID,
      file: this.path + this.name,
      load: state,
      time: Date.now()
    }
    this.loadTrackerEvent.emit(loadFileData);
  }

  // -----------------

  private _vectorToString(position: THREE.Vector3): string {
    let returnString: string = '';
    returnString += position.x.toFixed(3);
    returnString += ','
    returnString += position.y.toFixed(3);
    returnString += ','
    returnString += position.z.toFixed(3);
    return (returnString);
  }

  private _eulerToString(rotation: THREE.Euler): string {
    let returnString: string = '';
    returnString += THREE.MathUtils.radToDeg(rotation.x).toFixed(3);
    returnString += ','
    returnString += THREE.MathUtils.radToDeg(rotation.y).toFixed(3);
    returnString += ','
    returnString += THREE.MathUtils.radToDeg(rotation.z).toFixed(3);
    return (returnString);
  }

  private _vectorToSize(scale: THREE.Vector3): string {
    let tempScale = 0;
    tempScale = (tempScale > scale.x) ? tempScale : scale.x;
    tempScale = (tempScale > scale.y) ? tempScale : scale.y;
    tempScale = (tempScale > scale.z) ? tempScale : scale.z;

    let returnString: string = tempScale.toFixed(3);
    return (returnString);
  }
}
