// TODO - Define style guide and it's definition. Colors, fonts, sizes 

function roundedRectangleOpen(
  ctx: CanvasRenderingContext2D,
  x: number = 0,
  y: number = 0,
  width: number = 100,
  height: number = 20,
  radius: number = 3
): void {
  ctx.globalAlpha = 1;

  // begin custom shape
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function roundedRectangleIntersect(
  ctx: CanvasRenderingContext2D,
  mouseX: number = -10,
  mouseY: number = -10,
  mouseState: string = '',
  colorNormal: string = '#E85880',
  colorHover: string = '#F25CD0',
  colorSelect: string = '#C85FDB',
  colorSqueeze: string = '#B35CF2',
  colorBoth: string = '#8458E8',
): boolean {
  // mouse is within the shape
  let fillColor: string = colorNormal;
  let pointerWithin: boolean = false;
  if (mouseX > 0 && mouseY > 0) {
    pointerWithin = ctx.isPointInPath(mouseX, mouseY);
    if (pointerWithin) {
      if (mouseState === '') fillColor = colorHover;
      if (mouseState === 'select') fillColor = colorSelect;
      if (mouseState === 'squeeze') fillColor = colorSqueeze;
      if (mouseState === 'both') fillColor = colorBoth;
    }
  }

  ctx.fillStyle = fillColor;
  return pointerWithin;
}

function roundedRectangleClose(
  ctx: CanvasRenderingContext2D
): void {
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function addedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number = 0,
  y: number = 0,
  resMultiplier: number
): void {
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000000';
  ctx.font = (0.14 * resMultiplier) + "px Arial";
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

export function uiButton(
  ctx: CanvasRenderingContext2D,
  mouseX: number = -10,
  mouseY: number = -10,
  mouseState: string = '',
  x: number = 0,
  y: number = 0,
  width: number = 100,
  height: number = 20,
  text: string = '',
  callBack: Function = () => { }
): void {
  // Button background
  roundedRectangleOpen(ctx, x, y, width, height);
  let pointerWithin: boolean = roundedRectangleIntersect(ctx, mouseX, mouseY, mouseState);
  roundedRectangleClose(ctx);

  // Button text
  addedText(ctx, text, (x + 10), (y + 20), 100);

  // return intersect state to 3D plane
  if (pointerWithin) callBack();
}
