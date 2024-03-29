import { MongoMgr } from "../singleton/db/mongo";
import { GatewaySystem } from "./core/gateway_system";
import { ModuleSystem } from "./core/module_system";
import { GlobelMgr } from "../singleton/utils/globel";

const CFG = require("../config.json");
// 注册协议
require("./core/protocol_system");

export const Main = async function(core: string) {
    // 初始化全局配置
    GlobelMgr.instance.init(CFG);

    // 初始化配置
    GatewaySystem.instance.unique = GlobelMgr.instance.gateId + Constants.ServicType.GatewayServic;
    // 初始化中心系统cd b   
    let gate = CFG.tcp.gateway;
    let world = CFG.tcp.world;
    let client = CFG.tcp.client;
    // 开启网关连接  提供服务进程连接
    GatewaySystem.instance.openServer(gate.host, gate.port);
    GatewaySystem.instance.connectWorld(world.host, world.port);
    GatewaySystem.instance.openClient(client.host, client.port);

    let gateHttp = CFG.http.gateway;
    // 开启http服务
    GatewaySystem.instance.openHttpServer(gateHttp.host, gateHttp.port);

    // 初始化DB
    let uri = CFG.mongo.uri;
    let dbName = CFG.mongo.dbName;
    let dbOpts = CFG.mongo.opts;
    MongoMgr.instance.init(uri, dbName, dbOpts);
    await MongoMgr.instance.connect();

    // 管理器启动
    await ModuleSystem.instance.init();

    // 进程事件处理
    process.on("exit", async (code) => {
        console.log("exit");
        await GatewaySystem.instance.close();
    });

    process.on("uncaughtException", async (e) => {
        console.log("uncaughtException", e);
    });

    process.on("SIGINT", async () => {
        console.log("SIGINT");
        await GatewaySystem.instance.close();
    });

    process.on("SIGTERM", async () => {
        console.log("SIGTERM");
        await GatewaySystem.instance.close();
    });
};

Main("gateway");
