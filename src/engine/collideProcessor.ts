import * as e from './engine';
import * as cu from '../updates/collideUpdate';

export class CollideProcessor extends e.EngineProcessor {

  public load(): void {
  }

  public unload(): void {
  }

  public process(): void {
    let objects: Array<e.EngineObject> = this._engine.getObjects();
    let obj1: e.EngineObject;
    let obj2: e.EngineObject;
    let distance: number;

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        obj1 = objects[i];
        obj2 = objects[j];

        distance = obj1.position.clone().sub(obj2.position).length();
        if (distance <= obj1.radius + obj2.radius) {
          this._engine.pushUpdate(new cu.CollideUpdate(obj1.id, obj2.id));
        }
      }
    }
  }
}
