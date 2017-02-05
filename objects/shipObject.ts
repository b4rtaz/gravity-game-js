import e = require('../engine/engine');
import r = require('../client/renderer');
import sor = require('./shipObjectRenderer');

export class ShipObject extends e.EngineObject {

  public mainEngineMaxFuel: number = 100;
  public mainEngineFuel: number = this.mainEngineMaxFuel;
  public mainEngineAcceleration: number = 5;

  public spinEngineMaxFuel: number = 40;
  public spinEngineFuel: number = this.spinEngineMaxFuel;
  public spinEngineAcceleration: number = 2;

  public accelerate: number = 0;
  public rotate: number = 0;
  public stabilize: boolean = false;

  private _renderer: r.RendererObject = null;

  public constructor(radius: number, mass: number) {
    super();
    this.radius = radius;
    this.mass = mass;
  }

  public getRendererObject(): r.RendererObject {
    return this._renderer || (this._renderer = new sor.ShipObjectRenderer(this));
  }
}
