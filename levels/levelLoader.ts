import e = require('../engine/engine');
import le = require('../engine/liteEvent');
import gp = require('../engine/gravityProcessor');

import so = require('../objects/shipObject');
import oo = require('../objects/orbObject');

import osmp = require('./missions/orbitShipMissionProcessor');
import vmp = require('./missions/velocityMissionProcessor');

export class LevelLoader {
  private _engine: e.Engine;
  private _currentLevel: Level = null;
  private _currentLevelName: string = null;

  public levelChanged: le.LiteEvent<string> = new le.LiteEvent<string>();

  public constructor(engine: e.Engine) {
    this._engine = engine;
  }

  private getLevelByName(levelName: string): Level {
    switch (levelName) {
      case 'demo': return new DemoLevel(this._engine);
      case 'tutorial': return new TutorialLevel(this._engine);
      case 'zeroVelocity': return new ZeroVelocityLevel(this._engine);
      case 'zeroAngular': return new ZeroAngularLevel(this._engine);
      case 'zeroVelocityAndAngular': return new ZeroVelocityAndAngularLevel(this._engine);
      case 'fifty': return new FiftyLevel(this._engine);
      case 'begin': return new BeginLevel(this._engine);
      case 'firstOrbit': return new FirstOrbitLevel(this._engine);
      case 'seriousOrbit': return new SeriousOrbitLevel(this._engine);
      case 'moonOrbit': return new MoonOrbitLevel(this._engine);
      case 'highGravity': return new HighGravityLevel(this._engine);
      case 'twoStars': return new TwoStarsLevel(this._engine);
    }
    throw new Error('Unknow level: ' + levelName);
  }

  public loadLevel(levelName: string): void {
    if (this._currentLevel !== null) {
      this.unloadLevel();
    }
    this._currentLevel = this.getLevelByName(levelName);
    this._currentLevel.load();
    this._currentLevelName = levelName;
    this.levelChanged.trigger(levelName);
    console.debug('Loaded level: ' + levelName);
  }

  public getLevelName(): string {
    return this._currentLevelName;
  }

  public getLevel(): Level {
    return this._currentLevel;
  }

  public unloadLevel(): void {
    if (this._currentLevel !== null) {
      this._currentLevel.unload();
      this._currentLevel = null;
      this._currentLevelName = null;
      this.levelChanged.trigger(null);
      console.debug('Level unloaded.');
    }
  }
}

export abstract class Level {
  protected _engine: e.Engine;
  protected _idCounter: number = 1;

  public constructor(engine: e.Engine) {
    this._engine = engine;
  }

  public abstract load(): void;
  public abstract unload(): void;
  public abstract addUser(): so.ShipObject;

  protected createUserShip(): so.ShipObject {
    var ship = new so.ShipObject(1, 1);
    ship.id = this._idCounter++;
    this._engine.addObject(ship);
    return ship;
  }
}

export class DemoLevel extends Level {

  public load(): void {
    var star = new oo.OrbObject(oo.OrbType.Star, 5, 50000);
    star.id = this._idCounter++;
    this._engine.addObject(star);

    var planet1 = new oo.OrbObject(oo.OrbType.Planet, 2, 200);
    planet1.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(star, planet1, 40, -10);
    this._engine.addObject(planet1);

    var planet2 = new oo.OrbObject(oo.OrbType.Planet, 1, 50);
    planet2.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(star, planet2, 25, Math.PI);
    this._engine.addObject(planet2);

    var planet3 = new oo.OrbObject(oo.OrbType.Planet, 0.3, 50);
    planet3.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(star, planet3, 15, Math.PI);
    this._engine.addObject(planet3);
  }

  public unload(): void {
    this._engine.removeAll();
  }

  public addUser(): so.ShipObject {
    return null;
  }
}

export class TutorialLevel extends Level {
  public load(): void {
    var star: oo.OrbObject = new oo.OrbObject(oo.OrbType.Star, 10, 10);
    star.position = new THREE.Vector3(100, 100, 0);
    star.id = this._idCounter++;
    this._engine.addObject(star);
  }

