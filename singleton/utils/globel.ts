const CFG = require("../../config.json");
export class GlobelMgr {

    private _gateId: number;
    private _worldId: number;
    private static _instance: GlobelMgr = new GlobelMgr();

    public static get instance(): GlobelMgr {
        return this._instance;
    }

    public get gateId(): number {
        return this._gateId;
    }

    public get worldId(): number {
        return this._worldId;
    }

    private _nextId: number;
    constructor() {
        this._nextId = 1;
    }

    public init(cfg: any): void {
        let group = cfg.group;
        this._gateId = group.gateway;
        this._worldId = group.world; 
    }

    // TODO 建立取ID规则
    public nextId(): number {
        return Date.now();
    }


}