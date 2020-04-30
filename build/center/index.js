"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const center_system_1 = require("./base/center_system");
const CFG = require("../config.json");
exports.Main = async function (core) {
    // 初始化中心系统
    let gate = CFG.address.gateway;
    center_system_1.CenterSystem.instance.open(gate.host, gate.port);
    // 进程事件处理
    process.on("exit", async () => {
        await center_system_1.CenterSystem.instance.close();
    });
    process.on("uncaughtException", async () => {
        await center_system_1.CenterSystem.instance.close();
    });
    process.on("SIGINT", async () => {
        await center_system_1.CenterSystem.instance.close();
    });
    process.on("SIGTERM", async () => {
        await center_system_1.CenterSystem.instance.close();
    });
};
exports.Main("center");
//# sourceMappingURL=index.js.map