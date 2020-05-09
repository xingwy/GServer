"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_system_1 = require("./base/gateway_system");
const CFG = require("../config.json");
exports.Main = async function (core) {
    // 初始化中心系统
    let gate = CFG.address.gateway;
    gateway_system_1.GatewaySystem.instance.open(gate.host, gate.port);
    // 进程事件处理
    process.on("exit", async (code) => {
        console.log("exit");
        await gateway_system_1.GatewaySystem.instance.close();
    });
    process.on("uncaughtException", async (e) => {
        console.log("uncaughtException", e);
        await gateway_system_1.GatewaySystem.instance.close();
    });
    process.on("SIGINT", async () => {
        console.log("SIGINT");
        await gateway_system_1.GatewaySystem.instance.close();
    });
    process.on("SIGTERM", async () => {
        console.log("SIGTERM");
        await gateway_system_1.GatewaySystem.instance.close();
    });
};
exports.Main("gateway");
//# sourceMappingURL=index.js.map