import r = require('../client/renderer');
import le = require('./liteEvent');

export class Engine {
  private _processors: Array<EngineProcessor> = [];
  private _updates: Array<EngineUpdate> = [];
  private _updateHandlers: {[code: number]: EngineUpdateHandler<EngineUpdate>; } = {};
  private _objects: Array<EngineObject> = [];

  public afterAddObject: le.LiteEvent<EngineObject> = new le.LiteEvent<EngineObject>();
  public afterRemoveObject: le.LiteEvent<EngineObject> = new le.LiteEvent<EngineObject>();
  public afterProcess: le.LiteEvent<void> = new le.LiteEvent<void>();

  private _lastDeltaTime: Date = null;
  public deltaTime: number;

  public pushUpdate(update): void {
    this._updates.push(update);
  }

  public bindUpdate<T extends EngineUpdate>(updateHandle: EngineUpdateHandler<T>): void {
    this._updateHandlers[updateHandle.getCode()] = updateHandle;
  }

  public addObject(obj: EngineObject): void {
    if (obj.id > 0) {
      this._objects.push(obj);
      this.afterAddObject.trigger(obj);
    } else {
      console.error(obj);
      throw new Error('Object doesn`t have id.');
    }
  }

  public removeObject(obj: EngineObject): void {
    this._objects.splice(this._objects.indexOf(obj), 1);
    this.afterRemoveObject.trigger(obj);
  }

  public removeAll(): void {
    while (this._objects.length > 0) {
      this.removeObject(this._objects[0]);
    }
  }

  public getObjects(): Array<EngineObject> {
    return this._objects;
  }

  public getObjectById(id: number): EngineObject {
    for (var obj of this._objects) {
      if (obj.id === id) {
        return obj;
      }
    }
    return null;
  }

  public addProcessor(processor: EngineProcessor): void {
    this._processors.push(processor);
    processor.load();
  }

  public removeProcessor(processor: EngineProcessor): void {
    var ix = this._processors.indexOf(processor);
    if (ix < 0) {
      throw new Error('Not found processor to remove.');
    }
    this._processors.splice(ix, 1);
    processor.unload();
  }

  private calculateDeltaTime() {
    var now: Date = new Date();
    if (this._lastDeltaTime === null) {
      this.deltaTime = 0;
    } else {
      this.deltaTime = Math.min((now.getTime() - this._lastDeltaTime.getTime()) / 1000, 0.05);
    }
    this._lastDeltaTime = now;
  }

  public process(): void {
    this.calculateDeltaTime();

    for (var processor of this._processors) {
      processor.process();
    }

    if (this._updates.length > 0) {
      for (var update of this._updates) {
        if (this._updateHandlers[update.code]) {
          this._updateHandlers[update.code].process(update);
        }
      }
      this._updates.length = 0;
    }

    this.afterProcess.trigger();
  }
}

export abstract class EngineProcessor {
  protected _engine: Engine;

  public constructor(engine: Engine) {
    this._engine = engine;
  }

  public abstract load(): void;
  public abstract process(): void;
  public abstract unload(): void;
}

export abstract class EngineObject {
  public id: number;
  public position: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public rotation: THREE.Euler = new THREE.Euler();
  public angularVelocity: THREE.Euler = new THREE.Euler();
  public radius: number = 1;
  public mass: number = 1;
  public ignoreGravity: boolean = false;

  public abstract getRendererObject(): r.RendererObject;
}

export abstract class EngineUpdate {
  public code: number;

  public constructor(code) {
    this.code = code;
  }
}

export abstract class EngineUpdateHandler<T extends EngineUpdate> {
  protected _engine: Engine;

  public constructor(engine: Engine) {
    this._engine = engine;
  }

  public abstract getCode();

  public abstract process(update: T);
}
