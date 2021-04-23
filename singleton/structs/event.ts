import * as EventEmitter from "events";

// 初版，设计不是最优 后面优化
export class Event {
    private _event: EventEmitter;
    private _handlers: Map<number, Map<string, Set<any>>>;
    constructor() {
        this._event = new EventEmitter();
        this._handlers = new Map<number, Map<string,  Set<any>>>();
        this._event.on("singal", this.handle.bind(this));
    }

    /**
     * 注册事件
     * @param eventId 
     * @param handle 
     * @returns 
     */
    public resiter(eventId: number, handle: string, target: any): void {
        if (!this._handlers.has(eventId)) {
            this._handlers.set(eventId, new Map<string, Set<any>>());
        }
        if (!this._handlers.get(eventId).has(handle)) {
            // 不允许重复注册 
            this._handlers.get(eventId).set(handle, new Set<any>());
        }
        this._handlers.get(eventId).get(handle).add(target);
    }

    /**
     * 注销事件
     * @param eventId 
     * @param handle 
     * @returns 
     */
     public unresiter(eventId: number, handle: string, target: Object): void {
        if (!this._handlers.has(eventId)) {
            this._handlers.set(eventId, new Map<string, Set<Object>>());
        }
        if (!this._handlers.get(eventId).has(handle)) {
            // 不允许重复注册 
            this._handlers.get(eventId).set(handle, new Set<Object>());
        }
    }

    public emit(eventId: number, data: Object, sender: number = 0): void {
        this._event.emit("singal", eventId, data, sender);
    }

    private handle(eventId: number, data: Object, sender?: number) {
        if (this._handlers.has(eventId)) {
            let _map = this._handlers.get(eventId);
            for (let [k, targets] of _map) {
                for (let obj of targets) {
                    obj[k].apply(obj, [eventId, data, sender]);
                }
            }
            
        }
    }
}