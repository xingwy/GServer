"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class TokenSession {
    constructor() {
        this.TIMEOUT = 10000;
    }
    close(reason) {
        if (!this.reject) {
            this.reject(reason);
        }
        this.reject = null;
        this.resolve = null;
    }
}
exports.TokenSession = TokenSession;
class Session {
    constructor(system, socket, request) {
        this.TIMEOUT = 180000;
        this.sign = 0x01;
        this._socket = socket;
        this._system = system;
        if (request) {
            this._address = request.socket.remoteAddress;
            this._port = request.socket.remotePort;
        }
    }
    // SOCKET 开启
    open() {
        this._socket.binaryType = "nodebuffer";
        this._socket.onopen = (event) => {
            this.onSocketOpen(event);
        };
        this._socket.onmessage = (event) => {
            try {
                this.onSocketMessage(event);
                // event.target. ("reply");
            }
            catch (error) {
                // TO_LOG
            }
        };
        this._socket.onerror = (event) => {
            this.onSocketError(event);
        };
        this._socket.onclose = (event) => {
            this.onSocketClose(event);
        };
    }
    close() {
        if (!this._socket) {
            return;
        }
        if (this._address !== "") {
        }
        else {
        }
        let readyState = this._socket.readyState;
        if (readyState !== WebSocket.CLOSING && readyState !== WebSocket.CLOSED) {
            this._socket.close();
        }
        this._socket = null;
    }
    /**
     * 广播
     * @param content
     */
    broadcast(content) {
        if (!this._socket || this._socket.readyState !== this._socket.OPEN) {
            return;
        }
        try {
            console.log("回消息");
            this._socket.send(content);
        }
        catch (error) {
            // TO_LOG
        }
    }
    /**
     * 连接开启事件
     * @param event
     */
    onSocketOpen(event) {
    }
    /**
     * 连接错误事件
     * @param event
     */
    onSocketError(event) {
    }
    /**
     * 连接关闭事件
     * @param event
     */
    onSocketClose(event) {
    }
}
exports.Session = Session;
class ServiceSession extends Session {
    constructor(system, socket, request) {
        super(system, socket, request);
    }
    onSocketMessage(event) {
        let content = event.data;
        console.log("接收", content);
        // TODO 增加接收处理分发
        for (let s of this._system._sessions.values()) {
            s.broadcast(Buffer.from("收到，reply"));
        }
    }
    async receive(from, code, content) {
        // TODO 发送检查
        console.log("发送", content.toString());
        this._socket.send(content);
        return 0 /* Success */;
    }
}
exports.ServiceSession = ServiceSession;
//# sourceMappingURL=session.js.map