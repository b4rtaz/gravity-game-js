import * as e from '../engine/engine';
import * as so from '../objects/shipObject';

export class RotateShipUpdate extends e.EngineUpdate {
  public shipId: number;
  public way: number;

  public constructor(shipId: number, way: number) {
    super(RotateShipUpdateHandler.updateCode);
    this.shipId = shipId;
    this.way = way;
  }
}

export class RotateShipUpdateHandler extends e.EngineUpdateHandler<RotateShipUpdate> {
  public static updateCode: number = 11;

  public getCode() {
    return RotateShipUpdateHandler.updateCode;
  }

  public process(update: RotateShipUpdate) {
    let shipObj: so.ShipObject = this._engine.getObjectById(update.shipId) as so.ShipObject;
    if (shipObj !== null) {
      shipObj.rotate = update.way;
    }
  }
}
