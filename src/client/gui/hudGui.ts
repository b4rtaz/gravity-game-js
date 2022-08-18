import * as c from '../client';
import * as r from '../renderer';
import * as so from '../../objects/shipObject';
import * as gcc from '../cameras/gameCameraCoordinator';

export class HudGui {
  private _client: c.Client;

  private _cockpit: HTMLElement;
  private _giroskop: HTMLCanvasElement;
  private _giroskopContext: CanvasRenderingContext2D;
  private _speed: HTMLElement;
  private _mainFuelFill: HTMLElement;
  private _mainFuelValue: HTMLElement;
  private _spinFuelFill: HTMLElement;
  private _spinFuelValue: HTMLElement;
  private _cameraButton: HTMLElement;

  protected get selectedShip(): so.ShipObject {
    return this._client.shipManager.selectedShip;
  }

  public constructor(client: c.Client) {
    this._client = client;
  }

  public start(): void {
    this._cockpit = document.getElementById('cockpit');
    this._giroskop = <HTMLCanvasElement> document.getElementById('giroskop');
    this._giroskopContext = this._giroskop.getContext('2d');
    this._speed = document.getElementById('speed');
    this._mainFuelFill = document.getElementById('mainFuelFill');
    this._mainFuelValue = document.getElementById('mainFuelValue');
    this._spinFuelFill = document.getElementById('spinFuelFill');
    this._spinFuelValue = document.getElementById('spinFuelValue');

    this._cameraButton = document.getElementById('cameraButton');
    this._cameraButton.addEventListener('click', (e) => this.onClickCameraButton(e), false);

    window.addEventListener('keydown', (e) => this.onKeyDown(e), false);

    window.setInterval(() => this.loop(), 150);
  }

  private changeCamera(): void {
    var camera: r.CameraCoordinator = this._client.renderer.cameraCoordinator;
    if (camera instanceof gcc.GameCameraCoordinator) {
      var cc = camera as gcc.GameCameraCoordinator;
      switch (cc.mode) {
        case gcc.GameCameraMode.Default:
          cc.mode = gcc.GameCameraMode.FallowUser;
          break;
        case gcc.GameCameraMode.FallowUser:
          cc.mode = gcc.GameCameraMode.Tpp;
          break;
          case gcc.GameCameraMode.Tpp:
            cc.mode = gcc.GameCameraMode.Default;
            break;
      }
    }
  }

  public onClickCameraButton(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.changeCamera();
  }

  public onKeyDown(e: KeyboardEvent): void {
    if (e.keyCode === 67 /* C */) {
      this.changeCamera();
    }
  }

  public loop(): void {
    if (this.selectedShip !== null) {
      this.showHud();
      this.renderHud();
    } else {
      this.hideHud();
    }
  }

  private showHud(): void {
    this._cockpit.style.display = 'block';
  }

  private hideHud(): void {
    this._cockpit.style.display = 'none';
  }

  private renderHud(): void {
    var shipObj = this.selectedShip;

    this._mainFuelValue.innerHTML = shipObj.mainEngineFuel.toFixed(2);
    this._mainFuelFill.style.width = (shipObj.mainEngineFuel / shipObj.mainEngineMaxFuel * 100) + '%';

    this._spinFuelValue.innerHTML = shipObj.spinEngineFuel.toFixed(2);
    this._spinFuelFill.style.width = (shipObj.spinEngineFuel / shipObj.spinEngineMaxFuel * 100) + '%';

    this._speed.innerHTML = shipObj.velocity.length().toFixed(2) + ' km/s';

    this.renderGiroskop();
  }

  private renderGiroskop(): void {
    var hw = this._giroskop.width / 2;

    this._giroskopContext.clearRect(0, 0, this._giroskop.width, this._giroskop.height);
    this._giroskopContext.strokeStyle = '#FFFFFF';
    this._giroskopContext.save();

    this._giroskopContext.translate(hw, hw);
    this._giroskopContext.rotate(-this.selectedShip.rotation.z);

    this._giroskopContext.beginPath();

    this._giroskopContext.moveTo(0, 0);
    this._giroskopContext.arc(0, 0, hw - 2, 0, Math.PI * 2);
    this._giroskopContext.stroke();

    this._giroskopContext.restore();
  }
}
