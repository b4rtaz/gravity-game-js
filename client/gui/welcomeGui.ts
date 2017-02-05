import c = require('../client');
import le = require('../../engine/liteEvent');
import la = require('../levelsAccessor');

export class WelcomeGui {
  private _levelsAccessor: la.LevelAccessor;

  private _welcome: HTMLElement;
  private _welcomeText: HTMLElement;
  private _levelList: HTMLElement;

  public levelChoosed: le.LiteEvent<string> = new le.LiteEvent<string>();

  public constructor(levelsAccessor: la.LevelAccessor) {
    this._levelsAccessor = levelsAccessor;
  }

  public start(): void {
    this._welcome = document.getElementById('welcome');
    this._welcomeText = document.getElementById('welcomeText');
    this._levelList = this._welcome.getElementsByTagName('ul')[0];
  }

  private rebuildList(): void {
    while (this._levelList.firstChild) {
      this._levelList.removeChild(this._levelList.firstChild);
    }

    let levels = this._levelsAccessor.getLevels();
    let available: number = 0;
    for (var i = levels.length - 1; i >= 0; i--) {
      var level = levels[i];
      if (this._levelsAccessor.hasAccess(i)) {
        let li = document.createElement('li');
        let no = document.createElement('span');
        let title = document.createElement('span');
        no.className = 'number';
        no.innerHTML = i.toString();
        title.innerHTML = level.title;
        li.appendChild(no);
        li.appendChild(title);
        li.setAttribute('data-name', level.name);
        li.addEventListener('click', (e) => this.onLevelSelected(e), false);
        this._levelList.appendChild(li);
        available++;
      }
    }
    if (available === levels.length) {
      this._welcomeText.innerHTML = 'Wszystkie misje wykonane. Dobra robota!';
    }
  }

  public show(): void {
    this.rebuildList();
    this._welcome.style.display = 'block';
  }

  public hide(): void {
    this._welcome.style.display = 'none';
  }

  public onLevelSelected(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    var element = event.target as HTMLElement;
    if (element.tagName.toLowerCase() === 'span') {
      element = element.parentNode as HTMLElement;
    }

    var levelName = element.getAttribute('data-name');
    this.levelChoosed.trigger(levelName);
  }
}
