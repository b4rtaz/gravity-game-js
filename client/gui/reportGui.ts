
export class ReportGui {
  private _reportSuccess: HTMLElement;
  private _reportFail: HTMLElement;
  private _callback: () => void;

  public start(): void {
    this._reportSuccess = document.getElementById('reportSuccess');
    document.getElementById('reportSuccessNext').addEventListener('click', (e) => this.onNextClick(e));
    this._reportFail = document.getElementById('reportFail');
  }

  public showSuccess(callback: () => void): void {
    this._reportSuccess.style.display = 'block';
    this._reportFail.style.display = 'none';
    this._callback = callback;
  }

  private onNextClick(e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();

    this.hide();
    if (this._callback !== null) {
      this._callback();
    }
  }

  public showFail(callback: () => void): void {
    this._reportSuccess.style.display = 'none';
    this._reportFail.style.display = 'table';

    window.setTimeout(() => {
      this.hide();
      callback();
    }, 2000);
  }

  public hide(): void {
    this._reportSuccess.style.display = 'none';
    this._reportFail.style.display = 'none';
  }
}
