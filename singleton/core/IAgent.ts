// 人物模块
import { Event } from "../structs/event";

// 自身带触发器 供自身角色事件使用
export abstract class IAgent extends Event {
    private _agentId: number;

    public set agentId(agentId: number) {
        this._agentId = agentId;
    }

    public get agentId(): number {
        return this._agentId;
    }
    constructor() {
        super();
    }
    public abstract fromDB<T>(v: T): Promise<void>;
    public abstract toDB<T>(): Promise<void>;
}