
export interface BaseInfo {
    name: string;
    sex: number;
}

export class UserMgr {

    private static _instance: UserMgr = new UserMgr();
    private readonly userMap: Map<Uint64, BaseInfo>; 

    public static get instance(): UserMgr {
        return this._instance
    }
    constructor() {
        this.userMap = new Map<Uint64, BaseInfo>();
    }

    public login(uid: Uint64, info: BaseInfo): void {
        if (!this.userMap.has(uid)) {
            this.userMap.set(uid, info);
        }
    }

    public logout(uid: Uint64): void {
        if (this.userMap.has(uid)) {
            this.userMap.delete(uid);
        }
    }

    public getUser(uid: Uint64): BaseInfo {
        return this.userMap.get(uid);
    } 
}