
export interface searchResultsJSON {
  from: string;
  exact: string[];
  starts: string[];
  contains: string[];
  ends: string[];
}

export interface objectOptionsJSON {
  from: string;
  colors?: string[];
  textures?: textureOption[];
  thumbnails?: thumbnailOption[];
  objects?: string[];
  animations?: string[];
}

export interface textureOption {
  index: number;
  thumbnail?: string;
  thumbnailID?: string;
  thumbnailContent?: CanvasImageSource;
  texture?: string;
  textureID?: string;
  textureContents?: CanvasImageSource;
}

export interface thumbnailOption {
  index: number;
  uiid: string;
  uigroup: string;
  link?: string;
  thumbnail?: string;
  thumbnailID?: string;
  thumbnailContent?: CanvasImageSource;
}

export interface floorOption {
  index: number;
  uiid: string;
  uigroup: string;
  link?: string;
  thumbnail?: string;
  thumbnailID?: string;
  thumbnailContent?: CanvasImageSource;
  offset?: string;
  shiftOrigin?: string;
  rotation?: string;
  default?: boolean;
}

export interface icon {
  thumbnail?: string;
  thumbnailID?: string;
  thumbnailContent?: CanvasImageSource;
}

export interface callOut {
  action: string;
  link?: string;
  thumbnail?: string;
  thumbnailID?: string;
  thumbnailContent?: CanvasImageSource;
}

export interface hdrOption {
  index: number;
  path?: string;
  name?: string;
  thumbnail?: string;
  thumbnailID?: string;
  thumbnailContent?: CanvasImageSource;
}
