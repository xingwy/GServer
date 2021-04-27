
export class GlobelMgr {

    private _groupId: number;
    private static _instance: GlobelMgr = new GlobelMgr();

    public static get instance(): GlobelMgr {
        return this._instance;
    }

    public get groupId(): number {
        return this._groupId;
    }
    public set groupId(id) {
        this._groupId = id;
    }

    private _nextId: number;
    constructor() {
        this._nextId = 1;
    }
    // TODO 建立取ID规则
    public nextId(): number {
        return Date.now();
    }


}