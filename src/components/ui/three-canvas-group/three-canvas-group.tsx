import { Component, Element, Prop } from '@stencil/core';
import { makeRandomString } from '@_utils/uuid';

// <three-canvas-group>
//   <three-canvas-menu ...>
//   <three-canvas-altmenu ...>
// </three-canvas-group>

@Component({
  tag: 'three-canvas-group',
  shadow: false,
})
export class ThreeCanvasGroup {
  @Element() host: HTMLElement;

  /** clock ID to which this component listens to */
  @Prop({ mutable: false }) clockName: string = '';

  /** unique ID of group in which this object resides */
  @Prop({ mutable: true, reflect: true }) uigroup: string = '';

  /** unique ID assigned and identified by within its group */
  @Prop({ mutable: true, reflect: true }) uiid: string = '';

  // ------------

  private _uigroup: string;
  private _uiid: string;

  constructor() {
    this._uigroup = makeRandomString(8);          // makeRandomString(8).toLowerCase();
    this._uiid = makeRandomString(8);             // makeRandomString(8).toLowerCase();
  }

  componentWillLoad() {
    this.uigroup = this._uigroup;
    this.uiid = this._uiid;

    let elements: HTMLCollection = this.host.children;
    for (let i = 0; i < elements.length; i++) {
      let element: HTMLElement = elements[i] as HTMLElement;
      element.setAttribute('clock-name', this.clockName);
      element.setAttribute('uigroup', this._uigroup);
      element.setAttribute('uiid', makeRandomString(8));
    }
  }

  render() { }     // <<< cannot be removed
}
