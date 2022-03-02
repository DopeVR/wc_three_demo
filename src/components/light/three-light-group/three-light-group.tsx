import { Component, Element, Prop } from '@stencil/core';

// <three-light-group>
//   ...
// </three-light-group>

@Component({
  tag: 'three-light-group',
  shadow: false,
})
export class ThreeLightGroup {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  // -----------------

  componentWillLoad() {
    let elements: HTMLCollection = this.host.children;

    for (let i = 0; i < elements.length; i++) {
      let element = elements[i] as HTMLElement;

      // Attributes of the HTML elements
      let attributes: any = element.attributes;
      for (let j = 0; j < attributes.length; j++) {
        let attribute: any = attributes[j];
        if (attribute.name === 'dynamic') {
          element.setAttribute('clock-name', this.clockName);     // Pass this information down to child components
        }
      }
    }
  }

  render() { }     // <<< cannot be removed
}
