import tg = require('./toasterGui');
import c = require('../client');
import e = require('../../engine/engine');
import le = require('../../engine/liteEvent');
import la = require('../levelsAccessor');
import csm = require('../clientShipManager');
import gcc = require('../cameras/gameCameraCoordinator');

enum TutorialStep {
  Begin = 1,
  Interf = 2,
  Cameras = 3,
  DefaultCamera = 4,
  FallowCamera = 5,
  TppCamera = 6,
  Accelerate = 7,
  BackAccelerate = 8,
  TurnLeft = 9,
  TurnRight = 10,
  Stablize = 11,
  Finish = 12,
  End = 13
}

export class TutorialGui {
  private _engine: e.Engine;
  private _shipManager: csm.ClientShipManager;
  private _gameCameraCoordinator: gcc.GameCameraCoordinator;
  private _toasterGui: tg.ToasterGui;
  private _tp: TutorialProcessor;
  private _step: TutorialStep;

  public onEnd: le.LiteEvent<void> = new le.LiteEvent<void>();

  public constructor(engine: e.Engine, shipManager: csm.ClientShipManager, gameCameraCoordinator: gcc.GameCameraCoordinator, toasterGui: tg.ToasterGui) {
    this._engine = engine;
    this._shipManager = shipManager;
    this._gameCameraCoordinator = gameCameraCoordinator;
    this._toasterGui = toasterGui;
    this._tp = new TutorialProcessor(this._engine);
  }

  public start(): void {
    this._engine.addProcessor(this._tp);
    this._step = TutorialStep.Begin;
    this.nextStep();
  }

  public stop(): void {
    this._engine.removeProcessor(this._tp);
  }

  private nextStep(): void {
    switch (this._step) {
      case TutorialStep.Begin:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Default;
        this._gameCameraCoordinator.z = 15;
        this._toasterGui.showMessageWithButton('Witaj w tutorialu!', 'Zebraliśmy się tutaj aby przeprowadzić podstawowy kurs sterowania satelitą. Jeżeli chcesz przerwać tutorial naduś klawisz [ESC].', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.Interf:
        this._toasterGui.showMessageWithButton('Interfejs', 'Na dole ekranu znajdziesz podstawowe informację o swojej satelicie, m.in. aktualną prędkość czy ilość paliwa w silnikach.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.Cameras:
        this._toasterGui.showMessageWithButton('Kamery', 'Dostępne są trzy kamery, które możesz zmienić za pomocą klawisza [C] albo przycisku u dołu ekranu.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.DefaultCamera:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Default;
        this._toasterGui.showMessageWithButton('Kamera domyślna', 'W trybie kamery domyślnej jej pozycję możesz zmienić klikając na ekran i przeciągając kamerę. Scrollem przybliżasz lub oddalasz kamerę.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.FallowCamera:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.FallowUser;
        this._toasterGui.showMessageWithButton('Kamera śledząca', 'W trybie kamery podążającej za statkiem możesz oddalać i przybliżać kamerę za pomocą scrolla.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.TppCamera:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Tpp;
        this._toasterGui.showMessageWithButton('Kamera widokowa', 'W trybie kamery widokowej kosmos wygląda najładniej.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.Accelerate:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Default;
        this._toasterGui.showMessageWithButton('Przyspieszanie', 'Aby przyspieszyć satelitę uruchom silnik za pomocą klawisza [W]. Każde użycie silnika spala paliwo.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.BackAccelerate:
        this._toasterGui.showMessageWithButton('Przyspieszanie przeciwne', 'Aby uruchomić silnik generujący ciąg w przeciwną stronę wciśnij [S].', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.TurnLeft:
        this._toasterGui.showMessageWithButton('Obrót w lewo', 'Aby wprawić satelitę w ruch obrotowy w lewą stronę uruchom boczny silnik przyciskiem [A].', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.TurnRight:
        this._toasterGui.showMessageWithButton('Obrót w prawo', 'Przyciskiem [D] uruchomisz boczny silnik z przeciwnym ciągiem.', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.Stablize:
        this._toasterGui.showMessageWithButton('Zatrzymanie obrotu', 'Aby zatrzymać obrót satelity możesz odpalać odpowiednio boczne silniki przyciskiem [A] lub [D], albo użyć systemu automatycznego zatrzymywania rotacji przyciskiem [Q].', 'Dalej', () => this.nextStep());
        break;
      case TutorialStep.Finish:
        this._toasterGui.showMessageWithButton('Koniec', 'Jeżeli zabraknie paliwa albo uznasz, że chcesz odbyć misję od nowa naduś przycisk [ESC] i załaduj ponownie misję.', 'Przejdź do menu', () => this.nextStep());
        break;
      case TutorialStep.End:
        this.onEnd.trigger();
        break;
    }
    this._step++;
  }
}

export class TutorialProcessor extends e.EngineProcessor {

  public load(): void {
  }

  public unload(): void {
  }

  public process(): void {
  }
}
