import { MgrBase } from "../base/mgr_base";

interface IUserInfo {
    account: string;
    password: string;
    name: string;
    sex: number;
}

export class ModuleUserMgr extends MgrBase {

    public static get instance(): ModuleUserMgr {
        return this._instance;
    }
    private static _instance: ModuleUserMgr = new ModuleUserMgr();
    private _userMap: Map<string, IUserInfo>;
    constructor() {
        super();
    }

    public checkUser(account: string): boolean {
        if (this._userMap.has(account)) {
            return false;
        }
        return true;
    }

    public createUser(account: string, password: string, name: string, sex: number): ResultCode {
        // 检查重复账号
        if (!this.checkUser(account)) {
            return ResultCode.Error;
        }

        let user: IUserInfo;
        user.account = account;
        user.password = password;
        user.name = name;
        user.sex = sex;
        this._userMap.set(account, user);
        return ResultCode.Success;
    }

    public authUser(account: string, password: string): ResultCode {
        if (!this._userMap.has(account)) {
            return ResultCode.Error;
        }
        let user = this._userMap.get(account);
        if (user.password !== password) {
            return ResultCode.Error;
        }
        return ResultCode.Success;
    }
}