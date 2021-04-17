import { GatewaySystem } from "./core/gateway_system";
import { MongoMgr } from "../singleton/db/mongo";

const CFG = require("../config.json");

export const Main = async function(core: string) {
    // 初始化中心系统
    let gate = CFG.tcp.gateway;
    let client = CFG.tcp.client;
    // 开启网关连接  提供服务进程连接
    GatewaySystem.instance.openServer(gate.host, gate.port);
    GatewaySystem.instance.openClient(client.host, client.port);

    // 初始化DB
    let uri = CFG.mongo.uri;
    let dbName = CFG.mongo.dbName;
    let dbOpts = CFG.mongo.opts;
    MongoMgr.instance.init(uri, dbName, dbOpts);
    await MongoMgr.instance.connect();

    // 进程事件处理
    process.on("exit", async (code) => {
        console.log("exit");
        await GatewaySystem.instance.close();
    });

    process.on("uncaughtException", async (e) => {
        console.log("uncaughtException", e);
        await GatewaySystem.instance.close();
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
