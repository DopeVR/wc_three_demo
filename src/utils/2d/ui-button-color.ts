// TODO - Define style guide and it's definition. Colors, fonts, sizes 

function shapeOpen(
  ctx: CanvasRenderingContext2D,
  x: number = 0,
  y: number = 0,
  radius: number = 50
): void {
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(x - (radius / 2), y - (radius / 2), radius, 0, (2 * Math.PI));
}

function shapeIntersect(
  ctx: CanvasRenderingContext2D,
  mouseX: number = -10,
  mouseY: number = -10,
  mouseState: string = '',
  color: string = '#FF0000'
): boolean {
  // mouse is within the shape
  let fillColor: string = color;
  let strokeColor: string = color;
  let strokeWidth: number = 2;

  let pointerWithin: boolean = false;
  if (mouseX > 0 && mouseY > 0) {
    pointerWithin = ctx.isPointInPath(mouseX, mouseY);
    if (pointerWithin) {
      if (mouseState === '') {
        strokeColor = "#FFFFFF";
        strokeWidth = 2;
      }
      if (mouseState === 'select' || mouseState === 'squeeze' || mouseState === 'both') {
        strokeColor = "#FFFFFF";
        strokeWidth = 5;
      }
    }
  }

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;

  return pointerWithin;
}

function shapeClose(
  ctx: CanvasRenderingContext2D
): void {
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 1;
}

// -----------------

export function uiButtonRound(
  ctx: CanvasRenderingContext2D,
  mouseX: number = -10,
  mouseY: number = -10,
  mouseState: string = '',
  x: number = 0,
  y: number = 0,
  radius: number = 20,
  color: string = '',
  callBack: Function = () => { }
): void {
  let pointerWithin: boolean = false;
  if (ctx) {
    shapeOpen(ctx, x, y, radius);
    pointerWithin = shapeIntersect(ctx, mouseX, mouseY, mouseState, color);
    shapeClose(ctx);
  }

  // return intersect state to 3D plane
  if (pointerWithin) callBack();
}
