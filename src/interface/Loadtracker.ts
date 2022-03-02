export interface loadTracker {
  id: string;
  file: string;
  load: string;       // start, success, fail
  time: number;
}

export interface loadComplete {
  buttonID: string;
  scene: string;      // open, close, loaded
}
