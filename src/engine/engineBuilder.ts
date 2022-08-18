import { AccelerateShipUpdateHandler } from "../updates/accelerateShipUpdate";
import { CollideUpdateHandler } from "../updates/collideUpdate";
import { RotateShipUpdateHandler } from "../updates/rotateShipUpdate";
import { StabilizeShipUpdateHandler } from "../updates/stabilizeShipUpdate";
import { CollideProcessor } from "./collideProcessor";
import { Engine } from "./engine";
import { GravityEngineProcessor } from "./gravityProcessor";
import { ShipProcessor } from "./shipProcessor";

export class EngineBuilder {

  public static create(): Engine {
    var engine = new Engine();

    engine.addProcessor(new GravityEngineProcessor(engine));
    engine.addProcessor(new ShipProcessor(engine));
    engine.addProcessor(new CollideProcessor(engine));

    engine.bindUpdate(new AccelerateShipUpdateHandler(engine));
    engine.bindUpdate(new RotateShipUpdateHandler(engine));
    engine.bindUpdate(new StabilizeShipUpdateHandler(engine));
    engine.bindUpdate(new CollideUpdateHandler(engine));

    return engine;
  }
}
