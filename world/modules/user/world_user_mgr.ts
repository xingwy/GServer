import { BaseMgr } from "../../base/base_mgr";

export interface BaseInfo {
    name: string;
    sex: number;
}

export class WorldUserMgr extends BaseMgr {

    private readonly userMap: Map<Uint64, BaseInfo>; 

    constructor(modName: Constants.ModuleName, dbKey: DBModels.MongoDBKey) {
        super(modName, dbKey);
        this.userMap = new Map<Uint64, BaseInfo>();
    }

    public login(uid: Uint64, info: BaseInfo): Constants.ResultCode {
        if (!this.userMap.has(uid)) {
            this.userMap.set(uid, info);
        }
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

    public fromDB<T extends keyof DBModels.DBFieldsType>(record: DBModels.DBFieldsType[T]): void {
        if (!record) {
            return;
        }
    }

    public toDB<T extends keyof DBModels.DBFieldsType>(): DBModels.DBFieldsType[T] {
        return null;
    }

}