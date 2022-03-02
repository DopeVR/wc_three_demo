import * as THREE from 'three';
import { Pool } from '@_interface/Pool';

export default class Scene {
  private static instance: Scene;
  private constructor() { }

  public static getInstance(): Scene {
    if (!Scene.instance) Scene.instance = new Scene();
    return Scene.instance;
  }

  // Scene Object
  private _scene: THREE.Scene = null;
  get scene(): THREE.Scene {
    return this._scene;
  }
  set scene(value: THREE.Scene) {
    this._scene = value;
  }

  // Camera Object
  private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = null;
  get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this._camera;
  }
  set camera(value: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this._camera = value;
  }

  // Render Object
  private _render: THREE.WebGLRenderer = null;
  get render(): THREE.WebGLRenderer {
    return this._render;
  }
  set render(value: THREE.WebGLRenderer) {
    this._render = value;
  }

  // Pool of all objects that then will be grouped
  public pool: Pool[] = [];

  // Object groups
  public groups: THREE.Group[] = [];
}

// https://www.javaguides.net/2019/10/typescript-singleton-pattern-example.html
