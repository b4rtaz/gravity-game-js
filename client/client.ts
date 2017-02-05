/// <reference path="../libs/three.d.ts"/>

import e = require('../engine/engine');
import eb = require('../engine/engineBuilder');
import le = require('../engine/liteEvent');

import r = require('./renderer');

import gpn = require('./gravityPrediction');
import gpnr = require('./gravityPredictionRenderer');
import cp = require('./controlProcessor');
import csm = require('./clientShipManager');

import ll = require('../levels/levelLoader');
import mm = require('../levels/missions/missionManager');
import so = require('../objects/shipObject');

export class Client {
  private _renderer : r.Renderer = null;
  private _engine : e.Engine = null;

  private _levelLoader: ll.LevelLoader = null;
  private _gravityPrediction: gpn.GravityPrediction = null;

  private _shipManager: csm.ClientShipManager = null;
  private _missionManager: mm.MissionManager = null;

  public clientReady: le.LiteEvent<void> = new le.LiteEvent<void>();
  public onPause: le.LiteEvent<void> = new le.LiteEvent<void>();

  public get renderer(): r.Renderer {
    return this._renderer;
  }

  public get engine(): e.Engine {
    return this._engine;
  }

  public get levelLoader(): ll.LevelLoader {
    return this._levelLoader;
  }

  public get gravityPrediction(): gpn.GravityPrediction {
    return this._gravityPrediction;
  }

  public get shipManager(): csm.ClientShipManager {
    return this._shipManager;
  }

  public get missionManager(): mm.MissionManager {
    return this._missionManager;
  }

  public start(): void {
    if (this._engine !== null) {
      throw new Error('Double instance!');
    }

    this._engine = eb.EngineBuilder.create();
    this._engine.addProcessor(new cp.ControlProcessor(this._engine, this));

    this._levelLoader = new ll.LevelLoader(this._engine);

    this._shipManager = new csm.ClientShipManager(this._engine, this._levelLoader);
    this._shipManager.start();

    this._missionManager = new mm.MissionManager(this._engine);
    this._missionManager.start();

    this._renderer = new r.Renderer();
    this._renderer.beforeAnimate.on(() => this._engine.process());

    this._engine.afterAddObject.on((o) => this._renderer.addObject(o.getRendererObject()));
    this._engine.afterRemoveObject.on((o) => this._renderer.removeObject(o.getRendererObject()));

    this._renderer.start();

    this._gravityPrediction = new gpn.GravityPrediction(this._engine);
    this._engine.afterProcess.on(() => this._gravityPrediction.predict(5, 0.03));
    this._renderer.addObject(new gpnr.GravityPredictionRenderer(this._gravityPrediction));

    this.clientReady.trigger();
  }

  public pause(): void {
    this.onPause.trigger();
  }
}
