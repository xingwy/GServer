import { Agent } from "../base/agent";

/**
 * 人物模块
 */

export abstract class UserBase {
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

    public load(): void {
    }

    public fromDB<T extends keyof Constants.DBFieldsType>(record: Constants.DBFieldsType[T]): void {
    }

    public toDB<T extends keyof Constants.DBFieldsType>(): Constants.DBFieldsType[T] {
        return null;
    }
    
    public ontimer(ts: number): void {

    }

}