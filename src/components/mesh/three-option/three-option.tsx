import { Component, Prop } from '@stencil/core';

// Static object
// This component holds data for parent component as parameters that can be easily changed

@Component({
  tag: 'three-option',
  shadow: false,
})
export class ThreeOption {
  /** DOM location of canvas element */
  @Prop({ mutable: false }) domId: string = '';             // Dom location for the canvas element

  /** index number within larger set */
  @Prop({ mutable: false }) index: number = -1;

  /** object id within larger set */
  @Prop({ mutable: false }) objectID: string = '';

  /** connect animation name to a thumbnail */
  @Prop({ mutable: false }) link: string = '';

  /** passing - thumbnail path */
  @Prop({ mutable: false }) thumbnail: string = '';         // Thumbnail

  /** passing - thumbnail unique ID */
  @Prop({ mutable: false }) thumbnailId: string = '';

  /** passing - texture path */
  @Prop({ mutable: false }) texture: string = '';           // Texture

  /** passing - texture unique ID */
  @Prop({ mutable: false }) textureId: string = '';

  /** passing - path */
  @Prop({ mutable: false }) path: string = '';

  /** passing - name */
  @Prop({ mutable: false }) name: string = '';

  /** passing - color */
  @Prop({ mutable: false }) color: string = '';

  // -----------------

  componentWillLoad() {
    if (this.domId !== '') {
      let imageBox = document.getElementById(this.domId);
      this._checkAndAdd(imageBox, this.thumbnail, this.thumbnailId);    // Thumbnail
      this._checkAndAdd(imageBox, this.texture, this.textureId);        // Texture
    }
  }

  render() { }     // <<< cannot be removed

  // -----------------

  private _checkAndAdd(imageBox: HTMLElement, path: string, id: string): void {
    if (path !== '' && id !== '') {
      let image: HTMLElement = document.createElement("img");
      image.setAttribute('src', path);
      image.setAttribute('id', id);
      imageBox.appendChild(image);
    }
  }
}
