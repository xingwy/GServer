import { ModuleMgrBase } from "../base/module_base";
import { MongoMgr } from "../../singleton/db/mongo";
import { GlobelMgr } from "../../singleton/utils/globel";
import { ModuleInclude } from "../modules/module_include";
import { ModuleAccountMgr } from "../modules/module_account_mgr/module_account_mgr";

// 模块集合管理

export class ModuleSystem {
    private static _instance: ModuleSystem = new ModuleSystem();
    public static get instance(): ModuleSystem {
        return this._instance;
    }
    // 管理器集合
    private _cols: Map<Constants.ModuleName, ModuleMgrBase>;
    constructor() {
        this._cols = new Map<Constants.ModuleName, ModuleMgrBase>();
    }

    public async init(): Promise<void> {
        // 注册模块 初始化等
        this.register(Constants.ModuleName.AccountMgr, new ModuleAccountMgr(Constants.ModuleName.AccountMgr, DBModels.MongoDBKey.AccountMgr))

        // 加载模块
        await this.load();

        // 模块执行 after load
        await this.start();
    }

    // 加载后事件
    public async start(): Promise<void> {
        for (let [_, mgr] of this._cols) {
            mgr.close();
        }
    }

    // 启动加载 
    public async load(): Promise<void> {
        try {
            for (let [_, mgr] of this._cols) {
                // Load from DB
                let record = await MongoMgr.instance.hget(mgr.dbKey, mgr.modName);
                mgr.fromDB(record);
            }
        } catch (error) {
            console.log(error)
        }
    }
    
    // 定期落地
    public async save(): Promise<void> {
        try {
            for (let [_, mgr] of this._cols) {
                let data = mgr.toDB();
                await MongoMgr.instance.hset(mgr.dbKey, GlobelMgr.instance.gateId, data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    public async close(): Promise<void> {
        for (let [_, mgr] of this._cols) {
            await mgr.close();
        }
        await this.save();
    }

    // 获取模块
    public getModuleMgr<T extends keyof ModuleInclude>(key: T): ModuleInclude[T] {
        return <ModuleInclude[T]>(this._cols.get(key));
    }

    // 注册模块
    public register(modName: Constants.ModuleName, mgr: ModuleMgrBase): void {
        if (this._cols.has(modName)) {
            return;
        }
        this._cols.set(modName, mgr);
    }
}