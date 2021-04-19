import * as MsgPack5 from "msgpack5";
import Bl = require('bl');

export class Encoding {
    private static _instance: Encoding = new Encoding();
    public static get instance(): Encoding {
        return this._instance;
    }

    private _exec: MsgPack5.MessagePack;
    constructor() {
        this._exec = MsgPack5();
    }

    public encode(obj: any): Bl {
        return this._exec.encode(obj);
    }

    public decode(buf: Buffer): any {
        return this._exec.decode(buf);
    }
}