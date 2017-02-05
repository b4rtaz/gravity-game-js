import r = require('./renderer');
import gpr = require('./gravityPrediction');

export class GravityPredictionRenderer extends r.RendererObject {

  private _prediction: gpr.GravityPrediction;

  private _dots: {[objId: number]: [THREE.Geometry, THREE.Points];} = {};
  private _scene: THREE.Scene = null;

  public constructor(prediction: gpr.GravityPrediction) {
    super();
    this._prediction = prediction;
    this._prediction.includedObject.on((id) => this.includedObject(id));
    this._prediction.excludedObject.on((id) => this.excludedObject(id));
  }

  public includedObject(objId: number): void {
    if (this._scene === null) {
      throw new Error('Scene not found.');
    }

    var geometry = new THREE.Geometry();
    geometry.vertices = [];
    var material = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: false,
      color: 0xFFFCCE
    });
    var points = new THREE.Points(geometry, material);
    points.frustumCulled = false;

    this._dots[objId] = [geometry, points];
    this._scene.add(points);
  }

  public excludedObject(objId: number): void {
    this._scene.remove(this._dots[objId][1]);
    delete this._dots[objId];
  }

  public addToScene(scene: THREE.Scene): void {
    this._scene = scene;
  }

  public removeFromScene(scene: THREE.Scene): void {
    this._scene = null;
  }

  public animate(): void {
    var groups = this._prediction.prediction;

    for (var objId in groups) {
      var geometry: THREE.Geometry = this._dots[objId][0];
      geometry.vertices = groups[objId];
      geometry.verticesNeedUpdate = true;
    }
  }
}
