import { CenterSystem } from "./base/center_system";

const CFG = require("../config.json");

export const Main = async function(core: string) {
    // 初始化中心系统
    let gate = CFG.address.gateway;
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
