import { MgrBase } from "../module_base";

interface IUserInfo {
    account: string;   // 账号和uid绑定(目前这样设计)
    uid: number;       // 全服唯一ID 
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

    public fromDB<T extends keyof Constants.DBFieldsType>(record: Constants.DBFieldsType[T]): void {
        if (!record) {
            return;
        }

        let data = <Constants.Accounts>record;
        let list = data[Constants.AccountsFields.list];
        if (list) {
            for (let v of list) {
                this._userMap.set(v[Constants.AccountFields.account], {account: v[Constants.AccountFields.account], uid: v[Constants.AccountFields.uid]});
            }
        }
    }

    public toDB<T extends keyof Constants.DBFieldsType>(): Constants.DBFieldsType[T] {
        let data: Constants.Accounts = [new Array<Constants.Account>()];
        for (let [_, v] of this._userMap) {
            data[Constants.AccountsFields.list].push([v.account, v.uid]);
        }

        return data;
    }

    public checkUser(account: string): boolean {
        if (this._userMap.has(account)) {
            return false;
        }
        return true;
    }

    public existUser(account: string): boolean {
        if (!this._userMap.has(account)) {
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
        this._userMap.set(account, user);
        return ResultCode.Success;
    }

    // 先不做，后面考虑验证账号另起入口进程服务
    public authUser(account: string, password: string): ResultCode {
        // if (!this._userMap.has(account)) {
        //     return ResultCode.Error;
        // }
        // let user = this._userMap.get(account);
        // if (user.password !== password) {
        //     return ResultCode.Error;
        // }
        return ResultCode.Success;
    }
}