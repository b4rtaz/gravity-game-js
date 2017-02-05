import r = require('../renderer');

export class DemoCameraCoordinator extends r.CameraCoordinator {

  public load(camera: THREE.PerspectiveCamera): void {
    camera.position.x = 10;
    camera.position.y = 30;
    camera.position.z = 30;
    camera.up = new THREE.Vector3(0, -10000, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  public unload(): void {
  }

  public animate(camera: THREE.PerspectiveCamera) {
  }
}
