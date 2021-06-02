import { ModuleMgrBase } from "../../base/module_base";
import { GlobelMgr } from "../../../singleton/utils/globel";

interface IUserInfo {
    account: string;   // 账号和uid绑定(目前这样设计)
    password: string;  // 密码
    uid: number;       // 全服唯一ID 
}

export class ModuleAccountMgr extends ModuleMgrBase {
    private _accountMap: Map<string, IUserInfo>;
    constructor(modName: Constants.ModuleName, dbKey: DBModels.MongoDBKey) {
        super(modName, dbKey);
        this._accountMap = new Map<string, IUserInfo>();
    }

    public fromDB<T extends keyof DBModels.DBFieldsType>(record: DBModels.DBFieldsType[T]): void {
        if (!record) {
            return;
        }

        let data = <DBModels.Accounts>record;
        let list = data[DBModels.AccountsFields.list];
        if (list) {
            for (let v of list) {
                this._accountMap.set(v[DBModels.AccountFields.account], {
                        account: v[DBModels.AccountFields.account], 
                        password: v[DBModels.AccountFields.password],
                        uid: v[DBModels.AccountFields.uid],
                    });
            }
        }
    }

    public toDB<T extends keyof DBModels.DBFieldsType>(): DBModels.DBFieldsType[T] {
        let data: DBModels.Accounts = [new Array<DBModels.Account>()];
        for (let [_, v] of this._accountMap) {
            data[DBModels.AccountsFields.list].push([v.account, v.password, v.uid]);
        }
        return <DBModels.DBFieldsType[T]>data;
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

    public async createUser(uid: number, account: string, password: string): Promise<Constants.ResultCode> {
        // 检查重复账号
        if (this.existUser(account)) {
            return Constants.ResultCode.ExistUser;
        }
        let user: IUserInfo = {account, password, uid};
        this._accountMap.set(account, user);
        return Constants.ResultCode.Success;
    }

    public authUser(account: string, password: string): Constants.ResultCode {
        let user = this.getUser(account);
        if (!user) {
            return Constants.ResultCode.UserNotExist;
        }
        if (user.password != password) {
            return Constants.ResultCode.WrongPassword;
        }
        return Constants.ResultCode.Success;
    }
}