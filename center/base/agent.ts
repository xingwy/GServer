import { IAgent } from "../../singleton/core/IAgent";
import { MongoMgr } from "../../singleton/db/mongo";
import { UserBase } from "../user/user_base";
import { UserInclude } from "../user/user_include";
import { UserBag } from "../user/user_bag/user_bag";
import { UserHuman } from "../user/user_human/user_human";
import * as Tool from "../../singleton/utils/tool";

/**
 * 中心服角色管理
 */

export class Agent extends IAgent {

    private _modules: Map<string, UserBase>;
    private _img: boolean;
    private _timer: NodeJS.Timeout;
    constructor(agentId: number) {
        super(agentId);
        this._modules = new Map<string, UserBase>();
        this.moduleInit();
    }

    public moduleInit(): void {
        this._modules.set(Constants.ModuleName.Bag, new UserBag(this, DBModels.MongoDBKey.Bag));
        this._modules.set(Constants.ModuleName.Human, new UserHuman(this, DBModels.MongoDBKey.Human));
        // this.resiter(Constants.EventID.Login, "xxx", this._modules.get(DBModels.ModuleName.Bag))

    }

    // 加载数据
    public async load(img: boolean = false): Promise<void> {
        // MongoDBKey
        this._img = img;
        if (!img) {
            this._timer = setInterval(this.onTimer.bind(this), 1000);
        }

        await this.fromDB();
    }

    public onTimer(): void {
        this._modules.forEach((userMod: UserBase) => {
            let now = Tool.getLocalTime();
            userMod.ontimer(now);
        })
        

        // 是否处理TODB?
    }

    // 调用定时模块
    public async fromDB<T>(): Promise<void> {
        for (let [_, mod] of this._modules) {
            let record = await MongoMgr.instance.hget(mod.dbKey, this.agentId);
            // decode
            mod.fromDB(record);
        }
    }
    public async toDB<T>(): Promise<void> {
        // 每个模块单独存储
        for (let [_, mod] of this._modules) {
            if (!mod.needSave) {
                continue;
            }
            // TODO SAVE DATA
            // encode 
            let data = mod.toDB();
            await MongoMgr.instance.hset(mod.dbKey, this.agentId, data);
        }
    }

    public getModule<T extends keyof UserInclude>(key: T): UserInclude[T] {
        return <UserInclude[T]>this._modules.get(key);
    }

} 