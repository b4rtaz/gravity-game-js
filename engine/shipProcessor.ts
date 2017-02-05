import e = require('./engine');
import so = require('../objects/shipObject');

export abstract class BaseShipProcessor extends e.EngineProcessor {
    protected _ships: Array<so.ShipObject> = [];

    public load(): void {
      // Aby za kazdym razem nie enumerować listy obiektow w poszukiwaniu statkow, robimy kopie tej listy.
      this._engine.afterAddObject.on((o) => this.afterAddObject(o));
      this._engine.afterRemoveObject.on((o) => this.afterRemoveObject(o));
    }

    public unload(): void {
      // todo: odpiąć eventy
    }

    protected afterAddObject(obj: e.EngineObject) {
      if (obj instanceof so.ShipObject) {
        this._ships.push(obj as so.ShipObject);
      }
    }

    protected afterRemoveObject(obj: e.EngineObject) {
      if (obj instanceof so.ShipObject) {
        this._ships.slice(this._ships.indexOf(obj), 1);
      }
    }
}

export class ShipProcessor extends BaseShipProcessor {

  public process(): void {
    for (var shipObj of this._ships) {
      this.processShip(shipObj);
    }
  }

  private processShip(ship: so.ShipObject): void {

    if (ship.stabilize) {
      let delta = ship.spinEngineAcceleration * this._engine.deltaTime;

      if (Math.abs(ship.angularVelocity.z) > delta) {
        ship.spinEngineFuel -= delta;
        ship.angularVelocity.z += delta * (ship.angularVelocity.z > 0 ? -1 : 1);
      } else {
        ship.angularVelocity.z = 0;
        ship.stabilize = false;
      }
    } else if (ship.rotate === -1) {
      let delta = ship.spinEngineAcceleration * this._engine.deltaTime;
      if (ship.spinEngineFuel >= delta) {
        ship.spinEngineFuel -= delta;
        ship.angularVelocity.z -= delta;
      } else {
        ship.spinEngineFuel = 0;
        ship.rotate = 0;
      }
    } else if (ship.rotate === 1) {
      let delta = ship.spinEngineAcceleration * this._engine.deltaTime;
      if (ship.spinEngineFuel >= delta) {
        ship.spinEngineFuel -= delta;
        ship.angularVelocity.z += delta;
      } else {
        ship.spinEngineFuel = 0;
        ship.rotate = 0;
      }
    }

    if (ship.accelerate === -1) {
      let delta = ship.mainEngineAcceleration * this._engine.deltaTime;
      if (ship.mainEngineFuel >= delta) {
        ship.mainEngineFuel -= delta;
        //console.log(delta * Math.cos(ship.rotation.z), delta * Math.sin(ship.rotation.z));
        ship.velocity.x -= delta * Math.cos(ship.rotation.z);
        ship.velocity.y -= delta * Math.sin(ship.rotation.z);
      } else {
        ship.mainEngineFuel = 0;
        ship.accelerate = 0;
      }
    } else if (ship.accelerate === 1) {
      let delta = ship.mainEngineAcceleration * this._engine.deltaTime;
      if (ship.mainEngineFuel >= delta) {
        ship.mainEngineFuel -= delta;
        //console.log(delta * Math.cos(ship.rotation.z), delta * Math.sin(ship.rotation.z));
        ship.velocity.x += delta * Math.cos(ship.rotation.z);
        ship.velocity.y += delta * Math.sin(ship.rotation.z);
      } else {
        ship.mainEngineFuel = 0;
        ship.accelerate = 0;
      }
    }
  }
}
