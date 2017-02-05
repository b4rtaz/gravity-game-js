import e = require('../engine/engine');
import le = require('../engine/liteEvent');
import ll = require('../levels/levelLoader');
import so = require('../objects/shipObject');
import dsu = require('../updates/destroyedShipUpdate');

export class ClientShipManager {
  private _engine: e.Engine;
  private _levelLoader: ll.LevelLoader;

  private _selectedShip: so.ShipObject = null;

  public onShipSelected: le.LiteEvent<so.ShipObject> = new le.LiteEvent<so.ShipObject>();
  public onAllShipsDestroyed: le.LiteEvent<void> = new le.LiteEvent<void>();

  public get selectedShip(): so.ShipObject {
    return this._selectedShip;
  }

  public constructor(engine: e.Engine, levelLoader: ll.LevelLoader) {
    this._engine = engine;
    this._levelLoader = levelLoader;
  }

  public start(): void {
    this._levelLoader.levelChanged.on((ln) => this.onLevelChanged(ln));

    let updateHandler = new CsmDestroyedShipUpdateHandler(this._engine);
    updateHandler.onShipDestroyed.on((si) => this.onShipDestroyed(si));
    this._engine.bindUpdate(updateHandler);
  }

  private onLevelChanged(levelName: string): void {
    if (levelName === null) {
      this._selectedShip = null;
    } else {
      this._selectedShip = this._levelLoader.getLevel().addUser();
      if (this._selectedShip !== null) {
        this.onShipSelected.trigger(this._selectedShip);
      }
    }
  }

  private onShipDestroyed(shipId: number): void {
    if (this._selectedShip !== null && this._selectedShip.id === shipId) {
      this._selectedShip = null;
      this.onAllShipsDestroyed.trigger();
    }
  }
}

class CsmDestroyedShipUpdateHandler extends dsu.DestroyedShipUpdateHandler {
  public onShipDestroyed: le.LiteEvent<number> = new le.LiteEvent<number>();

  public process(update: dsu.DestroyedShipUpdate): void {
    this.onShipDestroyed.trigger(update.shipId);
  }
}
