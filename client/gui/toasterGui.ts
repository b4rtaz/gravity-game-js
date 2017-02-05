
export class ToasterGui {
  private _messageToast: HTMLElement;
  private _messageToastTitle: HTMLElement;
  private _messageToastText: HTMLElement;
  private _messageToastButton: HTMLElement;
  private _fullscreenToast: HTMLElement;
  private _fullscreenToastTitle: HTMLElement;
  private _callback: () => void;

  public start(): void {
    this._messageToast = document.getElementById('messageToast');
    this._messageToastTitle = this._messageToast.getElementsByTagName('h5')[0];
    this._messageToastText = this._messageToast.getElementsByTagName('p')[0];
    this._messageToastButton = this._messageToast.getElementsByTagName('button')[0];
    this._messageToastButton.addEventListener('click', (e) => this.onMessageButtonClick(e));

    this._fullscreenToast = document.getElementById('fullscreenToast');
    this._fullscreenToastTitle = this._fullscreenToast.getElementsByTagName('h5')[0];
  }

  public showMessageWithButton(title: string, message: string, buttonText: string, callback: () => void): void {
    this.hide();

    this._messageToast.style.display = 'block';
    this._messageToastTitle.innerHTML = title;
    if (!message) {
      this._messageToastText.style.display = 'none';
    } else {
      this._messageToastText.style.display = 'block';
      this._messageToastText.innerHTML = message;
    }
    this._messageToastButton.innerHTML = buttonText;
    this._callback = callback;
  }

  public showFullscreenMessage(text: string, timeout: number, callback: () => void): void {
    this.hide();

    this._fullscreenToast.style.display = 'table';
    this._fullscreenToastTitle.innerHTML = text;

    window.setTimeout(() => {
      this.hide();
      callback();
    }, timeout);
  }

  private onMessageButtonClick(e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();

    this.hide();
    if (this._callback !== null) {
      this._callback();
    }
  }

  public hide(): void {
    this._messageToast.style.display = 'none';
    this._fullscreenToast.style.display = 'none';
  }
}
