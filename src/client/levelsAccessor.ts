
export class LevelAccessor {

  private _levels: Array<{ name: string, title: string }> = [
    { name: 'tutorial', title: 'Tutorial' },
    { name: 'zeroVelocity', title: 'Stop the satellite' },
    { name: 'zeroAngular', title: 'Stop the satellite\'s rotation' },
    { name: 'zeroVelocityAndAngular', title: 'Stop the satellite and its rotation' },
    { name: 'begin', title: 'Lower the orbit below the red circle' },
    { name: 'fifty', title: 'Reach a speed of 50 km/s' },
    { name: 'firstOrbit', title: 'Put a satellite in orbit of a star' },
    { name: 'seriousOrbit', title: 'Put the satellite in orbit of the planet' },
    { name: 'moonOrbit', title: 'Put a satellite in orbit of the moon' },
    { name: 'highGravity', title: 'Increase the orbit above the red circle' },
    { name: 'twoStars', title: 'Put the satellite in low orbit' },
  ];

  public getLevels(): Array<{ name: string, title: string }> {
    return this._levels;
  }

  private findLevelIndexByName(levelName: string): number {
    for (let i = 0; i < this._levels.length; i++) {
      if (this._levels[i].name === levelName) {
        return i;
      }
    }
    return null;
  }

  public hasAccess(levelIndex: number): boolean {
    //return true;
    return levelIndex <= this.getAvailableLevel();
  }

  public setLevelDone(levelName: string): void {
    let index: number = this.findLevelIndexByName(levelName) + 1;
    if (this.getAvailableLevel() < index) {
      this.setAvailableLevel(index);
    }
  }

  private getAvailableLevel(): number {
    if (localStorage['availableLevel']) {
      return parseInt(localStorage['availableLevel'], 10);
    }
    return 1;
  }

  private setAvailableLevel(index: number) {
    localStorage['availableLevel'] = index;
  }
}
