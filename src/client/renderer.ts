import * as THREE from 'three';
import * as Stats from 'stats-js';
import { LiteEvent } from '../engine/liteEvent';

export class Renderer {

  private _renderer: THREE.WebGLRenderer;
  // private _loadingManager: THREE.LoadingManager;

  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _cameraCoordinator: CameraCoordinator = null;

  private _stats: Stats;
  private _objects: Array<RendererObject> = [];

  public beforeAnimate: LiteEvent<void> = new LiteEvent<void>();

  public get cameraCoordinator(): CameraCoordinator {
    return this._cameraCoordinator;
  }

  public set cameraCoordinator(cc: CameraCoordinator) {
    if (this._cameraCoordinator !== null) {
      this._cameraCoordinator.unload(this._renderer);
    }
    this._cameraCoordinator = cc;
    this._cameraCoordinator.load(this._camera, this._renderer);
  }

  public start(): void {
    // this._loadingManager = new THREE.LoadingManager();

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.shadowMapEnabled = true;
    this._renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setClearColor('rgb(18, 18, 31)', 0.5);

    this._camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);

    document.body.appendChild(this._renderer.domElement);

    this.prepareMainScene();

    window.addEventListener('resize', () => this.onWindowResize(), false);

    this._stats = new Stats();
    this._stats.showPanel(0);
    document.body.appendChild(this._stats.dom);

    this.animate();
  }

  private prepareMainScene(): void {
    this._scene = new THREE.Scene();
    this._scene.add(new THREE.AmbientLight('rgb(255, 255, 255)', 0.25));

    var directions  = ['qq_left.jpg', 'qq_right.jpg', 'qq_up.jpg','qq_down.jpg',  'qq_front.jpg', 'qq_back.jpg'];
    var imageURLs = [];
    for (var i = 0; i < 6; i++) {
      imageURLs.push('./media/textures/skybox/' + directions[i]);
    }
    var textureCube = THREE.ImageUtils.loadTextureCube(imageURLs);
    var shader = THREE.ShaderLib['cube'];
    shader.uniforms['tCube'].value = textureCube;
    var skyMaterial = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    var skyGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
  	var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
  	this._scene.add(skyBox);
  }

  public onWindowResize(): void {
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
  }

  public addObject(obj: RendererObject): void {
      this._objects.push(obj);
      obj.addToScene(this._scene);
  }

  public removeObject(obj: RendererObject): void {
    this._objects.splice(this._objects.indexOf(obj), 1);
    obj.removeFromScene(this._scene);
  }

  public animate(): void {
      this._stats.begin();
      this.beforeAnimate.trigger();

      for (var obj of this._objects) {
        obj.animate(this._camera);
      }

      if (this._cameraCoordinator !== null) {
        this._cameraCoordinator.animate(this._camera);
      }
  		this._renderer.render(this._scene, this._camera);
      this._stats.end();

      requestAnimationFrame(() => this.animate());
  }
}

export abstract class RendererObject {
  public abstract addToScene(scene: THREE.Scene): void;
  public abstract removeFromScene(scene: THREE.Scene): void;
  public abstract animate(camera: THREE.Camera): void;
}

export abstract class CameraCoordinator {
  public abstract load(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer): void;
  public abstract unload(renderer: THREE.Renderer): void;
  public abstract animate(camera: THREE.PerspectiveCamera): void;
}