  public unload(): void {
    this._engine.removeAll();
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    return ship;
  }
}

export class ZeroVelocityLevel extends Level {
  private _mission: vmp.VelocityMissionProcessor;

  public load(): void {
    var star: oo.OrbObject = new oo.OrbObject(oo.OrbType.Star, 10, 10);
    star.position = new THREE.Vector3(100, 100, 0);
    star.id = this._idCounter++;
    this._engine.addObject(star);

    this._mission = new vmp.VelocityMissionProcessor(this._engine,
      vmp.VelocityMissionType.Less, 0.1,
      vmp.VelocityMissionType.Skip, null);
    this._engine.addProcessor(this._mission);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._mission);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.velocity.x = 5;
    ship.velocity.y = 0;
    return ship;
  }
}

export class ZeroAngularLevel extends Level {
  private _mission: vmp.VelocityMissionProcessor;

  public load(): void {
    var star: oo.OrbObject = new oo.OrbObject(oo.OrbType.Star, 10, 10);
    star.position = new THREE.Vector3(100, -100, 0);
    star.id = this._idCounter++;
    this._engine.addObject(star);

    this._mission = new vmp.VelocityMissionProcessor(this._engine,
      vmp.VelocityMissionType.Skip, null,
      vmp.VelocityMissionType.Less, 0.05);
    this._engine.addProcessor(this._mission);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._mission);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.spinEngineFuel *= 0.1;
    ship.angularVelocity.z = 1.5;
    return ship;
  }
}

export class ZeroVelocityAndAngularLevel extends Level {
  private _mission: vmp.VelocityMissionProcessor;

  public load(): void {
    var star: oo.OrbObject = new oo.OrbObject(oo.OrbType.Star, 10, 10);
    star.position = new THREE.Vector3(-100, 100, 0);
    star.id = this._idCounter++;
    this._engine.addObject(star);

    this._mission = new vmp.VelocityMissionProcessor(this._engine,
      vmp.VelocityMissionType.Less, 0.1,
      vmp.VelocityMissionType.Less, 0.05);
    this._engine.addProcessor(this._mission);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._mission);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.spinEngineFuel *= 0.3;
    ship.mainEngineFuel *= 0.3;
    ship.angularVelocity.z = -1.5;
    ship.velocity.x = 1.5;
    ship.velocity.y = -1.5;
    return ship;
  }
}

export class FiftyLevel extends Level {
  private _star: oo.OrbObject;
  private _mission: vmp.VelocityMissionProcessor;

  public load(): void {
    this._star = new oo.OrbObject(oo.OrbType.Star, 8, 25000);
    this._star.id = this._idCounter++;
    this._star.position = new THREE.Vector3(100, 100);
    this._engine.addObject(this._star);

    this._mission = new vmp.VelocityMissionProcessor(this._engine,
      vmp.VelocityMissionType.Greater, 50,
      vmp.VelocityMissionType.Skip, null);
    this._engine.addProcessor(this._mission);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._mission);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.mainEngineFuel *= 0.15;
    ship.spinEngineFuel *= 0.25;
    gp.OrbitCalculator.calculateOrbit(this._star, ship, 100, 0);
    return ship;
  }
}

export class BeginLevel extends Level {
  private _missionProcessor: osmp.OrbitShipMissionProcessor;
  private _planet: oo.OrbObject;

  public load(): void {
    var maxOrbit: number = 19;

    this._planet = new oo.OrbObject(oo.OrbType.Planet, 8, 6000);
    this._planet.id = this._idCounter++;
    this._planet.angularVelocity.z = -1;

    var p3Renderer = this._planet.getRendererObject() as oo.PlanetObjectRenderer;
    p3Renderer.maxOrbit = maxOrbit;
    p3Renderer.texture = 'jupiter';
    this._engine.addObject(this._planet);

    var star: oo.OrbObject = new oo.OrbObject(oo.OrbType.Star, 2, 10);
    star.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(this._planet, star, 100, -0.01);
    this._engine.addObject(star);

    this._missionProcessor = new osmp.OrbitShipMissionProcessor(this._engine, this._planet, osmp.OrbitShipMissionType.Less, maxOrbit, 1);
    this._engine.addProcessor(this._missionProcessor);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._missionProcessor);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.mainEngineFuel *= 0.5;
    ship.spinEngineFuel *= 0.5;
    gp.OrbitCalculator.calculateOrbit(this._planet, ship, 30, Math.PI / 2);
    return ship;
  }
}

