
export type EventListener<T> = (param: T) => void;

export class EventDispatcher<T> {
    private readonly _listeners: Set<EventListener<T>>;

    public constructor() {
        this._listeners = new Set();
    }

    public dispatch(param: T) {
        for (const listener of this._listeners)
            listener(param);
    }

    public subscribe(listener: EventListener<T>) {
        this._listeners.add(listener);
    }

    public unsubscribe(listener: EventListener<T>) {
        this._listeners.delete(listener);
    }
}