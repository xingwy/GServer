import { IAgent } from "../../singleton/core/IAgent";
import { MongoMgr } from "../../singleton/db/mongo";
import { ModuleBase } from "../modules/module_base";
import { ModuleBag } from "../modules/module_bag/module_bag";
import * as Tool from "../../singleton/utils/tool";

/**
 * 中心服角色管理
 */

export class Agent extends IAgent {

    private _modules: Map<string, ModuleBase>;
    private _img: boolean;
    private _timer: NodeJS.Timeout;
    constructor() {
        super();
        this._modules.set(Constants.ModuleName.Bag, new ModuleBag(this, Constants.MongoDBKey.Bag));
    }

    // 加载数据
    public load(img: boolean = false): void {
        // MongoDBKey
        this._img = img;

        if (!img) {
            this._timer = setInterval(this.onTimer.bind(this), 1000);
        }
    }

    public onTimer(): void {
        this._modules.forEach((mod: ModuleBase) => {
            let now = Tool.getLocalTime();
            mod.ontimer(now);
        })
        

        // 是否处理TODB?
    }

    // 调用定时模块
    public async fromDB<T>(): Promise<void> {
        for (let [_, mod] of this._modules) {
            let buffer = await MongoMgr.instance.hget(mod.dbKey, this.agentId);
            // decode
            let data: T;
            mod.fromDB(data);
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
            let buffer: Buffer;
            await MongoMgr.instance.hset(mod.dbKey, this.agentId, buffer);
        }
    }

} 