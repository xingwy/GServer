import { ModuleMgrBase } from "../../base/module_base";

interface IUserInfo {
    account: string;   // 账号和uid绑定(目前这样设计)
    password: string;  // 密码
    uid: number;       // 全服唯一ID 
}

export class ModuleAccountMgr extends ModuleMgrBase {
    private _accountMap: Map<string, IUserInfo>;
    constructor(modName: Constants.ModuleMgrName, dbKey: Constants.MongoDBKey) {
        super(modName, dbKey);
        this._accountMap = new Map<string, IUserInfo>();
    }

    public fromDB<T extends keyof Constants.DBFieldsType>(record: Constants.DBFieldsType[T]): void {
        if (!record) {
            return;
        }

        let data = <Constants.Accounts>record;
        let list = data[Constants.AccountsFields.list];
        if (list) {
            for (let v of list) {
                this._accountMap.set(v[Constants.AccountFields.account], {
                        account: v[Constants.AccountFields.account], 
                        password: v[Constants.AccountFields.password],
                        uid: v[Constants.AccountFields.uid],
                    });
            }
        }
    }

    public toDB<T extends keyof Constants.DBFieldsType>(): Constants.DBFieldsType[T] {
        let data: Constants.Accounts = [new Array<Constants.Account>()];
        for (let [_, v] of this._accountMap) {
            data[Constants.AccountsFields.list].push([v.account, v.password, v.uid]);
        }
        return <Constants.DBFieldsType[T]>data;
    }

    public checkUser(account: string): boolean {
        if (this._accountMap.has(account)) {
            return false;
        }
        return true;
    }

    public existUser(account: string): boolean {
        if (!this._accountMap.has(account)) {
            return false;
        }
        return true;
    }

    public getUser(account: string): IUserInfo {
        return this._accountMap.get(account);
    }
    public createUser(account: string, password: string, name: string, sex: number): ResultCode {
        // 检查重复账号
        if (!this.checkUser(account)) {
            return ResultCode.Error;
        }
        let user: IUserInfo;
        user.account = account;
        this._accountMap.set(account, user);
        return ResultCode.Success;
    }

    // 先不做，后面考虑验证账号另起入口进程服务
    public authUser(account: string, password: string): ResultCode {
        // if (!this._accountMap.has(account)) {
        //     return ResultCode.Error;
        // }
        // let user = this._accountMap.get(account);
        // if (user.password !== password) {
        //     return ResultCode.Error;
        // }
        return ResultCode.Success;
    }
}