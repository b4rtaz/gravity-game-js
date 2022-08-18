import * as c from '../client';
import * as la from '../levelsAccessor';

import * as wg from './welcomeGui';
import * as hg from './hudGui';
import * as trg from './toasterGui';
import * as tg from './tutorialGui';

import * as dcc from '../cameras/demoCameraCoordinator';
import * as gcc from '../cameras/gameCameraCoordinator';

export class Gui {
  private _client: c.Client;
  private _levelsAccessor: la.LevelAccessor;

  private _welcomeGui: wg.WelcomeGui;
  private _hudGui: hg.HudGui;
  private _toasterGui: trg.ToasterGui;
  private _tutorialGui: tg.TutorialGui;

  private _gameCameraCoordinator: gcc.GameCameraCoordinator;

  public constructor(client: c.Client) {
    this._client = client;
  }

  public start(): void {
    this._client.onPause.on(() => this.onPause());
    this._client.levelLoader.levelChanged.on((ln) => this.onLevelChanged(ln));
    this._client.shipManager.onAllShipsDestroyed.on(() => this.onAllShipsDestroyed());
    this._client.missionManager.onMissionCmplete.on(() => this.onMissionComplete());

    this._levelsAccessor = new la.LevelAccessor();

    this._welcomeGui = new wg.WelcomeGui(this._levelsAccessor);
    this._welcomeGui.levelChoosed.on((ln) => this.onLevelChoosedFromGui(ln));
    this._welcomeGui.start();

    this._hudGui = new hg.HudGui(this._client);
    this._hudGui.start();

    this._toasterGui = new trg.ToasterGui();
    this._toasterGui.start();

    this._gameCameraCoordinator = new gcc.GameCameraCoordinator(this._client.shipManager);

    this._tutorialGui = new tg.TutorialGui(this._client.engine, this._client.shipManager, this._gameCameraCoordinator, this._toasterGui);
    this._tutorialGui.onEnd.on(() => this.onPause());

    this.showLevelMenu();
  }

  private onLevelChoosedFromGui(levelName: string): void {
    this._client.levelLoader.loadLevel(levelName);
    this._welcomeGui.hide();
  }

  private onLevelChanged(levelName: string) {
    if (levelName === 'demo') {
      this._client.renderer.cameraCoordinator = new dcc.DemoCameraCoordinator();
    } else {
      if (levelName === 'tutorial') {
        this._tutorialGui.start();
      }
      this._client.missionManager.enabled = true;
      this._client.renderer.cameraCoordinator = this._gameCameraCoordinator;
    }
  }

  private onPause(): void {
    this._toasterGui.hide();
    this.showLevelMenu();
  }

  private onAllShipsDestroyed(): void {
    this._client.missionManager.enabled = false;
    this._toasterGui.showFullscreenMessage('The mission failed.', 2000, () => {
      this._client.missionManager.enabled = true;
      this.showLevelMenu();
    });
  }

  private onMissionComplete(): void {
    this._client.missionManager.enabled = false;
    this._levelsAccessor.setLevelDone(this._client.levelLoader.getLevelName());

    this._toasterGui.showMessageWithButton('Mission accomplished!', null, 'Continue', () => {
      this._client.missionManager.enabled = true;
      this.showLevelMenu();
    });
  }

  private showLevelMenu() {
    this._client.levelLoader.loadLevel('demo');
    this._welcomeGui.show();
  }
}
