import e = require('../engine/engine');
import so = require('../objects/shipObject');
import dsu = require('./destroyedShipUpdate');

export class CollideUpdate extends e.EngineUpdate {
  public object1Id: number;
  public object2Id: number;

  public constructor(object1Id: number, object2Id: number) {
    super(CollideUpdateHandler.updateCode);
    this.object1Id = object1Id;
    this.object2Id = object2Id;
  }
}

export class CollideUpdateHandler extends e.EngineUpdateHandler<CollideUpdate> {
  public static updateCode: number = 200;

  public getCode() {
    return CollideUpdateHandler.updateCode;
  }

  public process(update: CollideUpdate) {
    let obj1 = this._engine.getObjectById(update.object1Id);
    if (obj1 instanceof so.ShipObject) {
      this._engine.removeObject(obj1);
      this._engine.pushUpdate(new dsu.DestroyedShipUpdate(obj1.id));
    }

    let obj2 = this._engine.getObjectById(update.object2Id);
    if (obj2 instanceof so.ShipObject) {
      this._engine.removeObject(obj2);
      this._engine.pushUpdate(new dsu.DestroyedShipUpdate(obj2.id));
    }
  }
}
