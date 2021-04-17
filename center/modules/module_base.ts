import { Agent } from "../base/agent";


export abstract class  ModuleBase {
    private _agent: Agent;
    private _agentId: number;
    private _dbKey: string;
    private _needSave: boolean = true;
    constructor(agent: Agent, dbKey: string) {
        this._agent = agent;
        this._agentId = agent.agentId;
        this._dbKey = dbKey;
    }

    public get agentId(): number {
        return this._agentId;
    }

    public get agent(): Agent {
        return this._agent;
    }

    public get dbKey(): string {
        return this._dbKey;
    }

    public get needSave(): boolean {
        return this._needSave;
    }

    

    public preLoad(): void {
    }

    public fromDB<T>(v: T): void {
        return;
    }

    public toDB<T>(): T {
        return null;
    }
    
    public ontimer(ts: number): void {

    }

}