"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GlobelMgr {
    constructor() {
        this._nextId = 1;
    }
    static get instance() {
        return this._instance;
    }
    nextId() {
        return ++this._nextId;
    }
}
GlobelMgr._instance = new GlobelMgr();
exports.GlobelMgr = GlobelMgr;
//# sourceMappingURL=globel.js.map