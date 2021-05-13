import { BaseMgr } from "../../base/base_mgr";

export interface BaseInfo {
    name: string;
    sex: number;
}

export class UserMgr extends BaseMgr{

    private static _instance: UserMgr = new UserMgr();
    private readonly userMap: Map<Uint64, BaseInfo>; 

    public static get instance(): UserMgr {
        return this._instance
    }
    constructor() {
        super();
        this.userMap = new Map<Uint64, BaseInfo>();
    }

    public login(uid: Uint64, info: BaseInfo): Constants.ResultCode {
        if (!this.userMap.has(uid)) {
            this.userMap.set(uid, info);
        }
        console.log(this.userMap);
        return Constants.ResultCode.Success;
    }

    public logout(uid: Uint64): Constants.ResultCode {
        if (this.userMap.has(uid)) {
            this.userMap.delete(uid);
        }
        return Constants.ResultCode.Success;
    }

    public getUser(uid: Uint64): BaseInfo {
        return this.userMap.get(uid);
    } 
}