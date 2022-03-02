// UI general shapes

export function roundedRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#000000';
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
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

// -----------------

export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, (2 * Math.PI));
  ctx.fill();
  ctx.globalAlpha = 1;
}

// -----------------

export interface tagTextInterface {
  headline: string;
  author: string;
}

export function tagText(ctx: CanvasRenderingContext2D, resMultiplier: number, midHeight: number, tagData: tagTextInterface): void {
  ctx.globalAlpha = 1;

  // Headline
  let headlineFontSize: number = 0.06 * resMultiplier;
  ctx.font = "bold " + headlineFontSize + "px Arial";
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(tagData.headline, (0.05 * resMultiplier), (midHeight * resMultiplier) - (0.03 * resMultiplier) + (headlineFontSize / 2));

  // Author
  let authorFontSize: number = 0.04 * resMultiplier;
  ctx.font = authorFontSize + "px Arial";
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(tagData.author, (0.05 * resMultiplier), (midHeight * resMultiplier) + (0.03 * resMultiplier) + (authorFontSize / 2));

  ctx.globalAlpha = 1;
}
