
interface ILiteEvent<T> {
    on(handler: { (data?: T): void }) : void;
    off(handler: { (data?: T): void }) : void;
}

export class LiteEvent<T> implements ILiteEvent<T> {
    private _handlers: { (data?: T): void; }[] = [];

    public on(handler: { (data?: T): void }) {
        this._handlers.push(handler);
    }

    public off(handler: { (data?: T): void }) {
        this._handlers.slice(this._handlers.indexOf(handler), 1);
    }

    public trigger(data?: T) {
      this._handlers.forEach((h) => h(data));
    }
}
