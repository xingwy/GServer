"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_base_1 = require("../../singleton/network/system_base");
const accept_1 = require("../../singleton/network/base/accept");
const globel_1 = require("../../singleton/utils/globel");
class GatewaySystem extends system_base_1.SystemBase {
    constructor() {
        super(2097152 /* CenterServic */);
        this._serverAccept = new accept_1.AcceptServer(this);
    }
    static get instance() {
        return this._instance;
    }
    onReceiveProtocol(from, code, flags, content) {
        return true;
    }
    onSessionOpen(session) {
    }
    onSessionError(session, reason) {
    }
    onSessionClose(session, reason) {
    }
    async connect(args) {
    }
    async close() {
        super.close();
        console.log("gateway 退出");
        process.exit(0);
    }
    open(host, port) {
        super.open(host, port);
        this._serverAccept.open(host, port, 2 /* passive */, false, (session) => {
            session.serviceType = 1048576 /* GatewayServic */;
            session.unique = globel_1.GlobelMgr.instance.nextId();
            console.log("连接", session.sign);
            // 创建连接缓存
            session.open();
            this.openSession(session);
            this.onSessionOpen(session);
        });
        // this._gateSession = session;
        // console.log(this._gateSession);
        // let session = await this._serverAccept.open(host, port, Protocols.AcceptOperate.active, false);
    }
}
GatewaySystem._instance = new GatewaySystem();
exports.GatewaySystem = GatewaySystem;
//# sourceMappingURL=gateway_system.js.map