export class FirstOrbitLevel extends Level {
  private _missionProcessor: osmp.OrbitShipMissionProcessor;

  public load(): void {
    var maxOrbit: number = 45;

    var star = new oo.OrbObject(oo.OrbType.Star, 20, 40000);
    star.id = this._idCounter++;

    var sRenderer = star.getRendererObject() as oo.StarObjectRenderer;
    sRenderer.maxOrbit = maxOrbit;
    this._engine.addObject(star);

    this._missionProcessor = new osmp.OrbitShipMissionProcessor(this._engine, star, osmp.OrbitShipMissionType.Less, maxOrbit, 1);
    this._engine.addProcessor(this._missionProcessor);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._missionProcessor);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.position.x = -250;
    ship.position.y = -250;
    ship.velocity.x = 2;
    ship.velocity.y = 18;
    return ship;
  }
}

export class SeriousOrbitLevel extends Level {
  private _missionProcessor: osmp.OrbitShipMissionProcessor;
  private _star: oo.OrbObject;

  public load(): void {
    var maxOrbit: number = 45;

    this._star = new oo.OrbObject(oo.OrbType.Star, 30, 70000);
    this._star.id = this._idCounter++;
    this._engine.addObject(this._star);

    var planet = new oo.OrbObject(oo.OrbType.Planet, 8, 6000);
    planet.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(this._star, planet, 350, 0);

    var pRenderer = planet.getRendererObject() as oo.PlanetObjectRenderer;
    pRenderer.maxOrbit = maxOrbit;
    pRenderer.texture = 'jupiter';
    this._engine.addObject(planet);

    var planet2 = new oo.OrbObject(oo.OrbType.Planet, 3, 1500);
    planet2.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(this._star, planet2, 120, Math.PI);
    this._engine.addObject(planet2);

    this._missionProcessor = new osmp.OrbitShipMissionProcessor(this._engine, planet, osmp.OrbitShipMissionType.Less, maxOrbit, 1);
    this._engine.addProcessor(this._missionProcessor);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._missionProcessor);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    gp.OrbitCalculator.calculateOrbit(this._star, ship, 50, Math.PI / 2);
    return ship;
  }
}

export class MoonOrbitLevel extends Level {
  private _missionProcessor: osmp.OrbitShipMissionProcessor;
  private _star: oo.OrbObject;
  private _jupiter: oo.OrbObject;

  public load(): void {
    var maxOrbit: number = 45;

    this._star = new oo.OrbObject(oo.OrbType.Star, 30, 800000);
    this._star.id = this._idCounter++;
    this._engine.addObject(this._star);

    this._jupiter = new oo.OrbObject(oo.OrbType.Planet, 8, 15000);
    this._jupiter.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(this._star, this._jupiter, 400, Math.PI + 2);

    var jRenderer = this._jupiter.getRendererObject() as oo.PlanetObjectRenderer;
    jRenderer.texture = 'jupiter';
    this._engine.addObject(this._jupiter);

    var saturn = new oo.OrbObject(oo.OrbType.Planet, 8, 80000);
    saturn.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(this._star, saturn, 1200, Math.PI);
    this._engine.addObject(saturn);

    var saturnMoon = new oo.OrbObject(oo.OrbType.Planet, 4, 12000);
    saturnMoon.id = this._idCounter++;
    gp.OrbitCalculator.calculateOrbit(saturn, saturnMoon, 150, Math.PI);

    var smRenderer = saturnMoon.getRendererObject() as oo.PlanetObjectRenderer;
    smRenderer.maxOrbit = maxOrbit;
    this._engine.addObject(saturnMoon);

    this._missionProcessor = new osmp.OrbitShipMissionProcessor(this._engine, saturnMoon, osmp.OrbitShipMissionType.Less, maxOrbit, 1);
    this._engine.addProcessor(this._missionProcessor);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._missionProcessor);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    ship.mainEngineMaxFuel *= 2;
    ship.mainEngineFuel *= 2;
    gp.OrbitCalculator.calculateOrbit(this._jupiter, ship, 30, 0);
    return ship;
  }
}

