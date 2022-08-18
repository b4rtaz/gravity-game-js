import * as e from '../../engine/engine';
import * as mcu from '../../updates/missionCompleteUpdate';
import * as le from '../../engine/liteEvent';

export class MissionManager {
  private _engine: e.Engine;
  private _enabled: boolean = true;

  public onMissionCmplete: le.LiteEvent<number> = new le.LiteEvent<number>();

  public set enabled(set: boolean) {
    this._enabled = set;
  }

  public constructor(engine: e.Engine) {
    this._engine = engine;
  }

  public start(): void {
    let updateHandler = new MmMissionCompleteUpdateHandler(this._engine);
    updateHandler.onShipMissionComplete.on((sid) => this.onShipMissionComplete(sid));
    this._engine.bindUpdate(updateHandler);
  }

  private onShipMissionComplete(shipId: number): void {
    if (this._enabled) {
      this.onMissionCmplete.trigger(shipId);
    }
  }
}

class MmMissionCompleteUpdateHandler extends mcu.MissionCompleteUpdateHandler {
  public onShipMissionComplete: le.LiteEvent<number> = new le.LiteEvent<number>();

  public process(update: mcu.MissionCompleteUpdate) {
    this.onShipMissionComplete.trigger(update.shipId);
  }
}
