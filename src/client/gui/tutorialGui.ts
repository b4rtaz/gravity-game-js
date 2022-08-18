import * as tg from './toasterGui';
import * as e from '../../engine/engine';
import * as le from '../../engine/liteEvent';
import * as csm from '../clientShipManager';
import * as gcc from '../cameras/gameCameraCoordinator';

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
        this._toasterGui.showMessageWithButton('Welcome to the tutorial!', 'We have gathered here to give you a basic course in satellite control. If you want to stop the tutorial press the [ESC] key.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.Interf:
        this._toasterGui.showMessageWithButton('Interface', 'At the bottom of the screen, you\'ll find basic information about your satellite, including the current speed or the amount of fuel in the engines.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.Cameras:
        this._toasterGui.showMessageWithButton('Cameras', 'There are three cameras available, which you can change with either the [C] key or the button at the bottom of the screen.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.DefaultCamera:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Default;
        this._toasterGui.showMessageWithButton('Default camera', 'In default camera mode, you can change its position by clicking on the screen and dragging the camera. Use the scroll to zoom in or out of the camera.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.FallowCamera:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.FallowUser;
        this._toasterGui.showMessageWithButton('Tracking camera', 'In camera mode following the ship, you can zoom in and out with the scroller.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.TppCamera:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Tpp;
        this._toasterGui.showMessageWithButton('Viewing camera', 'In view camera mode, the space looks the prettiest.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.Accelerate:
        this._gameCameraCoordinator.mode = gcc.GameCameraMode.Default;
        this._toasterGui.showMessageWithButton('Accelerate', 'To accelerate the satellite, start the engine with the [W] key. Each use of the engine burns fuel.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.BackAccelerate:
        this._toasterGui.showMessageWithButton('Opposite acceleration', 'To start the engine generating thrust in the opposite direction press the [S] key.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.TurnLeft:
        this._toasterGui.showMessageWithButton('Left turn', 'To make the satellite rotate to the left, start the side motor with the [A] key.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.TurnRight:
        this._toasterGui.showMessageWithButton('Right turn', 'Use the [D] key to start the side engine with the opposite thrust.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.Stablize:
        this._toasterGui.showMessageWithButton('Stopping rotation', 'To stop the satellite\'s rotation, you can fire the side engines with the [A] or [D] key, respectively, or use the automatic rotation stop system with the [Q] key.', 'Continue', () => this.nextStep());
        break;
      case TutorialStep.Finish:
        this._toasterGui.showMessageWithButton('The end', 'If you run out of fuel or decide you want to do the mission all over again press the [ESC] key and reload the mission.', 'Finish', () => this.nextStep());
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