export class HighGravityLevel extends Level {
  private _star: oo.OrbObject;
  private _missionProcessor: osmp.OrbitShipMissionProcessor;

  public load(): void {
    var minOrbit: number = 150;

    this._star = new oo.OrbObject(oo.OrbType.Star, 15, 1200000);
    this._star.id = this._idCounter++;

    var sRenderer = this._star.getRendererObject() as oo.PlanetObjectRenderer;
    sRenderer.maxOrbit = minOrbit;
    this._engine.addObject(this._star);

    for (var i = 0; i < 4; i++) {
      var planet = new oo.OrbObject(oo.OrbType.Planet, 2, 100);
      planet.id = this._idCounter++;
      gp.OrbitCalculator.calculateOrbit(this._star, planet, 100 + (i * 20), (i / 5) * (Math.PI * 2));
      this._engine.addObject(planet);
    }

    this._missionProcessor = new osmp.OrbitShipMissionProcessor(this._engine, this._star, osmp.OrbitShipMissionType.Greater, minOrbit, 1);
    this._engine.addProcessor(this._missionProcessor);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._missionProcessor);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    gp.OrbitCalculator.calculateOrbit(this._star, ship, 70, -0.1);
    return ship;
  }
}

export class TwoStarsLevel extends Level {
  private _star1: oo.OrbObject;
  private _star2: oo.OrbObject;
  private _missionProcessor: osmp.OrbitShipMissionProcessor;

  public load(): void {
    var maxOrbit: number = 20;

    this._star1 = new oo.OrbObject(oo.OrbType.Star, 8, 80000);
    this._star1.id = this._idCounter++;
    this._engine.addObject(this._star1);

    this._star2 = new oo.OrbObject(oo.OrbType.Star, 6, 60000);
    this._star2.id = this._idCounter++;
    this._star2.velocity.y = -3;
    this._engine.addObject(this._star2);

    gp.OrbitCalculator.calculateOrbit(this._star1, this._star2, 40, 0);

    var planet = new oo.OrbObject(oo.OrbType.Planet, 3, 15000);
    planet.id = this._idCounter++;
    this.calculateOrbitForStars(planet, 220, 0);

    var pRenderer = planet.getRendererObject() as oo.PlanetObjectRenderer;
    pRenderer.maxOrbit = maxOrbit;
    this._engine.addObject(planet);

    this._missionProcessor = new osmp.OrbitShipMissionProcessor(this._engine, planet, osmp.OrbitShipMissionType.Less, maxOrbit, 1);
    this._engine.addProcessor(this._missionProcessor);
  }

  private calculateOrbitForStars(obj: e.EngineObject, radius: number, angle: number): void {
    var vs = new oo.OrbObject(oo.OrbType.Star, 1, this._star1.mass + this._star2.mass)
    vs.position.x = (this._star1.position.x + this._star2.position.x) / 2;
    vs.position.y = (this._star1.position.y + this._star2.position.y) / 2;
    vs.velocity.x = (this._star1.velocity.x + this._star2.velocity.x) / 2;
    vs.velocity.y = (this._star1.velocity.y + this._star2.velocity.y) / 2;

    gp.OrbitCalculator.calculateOrbit(vs, obj, radius, angle);
  }

  public unload(): void {
    this._engine.removeAll();
    this._engine.removeProcessor(this._missionProcessor);
  }

  public addUser(): so.ShipObject {
    var ship: so.ShipObject = this.createUserShip();
    this.calculateOrbitForStars(ship, 50, 0);
    return ship;
  }
}
