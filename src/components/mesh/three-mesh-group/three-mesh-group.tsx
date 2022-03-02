import { Component, Element, Prop } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';


// Dynamic object -> Only to pass clockName information to all of its children
// - Helps to organize the structure of the code.
// <three-mesh-group>
//   <three-gltf ...  />
//   <three-gltf ...  />
//   <three-gltf-ui-group>
//     ... 
//   </three-gltf-ui-group>
// </three-mesh-group>

@Component({
  tag: 'three-mesh-group',
  shadow: false,
})
export class ThreeMeshGroup {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';     // self generate and update

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';        // self generate and update

  /** offset position of this object to new x,y,z location */
  @Prop({ mutable: false }) offset: string = '';                    // '0,0,0'

  /** change rotation of this object on x,y,z axis, values provided must be in degrees */
  @Prop({ mutable: false }) rotation: string = '';                  // '0,0,0'

  /** scale multiplier passed down to children */
  @Prop({ mutable: false }) scale: string = '';                     // '1,1,1'

  // -----------------

  private _uigroup: string;
  private _uiid: string;
  private dynamicElements: string[];

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();

    this.dynamicElements = [
      'three-gltf',
      'three-gltf-ui-group',
      'three-group-color',
      'three-group-texture',
      'three-group-object',
      'three-group-animation'
    ];
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    this.traverseDOM();
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private traverseDOM(): void {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;

      // HTML elements
      if (this.dynamicElements.includes(element.localName)) {
        element.setAttribute('clock-name', this.clockName);

        // Pass down / override transformation settings
        if (this.offset !== '') element.setAttribute('offset', this.offset);
        if (this.rotation !== '') element.setAttribute('rotation', this.rotation);
        if (this.scale !== '') element.setAttribute('scale', this.scale);
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
