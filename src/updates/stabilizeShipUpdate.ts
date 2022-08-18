
import { EngineUpdate, EngineUpdateHandler } from '../engine/engine';
import { ShipObject } from '../objects/shipObject';

export class StabilizeShipUpdate extends EngineUpdate {

  public shipId: number;
  public enable: boolean;

  public constructor(shipId: number, enable: boolean) {
    super(StabilizeShipUpdateHandler.updateCode);
    this.shipId = shipId;
    this.enable = enable;
  }
}

export class StabilizeShipUpdateHandler extends EngineUpdateHandler<StabilizeShipUpdate> {

  public static updateCode: number = 12;

  public getCode() {
    return StabilizeShipUpdateHandler.updateCode;
  }

  public process(update: StabilizeShipUpdate) {
    let shipObj: ShipObject = this._engine.getObjectById(update.shipId) as ShipObject;
    if (shipObj !== null) {
      shipObj.stabilize = update.enable;
    }
  }
}
