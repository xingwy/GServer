import { CenterSystem } from "./core/center_system";
import { GlobelMgr } from "../singleton/utils/globel";

const CFG = require("../config.json");
// 注册协议
require("./core/protocol_system");

export const Main = async function(core: string) {
    // 全局参数
    GlobelMgr.instance.init(CFG);
    // 初始化配置
    CenterSystem.instance.unique = GlobelMgr.instance.gateId + Constants.ServicType.CenterServic;
    // 初始化中心系统
    let gate = CFG.tcp.gateway;
    CenterSystem.instance.open(gate.host, gate.port);
    // 进程事件处理
    process.on("exit", async () => {
        await CenterSystem.instance.close();
    });

    process.on("uncaughtException", async () => {
        await CenterSystem.instance.close();
    });

    process.on("SIGINT", async () => {
        await CenterSystem.instance.close();
    });

    process.on("SIGTERM", async () => {
        await CenterSystem.instance.close();
    });
};

Main("center");
