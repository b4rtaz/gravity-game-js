import e = require('../../engine/engine');
import sp = require('../../engine/shipProcessor');
import so = require('../../objects/shipObject');
import mcu = require('../../updates/missionCompleteUpdate');

export enum VelocityMissionType {
  Skip,
  Less,
  Greater
}

export class VelocityMissionProcessor extends sp.BaseShipProcessor {
  private _vt: VelocityMissionType;
  private _v: number;
  private _avt: VelocityMissionType;
  private _av: number;

  public constructor(engine: e.Engine,
      velocityType: VelocityMissionType, velocity: number,
      angularVelocityType: VelocityMissionType, angularVelocity: number) {
    super(engine);
    this._vt = velocityType;
    this._v = velocity;
    this._avt = angularVelocityType;
    this._av = angularVelocity;
  }

  public process(): void {
    for (var shipObj of this._ships) {
      this.processShip(shipObj);
    }
  }

  private processShip(ship: so.ShipObject): void {
    let ok: boolean = true;

    if (this._vt !== VelocityMissionType.Skip) {
      let vel = ship.velocity.length();

      ok = (this._vt === VelocityMissionType.Less && vel < this._v) ||
           (this._vt === VelocityMissionType.Greater && vel > this._v);
    }
    if (this._avt !== VelocityMissionType.Skip && ok) {
      var angz = Math.abs(ship.angularVelocity.z);

      ok = (this._avt === VelocityMissionType.Less && angz < this._av) ||
          (this._vt === VelocityMissionType.Greater && angz > this._av);
    }

    if (ok) {
      this._engine.pushUpdate(new mcu.MissionCompleteUpdate(ship.id));
    }
  }
}
