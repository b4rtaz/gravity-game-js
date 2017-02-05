import e = require('./engine');

export class GravityEngineProcessor extends e.EngineProcessor {

  private _processor: GravityProcessor = new GravityProcessor();

  public load(): void {
  }

  public unload(): void {
  }

  public process(): void {
    var objects = this._engine.getObjects();
    this._processor.process(objects, this._engine.deltaTime);
  }
}

export class GravityProcessor {

  public process(objects: Array<e.EngineObject>, deltaTime: number): void {
    var ax;
    var ay;
    var r;
    var rx;
    var ry;
    var r3;

    for (let obj1 of objects) {
      ax = 0;
      ay = 0;

      for (let obj2 of objects) {
        if (obj1 == obj2 || obj1.ignoreGravity || obj2.ignoreGravity) continue;

        rx = obj1.position.x - obj2.position.x;
        ry = obj1.position.y - obj2.position.y;
        r = Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2));
        r3 = Math.pow(r, 3);

        ax -= (obj2.mass * rx) / r3;
        ay -= (obj2.mass * ry) / r3;
      }

      obj1.velocity.x += ax * deltaTime;
      obj1.velocity.y += ay * deltaTime;
    }

    for (let obj of objects) {
      obj.position.x += obj.velocity.x * deltaTime;
      obj.position.y += obj.velocity.y * deltaTime;

      if (
        //obj1.angularVelocity.x !== 0 ||
        //obj1.angularVelocity.y !== 0 ||
        obj.angularVelocity.z !== 0) {
        //obj1.rotation.x += obj1.angularVelocity.x * this._engine.deltaTime;
        //obj1.rotation.y += obj1.angularVelocity.y * this._engine.deltaTime;
        obj.rotation.z += obj.angularVelocity.z * deltaTime;
      }
    }
  }
}

export class OrbitCalculator {

  public static calculateOrbit(orb: e.EngineObject, target: e.EngineObject, radius, angle) {
    var way = (angle < 0 ? -1 : 1);
    var velocity = Math.sqrt(orb.mass / radius) * way;

    target.velocity.x = velocity * Math.cos(angle + Math.PI / 2);
    target.velocity.y = velocity * Math.sin(angle + Math.PI / 2);

    if (orb.velocity.length() > 0) {
      target.velocity.x += orb.velocity.x;
      target.velocity.y += orb.velocity.y;
    }

    target.position.x = orb.position.x - Math.cos(angle) * radius;
    target.position.y = orb.position.y - Math.sin(angle) * radius;
  }
}
