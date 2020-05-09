import { GatewaySystem } from "./base/gateway_system";

const CFG = require("../config.json");

export const Main = async function(core: string) {
    // 初始化中心系统
    let gate = CFG.address.gateway;
    GatewaySystem.instance.open(gate.host, gate.port);


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
