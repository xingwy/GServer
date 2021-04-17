// 人物模块

export abstract class IAgent {
    private _agentId: number;

    public set agentId(agentId: number) {
        this._agentId = agentId;
    }

    public get agentId(): number {
        return this._agentId;
    }
    constructor() {
    }
    public abstract fromDB<T>(v: T): Promise<void>;
    public abstract toDB<T>(): Promise<void>;
}