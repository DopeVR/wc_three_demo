import { ControllerIntersect, ControllerEventChange } from '@_interface/Intersect';
import { emptyControllerEvent, emptyControllerChange } from '@_utils/3d/uiTools';
import { roundedRectangle, circle } from '@_utils/2d/shapes';
import { icon } from '@_interface/JSONData';
import { uiIcon } from '@_utils/2d/ui-button-texture';

export default class IntersectTools {

  private _intersectData: ControllerIntersect[];
  private _intersectDataChange: ControllerEventChange[];
  private _dotColors: string[];

  constructor() {
    this._intersectData = new Array();
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();

    this._intersectDataChange = new Array();
    this._intersectDataChange['right'] = emptyControllerChange();
    this._intersectDataChange['left'] = emptyControllerChange();

    this._dotColors = new Array();
    this._dotColors['right'] = '#FF0000';
    this._dotColors['left'] = '#FF0000';
  }

  // Intersect events
  public intersectEvents(): void {
    for (let index in this._intersectDataChange) {
      if (this._intersectData[index].active) {
        if (this._intersectDataChange[index].intersectChange === false) {
          this._intersectDataChange[index].intersectChange = true;
          this._intersectChangeStart(parseInt(index));
        }
        this._intersectChangeDown(parseInt(index));
      } else {
        if (this._intersectDataChange[index].intersectChange === true) {
          this._intersectDataChange[index].intersectChange = false;
          this._intersectChangeEnd(parseInt(index));
        }
      }
    }
  }

  private _intersectChangeStart(index: number): void {
    // console.log('_intersectChangeStart', index);
  }
  private _intersectChangeDown(index: number): void {
    // console.log('_intersectChangeDown', index);
  }
  private _intersectChangeEnd(index: number): void {
    // console.log('_intersectChangeEnd', index);
  }

  // Hand events by controller hand
  public handEvents(): void {
    for (let hand in this._intersectDataChange) {
      if (this._intersectData[hand].select) {
        if (this._intersectDataChange[hand].selectChange === false) {
          this._intersectDataChange[hand].selectChange = true;
          this._selectChangeStart(hand);
        }
        this._selectChangeDown(hand);
      } else {
        if (this._intersectDataChange[hand].selectChange === true) {
          this._intersectDataChange[hand].selectChange = false;
          this._selectChangeEnd(hand);
        }
      }

      if (this._intersectData[hand].squeeze) {
        if (this._intersectDataChange[hand].squeezeChange === false) {
          this._intersectDataChange[hand].squeezeChange = true;
          this._squeezeChangeStart(hand);
        }
        this._squeezeChangeDown(hand);
      } else {
        if (this._intersectDataChange[hand].squeezeChange === true) {
          this._intersectDataChange[hand].squeezeChange = false;
          this._squeezeChangeEnd(hand);
        }
      }

      if (this._intersectData[hand].select && this._intersectData[hand].squeeze) {
        this._bothDown(hand);
      }
    }
  }

  private _selectChangeStart(hand: string): void {
    this._dotColors[hand] = '#00FF00';
  }
  private _selectChangeDown(hand: string): void { }
  private _selectChangeEnd(hand: string): void {
    this._dotColors[hand] = '#FF0000';
  }

  private _squeezeChangeStart(hand: string): void {
    this._dotColors[hand] = '#0000FF';
  }
  private _squeezeChangeDown(hand: string): void { }
  private _squeezeChangeEnd(hand: string): void {
    this._dotColors[hand] = '#FF0000';
  }

  private _bothDown(hand: string): void {
    this._dotColors[hand] = '#FFFFFF';
  }

  // -----------------

  public getDotColor(hand: string): string {
    return (this._dotColors[hand]);
  }

  public getData(hand: string, data: ControllerIntersect): void {
    this._intersectData[hand] = data;
  }

  public resetData(): void {
    this._intersectData['right'] = emptyControllerEvent();
    this._intersectData['left'] = emptyControllerEvent();
  }

  public menuBackground(ctx: CanvasRenderingContext2D, width: number, height: number, multiplier: number): void {
    ctx.clearRect(0, 0, (width * multiplier), (height * multiplier));

    let locWidth = width * multiplier;
    let locHeight = height * multiplier;
    let corner = 0.02 * multiplier;
    roundedRectangle(ctx, 1, 1, (locWidth - 1), (locHeight - 1), corner);
  }

  public altMenuBackground(ctx: CanvasRenderingContext2D, width: number, height: number, rows: number, multiplier: number, icons: icon[]): void {
    ctx.clearRect(0, 0, (width * multiplier), (height * multiplier));

    let locWidth = width * multiplier;
    let locHeight = (height * multiplier) / rows;
    let corner = 0.02 * multiplier;

    for (let i = 0; i < rows; i++) {
      roundedRectangle(ctx, 1, ((locHeight * i) + 1), (locWidth - 2), (locHeight - 2), corner);
      if (icons !== null) uiIcon(ctx, corner, ((locHeight * i) + corner), (locHeight - (2 * corner)), icons[i]);
    }
  }

  public pointer(hand: string, ctx: CanvasRenderingContext2D, width: number, height: number, multiplier: number, activeCall: Function, passiveCall: Function): void {
    let x: number = -10;
    let y: number = -10;

    if (this._intersectData[hand].active) {
      x = this._intersectData[hand].coordinates.uv.x * (width * multiplier);
      y = (1 - this._intersectData[hand].coordinates.uv.y) * (height * multiplier);

      activeCall(x, y, hand);
      circle(ctx, x, y, (0.01 * multiplier), this.getDotColor(hand));
    } else {
      passiveCall(x, y);
    }
  }
}
