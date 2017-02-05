/// <reference path="../libs/three.d.ts"/>

import e = require('../engine/engine');
import r = require('../client/renderer');

export enum OrbType {
  Star,
  Planet
}

export class OrbObject extends e.EngineObject {
  private _renderer: r.RendererObject = null;

  public orbType: OrbType;

  public constructor(orbType: OrbType, radius: number, mass: number) {
    super();
    this.orbType = orbType;
    this.radius = radius;
    this.mass = mass;
  }

  public getRendererObject(): r.RendererObject {
    if (this._renderer === null) {
      if (this.orbType === OrbType.Planet) {
        this._renderer = new PlanetObjectRenderer(this);
      } else if (this.orbType === OrbType.Star) {
        this._renderer = new StarObjectRenderer(this);
      }
    }
    return this._renderer;
  }
}

export class PlanetObjectRenderer extends r.RendererObject {

  private _orb: OrbObject;
  private _groupMesh: THREE.Group;

  private _maxOrbit: number = null;
  private _texture: string = 'moon';

  public set maxOrbit(set: number) {
    this._maxOrbit = set;
  }

  public set texture(filename: string) {
    this._texture = filename;
  }

  public constructor(orb: OrbObject) {
    super();
    this._orb = orb;
  }

  public addToScene(scene: THREE.Scene): void {
    this._groupMesh = new THREE.Group();

    var planetGeometry = new THREE.SphereGeometry(this._orb.radius, 32, 32);
    var planetTexture = THREE.ImageUtils.loadTexture('./media/textures/' + this._texture + '.jpg');
  	var planetMaterial = new THREE.MeshLambertMaterial({
      map: planetTexture
    });

		var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    this._groupMesh.add(planetMesh);

    if (this._maxOrbit !== null) {
  		var arcShape = new THREE.Shape();
  		arcShape.moveTo(this._maxOrbit, 0);
  		arcShape.absarc(0, 0, this._maxOrbit, 0, Math.PI * 2, true);

      var points = arcShape.createPointsGeometry(16);
      var line = new THREE.Line(points, new THREE.LineBasicMaterial({
        color: 0xEA5000,
        linewidth: 1
      }));
      this._groupMesh.add(line);
    }

    scene.add(this._groupMesh);
  }

  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this._groupMesh);
  }

  public animate(): void {
    this._groupMesh.position.copy(this._orb.position);
    this._groupMesh.rotation.copy(this._orb.rotation);
  }
}

export class StarObjectRenderer extends r.RendererObject {

  private _orb: OrbObject;

  private _startLight: THREE.PointLight;
  private _glowShader: THREE.ShaderMaterial;
  private _glow: THREE.Mesh;
  private _maxOrbitLine: THREE.Line = null;

  private _maxOrbit: number = null;

  public set maxOrbit(set: number) {
    this._maxOrbit = set;
  }

  public constructor(orb: OrbObject) {
    super();
    this._orb = orb;
  }

  public addToScene(scene: THREE.Scene): void {

    // shadres from: http://stemkoski.github.io/Three.js/Shader-Glow.html
    var vs = ['uniform vec3 viewVector;',
              'uniform float c;',
              'uniform float p;',
              'varying float intensity;',
              'void main() ',
              '{',
              '  vec3 vNormal = normalize( normalMatrix * normal );',
              '  vec3 vNormel = normalize( normalMatrix * viewVector );',
              '  intensity = pow( c - dot(vNormal, vNormel), p );',
              '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
              '}'].join("\n");

    var fs = [
            'uniform vec3 glowColor;',
            'varying float intensity;',
            'void main() ',
            '{',
            '  vec3 glow = glowColor * intensity;',
            '  gl_FragColor = vec4( glow, 1.0 );',
            '}'].join("\n");

    var starGeometry = new THREE.SphereGeometry(this._orb.radius, 32, 32);
    var starMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFCCE,
      emissive: new THREE.Color(0xFFFCCE),
      emissiveIntensity: 1
    });

    // Point light
    this._startLight = new THREE.PointLight(0xFFFFFF, 1, 5000, 1);
    this._startLight.add(new THREE.Mesh(starGeometry, starMaterial));
    this._startLight.castShadow = true;
    scene.add(this._startLight);

    // Glow.
    this._glowShader = new THREE.ShaderMaterial({
      uniforms: {
        'c': { type: "f", value: 0.1 },
        'p': { type: "f", value: 2 },
        glowColor: { type: "c", value: new THREE.Color(0xFFFFFF) },
        viewVector: { type: "v3", value: new THREE.Vector3() }
      },
      vertexShader:   vs,
      fragmentShader: fs,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

  	var ballGeometry = new THREE.SphereGeometry(this._orb.radius * 1.3, 32, 32);
  	this._glow = new THREE.Mesh(ballGeometry, this._glowShader);
  	scene.add(this._glow);

    if (this._maxOrbit !== null) {
  		var arcShape = new THREE.Shape();
  		arcShape.moveTo(this._maxOrbit, 0);
  		arcShape.absarc(0, 0, this._maxOrbit, 0, Math.PI * 2, true);

      var points = arcShape.createPointsGeometry(16);
      this._maxOrbitLine = new THREE.Line(points, new THREE.LineBasicMaterial({
        color: 0xEA5000,
        linewidth: 1
      }));
      scene.add(this._maxOrbitLine);
    }
  }

  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this._startLight);
    scene.remove(this._glow);
    if (this._maxOrbitLine !== null) {
      scene.remove(this._maxOrbitLine);
    }
  }

  public animate(camera: THREE.Camera): void {
    this._startLight.position.copy(this._orb.position);
    this._glow.position.copy(this._orb.position);
    if (this._maxOrbitLine !== null) {
      this._maxOrbitLine.position.copy(this._orb.position);
    }

    this._glowShader.uniforms.viewVector.value =
    		new THREE.Vector3().subVectors(camera.position, this._glow.position);
  }
}
