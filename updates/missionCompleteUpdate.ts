import e = require('../engine/engine');
import so = require('../objects/shipObject');

export class MissionCompleteUpdate extends e.EngineUpdate {
  public shipId: number;

  public constructor(shipId: number) {
    super(MissionCompleteUpdateHandler.updateCode);
    this.shipId = shipId;
  }
}

export abstract class MissionCompleteUpdateHandler extends e.EngineUpdateHandler<MissionCompleteUpdate> {
  public static updateCode: number = 201;

  public getCode() {
    return MissionCompleteUpdateHandler.updateCode;
  }

  public abstract process(update: MissionCompleteUpdate);
}
