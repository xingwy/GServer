import { MongoMgr } from "../singleton/db/mongo";
import { WorldSystem } from "./core/world_system";
import { GlobelMgr } from "../singleton/utils/globel";

const CFG = require("../config.json");
// 注册协议
require("./core/protocol_system");

export const Main = async function(core: string) {
    // 初始化全局配置
    GlobelMgr.instance.init(CFG);

    // 初始化系统配置
    WorldSystem.instance.unique = GlobelMgr.instance.worldId + Constants.ServicType.WorldServic;
    
    // 初始化中心系统cd b   
    let world = CFG.tcp.world;
    // 开启网关连接  提供服务进程连接
    WorldSystem.instance.openServer(world.host, world.port);

    let worldHttp = CFG.http.world;
    // 开启http服务
    WorldSystem.instance.openHttpServer(worldHttp.host, worldHttp.port);

    // 初始化DB
    let uri = CFG.mongo.uri;
    let dbName = CFG.mongo.dbName;
    let dbOpts = CFG.mongo.opts;
    MongoMgr.instance.init(uri, dbName, dbOpts);
    await MongoMgr.instance.connect();

    // 进程事件处理
    process.on("exit", async (code) => {
        console.log("exit");
        await WorldSystem.instance.close();
    });

    process.on("uncaughtException", async (e) => {
        console.log("uncaughtException", e);
    });

    process.on("SIGINT", async () => {
        console.log("SIGINT");
        await WorldSystem.instance.close();
    });

    process.on("SIGTERM", async () => {
        console.log("SIGTERM");
        await WorldSystem.instance.close();
    });
};

Main("gateway");
