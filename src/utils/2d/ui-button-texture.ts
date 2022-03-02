import { textureOption, callOut, icon } from '@_interface/JSONData';

function shapeOpen(
  ctx: CanvasRenderingContext2D,
  x: number = 0,
  y: number = 0,
  size: number = 50,
  texture: textureOption | callOut | icon = null
): void {
  ctx.globalAlpha = 1;
  ctx.beginPath();

  try {
    ctx.drawImage(texture.thumbnailContent, x, y, size, size);
  } catch (e) {
    // Silencing this error - While image is loading and is still a promise this will fail
    // TODO - see if this can be figured out in better ways, possibly timing issue
  }

  ctx.rect(x, y, size, size);
}

function shapeIntersect(
  ctx: CanvasRenderingContext2D,
  mouseX: number = -10,
  mouseY: number = -10,
  mouseState: string = '',
  x: number = 0,
  y: number = 0,
  size: number = 50,
): boolean {
  // mouse is within the shape
  let pointerWithin: boolean = false;
  if (mouseX > 0 && mouseY > 0) {
    pointerWithin = ctx.isPointInPath(mouseX, mouseY);

    if (pointerWithin) {
      if (mouseState === '') {
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.rect(x, y, size, size);
        ctx.stroke();
      }
      if (mouseState === 'select' || mouseState === 'squeeze' || mouseState === 'both') {
        ctx.beginPath();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 5;
        ctx.rect(x, y, size, size);
        ctx.stroke();
      }
    }
  }
  return pointerWithin;
}

function shapeClose(
  ctx: CanvasRenderingContext2D
): void {
  ctx.globalAlpha = 1;
}

// -----------------

export function uiButtonImage(
  ctx: CanvasRenderingContext2D,
  mouseX: number = -10,
  mouseY: number = -10,
  mouseState: string = '',
  x: number = 0,
  y: number = 0,
  size: number = 50,
  texture: textureOption | callOut = null,
  callBack: Function = () => { }
): void {
  let pointerWithin: boolean = false;
  if (ctx) {
    shapeOpen(ctx, x, y, size, texture);
    pointerWithin = shapeIntersect(ctx, mouseX, mouseY, mouseState, x, y, size);
    shapeClose(ctx);
  }

  // return intersect state to 3D plane
  if (pointerWithin) callBack();
}

export function uiIcon(
  ctx: CanvasRenderingContext2D,
  x: number = 0,
  y: number = 0,
  size: number = 50,
  texture: icon = null,
): void {
  if (ctx) {
    shapeOpen(ctx, x, y, size, texture);
    shapeClose(ctx);
  }
}
