import { Component, Element, Prop } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';

// Dynamic object -> Only to pass clockName information to all of its children
// - Helps to organize the structure of the code.
// <three-gltf-ui-group>
//   <three-gltf ... ></three-gltf>
//   <three-canvas-menu ... ></three-canvas-menu>
// </three-gltf-ui-group>

@Component({
  tag: 'three-gltf-ui-group',
  shadow: false,
})
export class ThreeGltfUiGroup {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';

  // -----------------

  private _uigroup: string;
  private _uiid: string;
  private _dynamicElements: string[];

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();
    this._dynamicElements = [
      'three-gltf',
      'three-canvas-ui',
      'three-canvas-menu',
      'three-canvas-altmenu',
      'three-canvas-tag',
      'three-mesh-image'
    ];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;
    this._traverseDOM();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _traverseDOM(): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      if (this._dynamicElements.includes(element.localName)) {
        element.setAttribute('clock-name', this.clockName);
        element.setAttribute('uigroup', this._uigroup);
        element.setAttribute('uiid', makeRandomString(8));
      }

      // Attributes of the HTML elements
      let attributes: any = element.attributes;
      for (let j = 0; j < attributes.length; j++) {
        let attribute: any = attributes[j];
        if (attribute.name === 'dynamic') {
          element.setAttribute('clock-name', this.clockName);
        }
      }
    }
  }

}
