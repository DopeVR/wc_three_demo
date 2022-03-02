export interface AppTick {
  uuid: string;
  appFps?: number;
  frame?: number;
  first?: number; 
  second?: number;
  third?: number;
  screenFps?: number;
}

export interface RenderTick {
  uuid: string;
  frame?: number;
  screenFps?: number;
}

export interface ElementSize {
  width: number;
  height: number;
}
