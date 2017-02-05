import e = require('./engine');
import gp = require('./gravityProcessor');
import sp = require('./shipProcessor');
import cp = require('./collideProcessor');

import asu = require('../updates/accelerateShipUpdate');
import rsu = require('../updates/rotateShipUpdate');
import ssu = require('../updates/stabilizeShipUpdate');
import cu = require('../updates/collideUpdate');

export class EngineBuilder {

  public static create(): e.Engine {
    var engine = new e.Engine();

    engine.addProcessor(new gp.GravityEngineProcessor(engine));
    engine.addProcessor(new sp.ShipProcessor(engine));
    engine.addProcessor(new cp.CollideProcessor(engine));

    engine.bindUpdate(new asu.AccelerateShipUpdateHandler(engine));
    engine.bindUpdate(new rsu.RotateShipUpdateHandler(engine));
    engine.bindUpdate(new ssu.StabilizeShipUpdateHandler(engine));
    engine.bindUpdate(new cu.CollideUpdateHandler(engine));

    return engine;
  }
}
