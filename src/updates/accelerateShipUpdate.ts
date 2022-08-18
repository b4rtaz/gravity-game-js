import * as e from '../engine/engine';
import * as so from '../objects/shipObject';

export class AccelerateShipUpdate extends e.EngineUpdate {
  public shipId: number;
  public way: number;

  public constructor(shipId: number, way: number) {
    super(AccelerateShipUpdateHandler.updateCode);
    this.shipId = shipId;
    this.way = way;
  }
}

export class AccelerateShipUpdateHandler extends e.EngineUpdateHandler<AccelerateShipUpdate> {
  public static updateCode: number = 10;

  public getCode() {
    return AccelerateShipUpdateHandler.updateCode;
  }

  public process(update: AccelerateShipUpdate) {
    let shipObj: so.ShipObject = this._engine.getObjectById(update.shipId) as so.ShipObject;
    if (shipObj !== null) {
      shipObj.accelerate = update.way;
    }
  }
}
