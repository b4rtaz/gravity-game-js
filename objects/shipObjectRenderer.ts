/// <reference path="../libs/three.d.ts"/>
/// <reference path="../libs/SPE.d.ts"/>

import e = require('../engine/engine');
import r = require('../client/renderer');
import so = require('./shipObject');

export class ShipObjectRenderer extends r.RendererObject {

  private _ship: so.ShipObject;
  private _shipGroup: THREE.Group;
  private _circle: THREE.Line;

  private _speGroup: SPE.Group;
  private _speAccelerateEmiter: SPE.Emitter = null;
  private _speLeftRotateEmiter: SPE.Emitter = null;
  private _speRightRotateEmiter: SPE.Emitter = null;

  private _circleScale: number = null;

  public set circleScale(scale: number) {
    this._circleScale = scale;
  }

  public constructor(ship: so.ShipObject) {
    super();
    this._ship = ship;
  }

  public addToScene(scene: THREE.Scene): void {
    this.addSatelite(scene);
    this.addEmitter(scene);
  }

  private addSatelite(scene: THREE.Scene): void {
    this._shipGroup = new THREE.Group();

    var shipGeometry = new THREE.BoxGeometry(this._ship.radius * 0.2, this._ship.radius * 0.2, this._ship.radius * 0.1);
    var shipMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFC40F,
      shininess: 300,
      specular: 0x33AA33,
      shading: THREE.SmoothShading
    });

    var sateliteGeometry = new THREE.BoxGeometry(this._ship.radius * 0.01, this._ship.radius * 0.4, this._ship.radius * 0.2);
    var sateliteMaterial = new THREE.MeshLambertMaterial({
      color: 0x00D3EA
    });

    var shipMesh = new THREE.Mesh(shipGeometry, shipMaterial);
    shipMesh.position.set(0, 0, 0);

    var leftSateliteMesh = new THREE.Mesh(sateliteGeometry, sateliteMaterial);
    leftSateliteMesh.position.set(0, -this._ship.radius * (0.1 + 0.2), 0);

    var rightSateliteMesh = new THREE.Mesh(sateliteGeometry, sateliteMaterial);
    rightSateliteMesh.position.set(0, this._ship.radius * (0.1 + 0.2), 0);

    var engineGeometry = new THREE.CylinderGeometry(this._ship.radius * 0.05, this._ship.radius * 0.1, this._ship.radius * 0.1, 32);
    var engineMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B8B8B,
      shininess: 300,
      specular: 0x31B229,
      shading: THREE.SmoothShading
    });
    var engineMesh = new THREE.Mesh(engineGeometry, engineMaterial);
    engineMesh.position.x = -this._ship.radius * (0.05 + 0.1);
    engineMesh.rotation.z = -Math.PI / 2;
    this._shipGroup.add(engineMesh);

    var circleRadius = this._ship.radius * 1.25;
    var circleShape = new THREE.Shape();
    circleShape.moveTo(circleRadius, 0);
    circleShape.absarc(0, 0, circleRadius, 0, Math.PI * 2, true);
    circleShape.moveTo(circleRadius * 1.5, 0);

    var circlePoints = circleShape.createPointsGeometry(20);
    this._circle = new THREE.Line(circlePoints, new THREE.LineBasicMaterial({
      color: 0x00D3EA,
      linewidth: 1
    }));
    //this._circle.position.set(0, 0, 0);

    this._shipGroup.add(shipMesh);
    this._shipGroup.add(leftSateliteMesh);
    this._shipGroup.add(rightSateliteMesh);
    this._shipGroup.add(this._circle);

    scene.add(this._shipGroup);
  }

  private addEmitter(scene: THREE.Scene): void {
    this._speGroup = new SPE.Group({
  		texture: {
        value: THREE.ImageUtils.loadTexture('./media/textures/smokeparticle.png')
      }
  	});

    this._speAccelerateEmiter = new SPE.Emitter({
      maxAge: { value: 1 },
      velocity: {
        value: new THREE.Vector3(0, 25, 0),
        spread: new THREE.Vector3(4, 7.5, 0)
      },
      color: {
        value: [ new THREE.Color(0xFFFFFF) ]
      },
      size: { value: 0.5 },
      particleCount: 2000,
      activeMultiplier: 0
    });

    let rotateConfig = {
      maxAge: { value: 0.2 },
      position: {
        spread: new THREE.Vector3(0, 0, 0)
      },
      acceleration: {
        spread: new THREE.Vector3(1, 0, 1)
      },
      velocity: {
        spread: new THREE.Vector3(1, 7.5, 1)
      },
      color: {
        value: [ new THREE.Color(0xFFFFFF) ]
      },
      size: { value: 0.5 },
      particleCount: 100,
      activeMultiplier: 0
    };
    this._speLeftRotateEmiter = new SPE.Emitter(rotateConfig);
    this._speRightRotateEmiter = new SPE.Emitter(rotateConfig);

    this._speGroup.addEmitter(this._speAccelerateEmiter);
    this._speGroup.addEmitter(this._speLeftRotateEmiter);
    this._speGroup.addEmitter(this._speRightRotateEmiter);
    this._speGroup.mesh.frustumCulled = false;
    scene.add(this._speGroup.mesh);
  }

  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this._shipGroup);
    scene.remove(this._speGroup.mesh);
  }

  private enableEmmiter(emmiter: SPE.Emitter, velocity: number, angleDelta: number): void {
    let angle: number = this._ship.rotation.z + angleDelta;
    let angleCos = Math.cos(angle);
    let angleSin = Math.sin(angle);

    emmiter.position.value = this._ship.position;
    emmiter.velocity.value = new THREE.Vector3(angleCos * velocity, angleSin * velocity, 0);
    emmiter.acceleration.value = new THREE.Vector3(angleCos * velocity, angleSin * velocity, 0);
    emmiter.activeMultiplier = 1;
  }

  private disableEmmiter(emmiter: SPE.Emitter) {
    emmiter.activeMultiplier = 0;
  }

  public animate(): void {
    if (this._ship.accelerate !== 0) {
      this.enableEmmiter(this._speAccelerateEmiter, 10, this._ship.accelerate === 1 ? Math.PI : 0);
    } else {
      this.disableEmmiter(this._speAccelerateEmiter);
    }

    if (this._ship.stabilize) {
      this.enableEmmiter(this._speLeftRotateEmiter, 5, -Math.PI / 2);
      this.enableEmmiter(this._speRightRotateEmiter, 5, Math.PI / 2);
    } else if (this._ship.rotate === 1) {
      this.enableEmmiter(this._speLeftRotateEmiter, 5, -Math.PI / 2);
      this.disableEmmiter(this._speRightRotateEmiter);
    } else if (this._ship.rotate === -1) {
      this.enableEmmiter(this._speRightRotateEmiter, 5, Math.PI / 2);
      this.disableEmmiter(this._speLeftRotateEmiter);
    } else {
      this.disableEmmiter(this._speLeftRotateEmiter);
      this.disableEmmiter(this._speRightRotateEmiter);
    }

    if (this._circleScale !== null) {
      this._circle.scale.setScalar(this._circleScale);
      this._circleScale = null;
    }

    this._speGroup.tick();
    this._shipGroup.position.copy(this._ship.position);
    this._shipGroup.rotation.copy(this._ship.rotation);
  }
}
