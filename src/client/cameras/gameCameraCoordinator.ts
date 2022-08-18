import * as r from '../renderer';
import * as csm from '../clientShipManager';
import * as sor from '../../objects/shipObjectRenderer';
import * as THREE from 'three';

export enum GameCameraMode {
  StartAnimation,
  Default,
  FallowUser,
  Tpp
}

export class GameCameraCoordinator extends r.CameraCoordinator {
  private _shipManager: csm.ClientShipManager;
  private _camera: THREE.PerspectiveCamera;

  private _onMouseWheel: (e: MouseEvent) => void;
  private _onMouseDown: (e: MouseEvent) => void;
  private _onMouseMove: (e: MouseEvent) => void;
  private _onMouseUp: (e: MouseEvent) => void;

  private _mode: GameCameraMode;
  private _z: number;
  private _click: [number, number, THREE.Vector3] = null;

  private _setZ: number = null;
  private _setXY: [number, number] = null;
  private _reset: boolean = false;

  public get mode(): GameCameraMode {
    return this._mode;
  }

  public set mode(set: GameCameraMode) {
    this._mode = set;
    this._reset = true;
  }

  public set z(value: number) {
    this._setZ = value;
    this._z = value;
  }

  public constructor(shipManager: csm.ClientShipManager) {
    super();
    this._shipManager = shipManager;

    this._onMouseWheel = (e) => this.onMouseWheel(e);
    this._onMouseDown = (e) => this.onMouseDown(e);
    this._onMouseMove = (e) => this.onMouseMove(e);
    this._onMouseUp = (e) => this.onMouseUp(e);
  }

  public load(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer): void {
    this._camera = camera;

    window.addEventListener('mousewheel', this._onMouseWheel, false);
    window.addEventListener('MozMousePixelScroll', this._onMouseWheel, false);
    window.addEventListener('mouseup', this._onMouseUp, false);

    renderer.domElement.addEventListener('mousedown', this._onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', this._onMouseMove, false);

    this._mode = GameCameraMode.StartAnimation;
    this._z = 3;
    this._reset = true;
  }

  public unload(renderer: THREE.Renderer): void {
    window.removeEventListener('mousewheel', this._onMouseWheel);
    window.removeEventListener('MozMousePixelScroll', this._onMouseWheel);
    window.removeEventListener('mouseup', this._onMouseUp);

    renderer.domElement.removeEventListener('mousedown', this._onMouseDown);
    renderer.domElement.removeEventListener('mousemove', this._onMouseMove);
  }

  public onMouseWheel(e): void {
    e.preventDefault();
		e.stopPropagation();

    if (this._mode === GameCameraMode.Default ||
        this._mode === GameCameraMode.FallowUser) {
      let delta = e.wheelDelta || -e.detail;
      this._z = Math.max(this._z - (delta * 0.1), 5);
      this._setZ = this._z;
    }
  }

  public onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (this._mode === GameCameraMode.Default) {
      this._click = [e.clientX, e.clientY, new THREE.Vector3().copy(this._camera.position)];
    }
  }

  public onMouseMove(e: MouseEvent): void {
    if (this._mode === GameCameraMode.Default && this._click !== null) {
      let deltaX = this._click[0] - e.clientX;
      let deltaY = this._click[1] - e.clientY;
      let slow = this._z / 500;

      this._setXY = [
        this._click[2].x + (deltaX * slow),
        this._click[2].y - (deltaY * slow)
      ];
    }
  }

  public onMouseUp(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this._click = null;
  }

  private reset(): void {
    this._camera.position.copy(new THREE.Vector3(0, 0, this._z));
    this.updateShipCircle(this._z);
    this._camera.up.copy(new THREE.Vector3(0, 10000, 0));
    this._camera.lookAt(new THREE.Vector3(0, 0, 0));
    this._camera.rotation.z = 0;
    this.fallowShip(false);
    this._reset = false;
  }

  private updateShipCircle(z: number): void {
    if (this._shipManager.selectedShip !== null) {
      var renderer = this._shipManager.selectedShip.getRendererObject() as sor.ShipObjectRenderer;
      renderer.circleScale = Math.max(1, z / 30);
    }
  }

  private startAnimation(): void {
    this._z += 1.5;
    this.fallowShip(false);
    this._camera.position.z = this._z;
    this.updateShipCircle(this._z);
    if (this._z > 50) {
      this._mode = GameCameraMode.Default;
    }
  }

  private fallow(): void {
    if (this._setZ !== null) {
      this._camera.position.z = this._z;
      this.updateShipCircle(this._z);
    }
    if (this._setXY !== null) {
      this._camera.position.x = this._setXY[0];
      this._camera.position.y = this._setXY[1];
    }
    if (this._setZ !== null || this._setXY !== null) {
      this._camera.updateProjectionMatrix();
      this._setZ = null;
      this._setXY = null;
    }
  }

  private fallowShip(copyRotation: boolean): void {
    if (this._shipManager.selectedShip !== null) {
      this._camera.position.x = this._shipManager.selectedShip.position.x;
      this._camera.position.y = this._shipManager.selectedShip.position.y;
      if (this._setZ !== null) {
        this._camera.position.z = this._z;
        this.updateShipCircle(this._z);
      }
      if (copyRotation) {
        this._camera.rotation.z = this._shipManager.selectedShip.rotation.z - (Math.PI / 2);
      }
      this._camera.updateProjectionMatrix();
    }
  }

  private fallowShipTpp(camer: THREE.PerspectiveCamera): void {
    if (this._shipManager.selectedShip !== null) {
      var ship = this._shipManager.selectedShip;

      var distance = 5;
      this._camera.position.x = ship.position.x - (distance * Math.cos(ship.rotation.z));
      this._camera.position.y = ship.position.y - (distance * Math.sin(ship.rotation.z));
      this._camera.position.z = 1;

      this._camera.up.x = ship.position.x;
      this._camera.up.y = ship.position.y;
      this._camera.up.z = 1000;

      this._camera.lookAt(ship.position);
      this._camera.updateProjectionMatrix();
    }
  }

  private resetTpp(): void {
    this.updateShipCircle(1);
    this._reset = false;
  }

  public animate(camera: THREE.PerspectiveCamera) {
    if (this._mode === GameCameraMode.StartAnimation) {
      if (this._reset) {
        this.reset();
      }
      this.startAnimation();
    } else if (this._mode === GameCameraMode.Default) {
      if (this._reset) {
        this.reset();
      }
      this.fallow();
    } else if (this._mode === GameCameraMode.FallowUser) {
      this.fallowShip(true);
    } else if (this._mode === GameCameraMode.Tpp) {
      if (this._reset) {
        this.resetTpp();
      }
      this.fallowShipTpp(camera);
    }
  }
}
