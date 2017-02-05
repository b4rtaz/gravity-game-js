import so = require('../../objects/shipObject');
import oo = require('../../objects/orbObject');

import e = require('../../engine/engine');
import sp = require('../../engine/shipProcessor');
import mcu = require('../../updates/missionCompleteUpdate');

export enum OrbitShipMissionType {
  Less,
  Greater
}

export class OrbitShipMissionProcessor extends sp.BaseShipProcessor {
  private _targetOrb: oo.OrbObject;
  private _orbitType: OrbitShipMissionType;
  private _radius: number;
  private _minLoops: number;

  private _times: {[shipId: number]: OrbitSpy} = {};

  public constructor(engine: e.Engine, targetOrb: oo.OrbObject, orbitType: OrbitShipMissionType, radius: number, minLoops: number) {
    super(engine);
    this._targetOrb = targetOrb;
    this._orbitType = orbitType;
    this._radius = radius;
    this._minLoops = minLoops;
  }

  public process(): void {
    for (var shipObj of this._ships) {
      this.processShip(shipObj);
    }
  }

  private resetShip(ship: so.ShipObject) {
    if (this._times[ship.id]) {
      delete this._times[ship.id];
    }
  }

  private processShip(ship: so.ShipObject): void {
    // Jakiekolwiek uzycie napedu resetuje pomiar.
    if (ship.accelerate !== 0 || ship.rotate !== 0) {
      this.resetShip(ship);
      return;
    }

    let diff: THREE.Vector3 = ship.position.clone().sub(this._targetOrb.position);
    let distance: number = diff.length();

    if ((this._orbitType === OrbitShipMissionType.Less && distance > this._radius) ||
        (this._orbitType === OrbitShipMissionType.Greater && distance < this._radius)) {
      this.resetShip(ship);
      return;
    }

    let angle: number = Math.atan2(diff.x, diff.y) + Math.PI;
    let spy: OrbitSpy;

    if (!this._times[ship.id]) {
      spy = this._times[ship.id] = new OrbitSpy();
      spy.startTime = new Date().getTime();
      spy.startAngle = angle;
      spy.mode = OrbitSpyMode.DetectWay;
    } else {
      spy = this._times[ship.id];
      if (spy.mode === OrbitSpyMode.DetectWay) {
        // Aby moc ustalic kierunek statek musi sie chwile obkrecic.
        if (new Date().getTime() - spy.startTime > 0.05) {
          spy.mode = OrbitSpyMode.DetectLoop;
          spy.way = this.sign(angle - spy.startAngle);
          spy.lastDeltaSign = spy.way;
        }
      } else if (spy.mode === OrbitSpyMode.DetectLoop) {
        let delta = angle - spy.startAngle;
        let deltaSign = this.sign(delta);
        if (deltaSign !== spy.lastDeltaSign && delta * spy.way >= 0) {
          spy.loop++;
          if (this._minLoops <= spy.loop) {
            this._engine.pushUpdate(new mcu.MissionCompleteUpdate(ship.id));
          }
        }
        spy.lastDeltaSign = deltaSign;
      }
    }
  }

  private sign(v) {
    return v > 0 ? 1 : -1;
  }
}

enum OrbitSpyMode {
  DetectWay,
  DetectLoop
}

class OrbitSpy {
  public startTime: number;
  public startAngle: number;
  public lastDeltaSign: number;
  public way: number;
  public loop: number = 0;
  public mode: OrbitSpyMode;
}
