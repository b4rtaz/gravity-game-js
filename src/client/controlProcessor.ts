import * as e from '../engine/engine';
import * as so from '../objects/shipObject';

import * as asu from '../updates/accelerateShipUpdate';
import * as rsu from '../updates/rotateShipUpdate';
import * as ssu from '../updates/stabilizeShipUpdate';
import { Client } from './client';

enum KeyCodes {
  KEY_Q = 81,
  KEY_A = 65,
  KEY_S = 83,
  KEY_D = 68,
  KEY_W = 87,
  KEY_ESC = 27
}

export class ControlProcessor extends e.EngineProcessor {
  private _client: Client;
  private _keyboard: Keyboard = new Keyboard();

  public constructor(engine: e.Engine, client: Client) {
    super(engine);
    this._client = client;
  }

  private _lastRotateWay: number = null;
  private _lastAccelerateWay: number = null;
  private _lastStabilize: boolean = false;

  private get selectedShip(): so.ShipObject {
    return this._client.shipManager.selectedShip;
  }

  public load(): void {
    this._keyboard.start();
  }

  public unload(): void {
    this._keyboard.stop();
  }

  public process(): void {
    if (this.selectedShip === null) {
      return;
    }

    if (this._keyboard.isDown(KeyCodes.KEY_ESC)) {
      this._client.pause();
    }

    if (this._keyboard.isDown(KeyCodes.KEY_A)) {
      if (this._lastRotateWay !== 1 && this.selectedShip.spinEngineFuel > 0) {
        this._engine.pushUpdate(new rsu.RotateShipUpdate(this.selectedShip.id, 1));
        this._lastRotateWay = 1;
      }
    } else if (this._keyboard.isDown(KeyCodes.KEY_D)) {
      if (this._lastRotateWay !== -1 && this.selectedShip.spinEngineFuel > 0) {
        this._engine.pushUpdate(new rsu.RotateShipUpdate(this.selectedShip.id, -1));
        this._lastRotateWay = -1;
      }
    } else {
      if (this._lastRotateWay !== null) {
        this._engine.pushUpdate(new rsu.RotateShipUpdate(this.selectedShip.id, 0));
        this._lastRotateWay = null;
      }
    }

    if (this._keyboard.isDown(KeyCodes.KEY_W)) {
      if (this._lastAccelerateWay !== 1 && this.selectedShip.mainEngineFuel > 0) {
        this._engine.pushUpdate(new asu.AccelerateShipUpdate(this.selectedShip.id, 1));
        this._lastAccelerateWay = 1;
      }
    } else if (this._keyboard.isDown(KeyCodes.KEY_S)) {
      if (this._lastAccelerateWay !== -1 && this.selectedShip.mainEngineFuel > 0) {
        this._engine.pushUpdate(new asu.AccelerateShipUpdate(this.selectedShip.id, -1));
        this._lastAccelerateWay = -1;
      }
    } else {
      if (this._lastAccelerateWay !== null) {
        this._engine.pushUpdate(new asu.AccelerateShipUpdate(this.selectedShip.id, 0));
        this._lastAccelerateWay = null;
      }
    }

    if (this._keyboard.isDown(KeyCodes.KEY_Q)) {
      if (!this._lastStabilize && this.selectedShip.rotation.z !== 0 && this.selectedShip.spinEngineFuel > 0) {
        this._engine.pushUpdate(new ssu.StabilizeShipUpdate(this.selectedShip.id, true));
        this._lastStabilize = true;
      }
    } else {
      if (this._lastStabilize) {
        this._engine.pushUpdate(new ssu.StabilizeShipUpdate(this.selectedShip.id, false));
        this._lastStabilize = false;
      }
    }
  }

}

class Keyboard {

  private _keysPressed: {[code:number]: number;} = {};

  public start(): void {
    window.addEventListener('keydown', (e) => this.keydown(e), true);
    window.addEventListener('keyup', (e) => this.keyup(e), true);
  }

  public stop(): void {
  }

  public keydown(event: KeyboardEvent): void {
    if (this._keysPressed[event.keyCode] === undefined) {
      this._keysPressed[event.keyCode] = null;
    }
  }

  public keyup(event: KeyboardEvent): void {
    this._keysPressed[event.keyCode] = undefined;
  }

  public isDown(keyCode: number) {
    return this._keysPressed[keyCode] !== undefined;
  }

  public isDownRepeat(keyCode: number, interval: number) {
    if (this._keysPressed[keyCode] !== undefined) {
      var now = new Date().getTime();
      if (this._keysPressed[keyCode] === null || this._keysPressed[keyCode] < now) {
        this._keysPressed[keyCode] = now + (interval * 1000);
        return true;
      }
    }
    return false;
  }
}
