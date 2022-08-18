import { Engine } from "../engine/engine";
import { EngineBuilder } from "../engine/engineBuilder";
import { LiteEvent } from "../engine/liteEvent";
import { LevelLoader } from "../levels/levelLoader";
import { MissionManager } from "../levels/missions/missionManager";
import { ClientShipManager } from "./clientShipManager";
import { ControlProcessor } from "./controlProcessor";
import { GravityPrediction } from "./gravityPrediction";
import { GravityPredictionRenderer } from "./gravityPredictionRenderer";
import { Renderer } from "./renderer";

export class Client {
  private _renderer: Renderer = null;
  private _engine: Engine = null;

  private _levelLoader: LevelLoader = null;
  private _gravityPrediction: GravityPrediction = null;

  private _shipManager: ClientShipManager = null;
  private _missionManager: MissionManager = null;

  public clientReady: LiteEvent<void> = new LiteEvent<void>();
  public onPause: LiteEvent<void> = new LiteEvent<void>();

  public get renderer(): Renderer {
    return this._renderer;
  }

  public get engine(): Engine {
    return this._engine;
  }

  public get levelLoader(): LevelLoader {
    return this._levelLoader;
  }

  public get gravityPrediction(): GravityPrediction {
    return this._gravityPrediction;
  }

  public get shipManager(): ClientShipManager {
    return this._shipManager;
  }

  public get missionManager(): MissionManager {
    return this._missionManager;
  }

  public start(): void {
    if (this._engine !== null) {
      throw new Error('Double instance!');
    }

    this._engine = EngineBuilder.create();
    this._engine.addProcessor(new ControlProcessor(this._engine, this));

    this._levelLoader = new LevelLoader(this._engine);

    this._shipManager = new ClientShipManager(this._engine, this._levelLoader);
    this._shipManager.start();

    this._missionManager = new MissionManager(this._engine);
    this._missionManager.start();

    this._renderer = new Renderer();
    this._renderer.beforeAnimate.on(() => this._engine.process());

    this._engine.afterAddObject.on((o) => this._renderer.addObject(o.getRendererObject()));
    this._engine.afterRemoveObject.on((o) => this._renderer.removeObject(o.getRendererObject()));

    this._renderer.start();

    this._gravityPrediction = new GravityPrediction(this._engine);
    this._engine.afterProcess.on(() => this._gravityPrediction.predict(5, 0.03));
    this._renderer.addObject(new GravityPredictionRenderer(this._gravityPrediction));

    this.clientReady.trigger();
  }

  public pause(): void {
    this.onPause.trigger();
  }
}
