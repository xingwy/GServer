
export class GlobelMgr {

    public static get instance(): GlobelMgr {
        return this._instance;
    }

    private static _instance: GlobelMgr = new GlobelMgr();
    private _nextId: number;
    constructor() {
        this._nextId = 1;
    }
    // TODO 建立取ID规则
    public nextId(): number {
        return ++this._nextId;
    }
}