import { Dictionary } from "../support/Dictionary";
import { Event } from "../support/event/Event";

export class EventManager {
    private _events: Dictionary<any, IEvent>;

    constructor() {
        this._events = new Dictionary();
    }

    on(eventName: string, func: Function, target: any) {
        this.addEventListener(eventName, func, target);
    }

    off(eventName: string, func?: Function, target?: any): void {
        this.removeEventListener(eventName, func, target);
    }

    emit(eventName: string | Event, data?: any): void {
        let ev: Event;
        if (typeof eventName == 'string') {
            ev = new Event(eventName, data);
        } else {
            ev = eventName;
        }
        this.dispatchEventListener(ev);
    }

    private addEventListener(eventName: string, func: Function, target: any): void {
        if (!this._events.hasKey(target)) {
            this._events.setVal(target, {
                func: {},
                size: 0,
            });
        }

        let event = this._events.getVal(target);
        if (event.func[eventName] == null) {
            event.func[eventName] = new Array();
            event.size++;
        }

        let funcs: Function[] = event.func[eventName];
        if (funcs.indexOf(func) == -1) {
            funcs.push(func);
        }
    }

    private removeEventListener(eventName: string, func: Function, target: any): void {
        if (!this._events.hasKey(target)) {
            return;
        }

        let event = this._events.getVal(target);
        let funcs: any[];

        if (eventName != null) {
            if (!event.func[eventName]) {
                return;
            }

            funcs = event.func[eventName];
            if (funcs != null) {
                let idx: number = funcs.indexOf(func);
                if (idx > -1) {
                    funcs.splice(idx, 1);
                }
            } else {
                funcs = event.func[eventName];
                while(funcs.length > 0) {
                    funcs.shift();
                }
            }

            if (funcs.length == 0 ) {
                event.size--;
                delete event.func[eventName];
            }
        } else {
            for (let key in event.func) {
                funcs = event.func[key];
                event.size--;
                while (funcs.length > 0) {
                    funcs.shift();
                }
            }
        }

        if (event.size <= 0) {
            this._events.remove(target);
        }
    }

    private dispatchEventListener(ev: Event): void {
        let type = ev.type;
        let keys = this._events.keys();
        let event: IEvent, target: any, funcs: Function[];

        for (let i = 0; i < keys.length; i++) {
            target = keys[i];
            event = this._events.getVal(target);

            if (!event.func[type]) {
                continue;
            }

            funcs = event.func[type];
            for (let j = 0; j < funcs.length; j++) {
                if (funcs[j].length == 0) {
                    funcs[j].call(target);
                } else {
                    funcs[j].call(target, ev);
                }
            }
        }
    }
}
