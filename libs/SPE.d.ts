
declare namespace SPE {

  export class Emitter {
    constructor(settings: any);

    public position: {
      value: THREE.Vector3,
      spread: THREE.Vector3
    };
    public velocity: {
      value: THREE.Vector3,
      spread: THREE.Vector3
    };
    public acceleration: {
      value: THREE.Vector3,
      spread: THREE.Vector3
    };
    public activeMultiplier: number;
  }

  export class Group {
    constructor(settings: any);

    mesh: THREE.Mesh;

    public addEmitter(e: Emitter);
    public tick(dt?: number);
  }
}
