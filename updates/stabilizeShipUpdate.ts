import e = require('../engine/engine');
import so = require('../objects/shipObject');

export class StabilizeShipUpdate extends e.EngineUpdate {

  public shipId: number;
  public enable: boolean;

  public constructor(shipId: number, enable: boolean) {
    super(StabilizeShipUpdateHandler.updateCode);
    this.shipId = shipId;
    this.enable = enable;
  }
}

export class StabilizeShipUpdateHandler extends e.EngineUpdateHandler<StabilizeShipUpdate> {

  public static updateCode: number = 12;

  public getCode() {
    return StabilizeShipUpdateHandler.updateCode;
  }

  public process(update: StabilizeShipUpdate) {
    let shipObj: so.ShipObject = this._engine.getObjectById(update.shipId) as so.ShipObject;
    if (shipObj !== null) {
      shipObj.stabilize = update.enable;
    }
  }
}
