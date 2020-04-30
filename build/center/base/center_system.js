"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_base_1 = require("../../singleton/network/system_base");
const accept_1 = require("../../singleton/network/base/accept");
class CenterSystem extends system_base_1.SystemBase {
    constructor() {
        super(2097152 /* CenterServic */);
        this._accept = new accept_1.AcceptServer(this);
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
        process.exit(0);
    }
    open(host, port) {
        super.open(host, port);
        // 连接网关
        this._accept.open(host, port, 1 /* active */, false, (session) => {
            session.serviceType = 1048576 /* GatewayServic */;
            this._gateSession = session;
            console.log("连接");
            setInterval(() => {
                this.publishProtocol(this._gateSession, 1, Buffer.from("hello"));
            }, 5000);
        });
    }
}
CenterSystem._instance = new CenterSystem();
exports.CenterSystem = CenterSystem;
//# sourceMappingURL=center_system.js.map