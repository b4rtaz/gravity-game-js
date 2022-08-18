import * as e from '../engine/engine';

export class DestroyedShipUpdate extends e.EngineUpdate {
  public shipId: number;

  public constructor(shipId: number) {
    super(DestroyedShipUpdateHandler.updateCode);
    this.shipId = shipId;
  }
}

export abstract class DestroyedShipUpdateHandler extends e.EngineUpdateHandler<DestroyedShipUpdate> {
  public static updateCode: number = 13;

  public getCode() {
    return DestroyedShipUpdateHandler.updateCode;
  }

  public abstract process(update: DestroyedShipUpdate);
}
