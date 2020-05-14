"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const FIXED_BUFFER = 4 + 8 + 8 + 4 + 1;
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
        console.log(content);
        // 增加接收处理分发
        try {
            if (content.length < FIXED_BUFFER) {
                console.log("数据长度不足");
                return;
            }
            let [from, to, opcode, flag, tuple] = this.buildFixedData(content);
            this._system.receiveProtocol(from, to, opcode, from, tuple);
        }
        catch (error) {
            console.log(error);
        }
    }
    async receive(from, opcode, flag, content) {
        // TODO 发送检查
        try {
            let buffer = this.setFixedData(from, opcode, flag, content);
            this._socket.send(buffer);
        }
        catch (error) {
            console.log(error);
            return 1 /* Error */;
        }
        return 0 /* Success */;
    }
    buildFixedData(content) {
        let offset = 0;
        let size = content.readUInt32LE(offset);
        offset += 4;
        if (size !== content.length) {
            // 校验数据长度
            console.log("消息长度不足");
            throw (new Error("消息长度不足"));
        }
        let from = content.readDoubleLE(offset);
        offset += 8;
        let to = content.readDoubleLE(offset);
        offset += 8;
        let opcode = content.readUInt32LE(offset);
        offset += 4;
        let flag = content.readUInt8(offset);
        offset += 1;
        let tuple = content.slice(offset);
        return [from, to, opcode, flag, tuple];
    }
    setFixedData(from, opcode, flag, content) {
        let size = content && content.length || 0;
        let buffer = Buffer.allocUnsafe(FIXED_BUFFER + size);
        let offset = 0;
        buffer.writeUInt32LE((buffer.byteLength), offset);
        offset += 4;
        buffer.writeDoubleLE(from, offset);
        offset += 8;
        buffer.writeDoubleLE(this.unique);
        offset += 8;
        buffer.writeInt32LE(opcode, offset);
        offset += 4;
        buffer.writeUInt8(flag, offset);
        offset += 1;
        if (content) {
            content.copy(buffer, offset);
        }
        return buffer;
    }
}
exports.ServiceSession = ServiceSession;
//# sourceMappingURL=session.js.map