/// <reference path="../libs/three.d.ts"/>

import e = require('../engine/engine');
import gp = require('../engine/gravityProcessor');
import le = require('../engine/liteEvent');

import r = require('./renderer');

export class GravityPrediction {

  private _engine: e.Engine;
  private _processor: gp.GravityProcessor = new gp.GravityProcessor();

  private _tempObjects: Array<TempObject> = [];
  private _prediction: {[objId: number]: Array<THREE.Vector3>} = {};

  public includedObject: le.LiteEvent<number> = new le.LiteEvent<number>();
  public excludedObject: le.LiteEvent<number> = new le.LiteEvent<number>();

  public constructor(engine: e.Engine) {
    this._engine = engine;
    this._engine.afterAddObject.on((o) => this.afterAddObject(o));
    this._engine.afterRemoveObject.on((o) => this.afterRemoveObject(o));
  }

  public afterAddObject(obj: e.EngineObject): void {
    if (!obj.ignoreGravity) {
      this._tempObjects.push(new TempObject(obj));
      this._prediction[obj.id] = [];
      this.includedObject.trigger(obj.id);
    }
  }

  public afterRemoveObject(obj: e.EngineObject): void {
    if (!obj.ignoreGravity) {
      var ix = null;
      for (var i = 0; i < this._tempObjects.length; i++) {
        if (this._tempObjects[i].source === obj) {
          ix = i;
          break;
        }
      }
      if (ix === null) {
        throw new Error('Invalid object!');
      }
      this._tempObjects.splice(ix, 1);
      delete this._prediction[obj.id];
      this.excludedObject.trigger(obj.id);
    }
  }

  public predict(time: number, deltaTime: number): void {
    for (var tempObj of this._tempObjects) {
      tempObj.updateFromSource();
    }

    // Kasujemy stare predykcje.
    for (var obj of this._tempObjects) {
      this._prediction[obj.id].length = 0;
    }

    for (var t = 0; t < time; t += deltaTime) {
      this._processor.process(this._tempObjects, deltaTime);
      for (var obj of this._tempObjects) {
        this._prediction[obj.id].push(new THREE.Vector3().copy(obj.position));
      }
    }
  }

  public get prediction(): {[objId: number]: Array<THREE.Vector3>} {
    return this._prediction;
  }

  public get predictionCount(): number {
    return this._tempObjects.length;
  }
}

class TempObject extends e.EngineObject {

  private _source: e.EngineObject;

  public get source(): e.EngineObject {
    return this._source;
  }

  public constructor(source: e.EngineObject) {
    super();
    this._source = source;

    this.id = source.id;
    this.mass = source.mass;
    this.radius = source.radius;
  }

  public updateFromSource() {
    this.position.copy(this._source.position);
    this.velocity.copy(this._source.velocity);
  }

  public getRendererObject(): r.RendererObject {
    throw new Error('Invalid usage.');
  }
}
