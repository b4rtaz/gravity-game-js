
export class LevelAccessor {

  private _levels: Array<{ name: string, title: string }> = [
    { name: 'tutorial', title: 'Tutorial' },
    { name: 'zeroVelocity', title: 'Zatrzymaj satelitę' },
    { name: 'zeroAngular', title: 'Zatrzymaj ruch obrotowy satelity' },
    { name: 'zeroVelocityAndAngular', title: 'Zatrzymaj satelitę oraz jej ruch obrotowy' },
    { name: 'begin', title: 'Obniż orbitę poniżej czerwonego okręgu' },
    { name: 'fifty', title: 'Osiągnij prędkość 50 km/s' },
    { name: 'firstOrbit', title: 'Umieść satelitę na orbicie gwiazdy' },
    { name: 'seriousOrbit', title: 'Umieść satelitę na orbicie planety' },
    { name: 'moonOrbit', title: 'Umieść satelitę na orbicie księżyca' },
    { name: 'highGravity', title: 'Zwiększ orbitę powyżej czerwonego okręgu' },
    { name: 'twoStars', title: 'Umieść satelitę na niskiej orbicie' },
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

  public setLevelDone(levelName): void {
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
