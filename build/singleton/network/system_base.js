"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slots_1 = require("../structs/slots");
const heap_1 = require("../structs/heap");
const Tool = require("../utils/tool");
const MsgpackLite = require("msgpack-lite");
class SystemBase {
    get serverType() {
        return this._serverType;
    }
    constructor(serverType) {
        this._serverType = serverType;
        // 会话管理
        this.uniqueToSession = new Map();
        this._sessions = new slots_1.Slots();
        this._userSessions = new Map();
        this._servicesSession = new Map();
        // Wait事件 reply token管理
        this._tokens = new slots_1.Slots();
        this._tokensHeap = new heap_1.Heap((l, r) => (l.value < r.value));
        // 事件管理
        this._handlers = new Map();
        this._waitHandlers = new Map();
    }
    /**
     * 注册推送式消息协议
     * @param protocolCode 协议码
     * @param sign 验证许可证
     * @param handler 处理函数
     */
    registerProtocol(code, sign, handler) {
        if (this._handlers.has(code)) {
            // TODO_LOG
        }
        let type = code & Protocols.ProtocolsCodeMax;
        if (this.serverType !== type) {
            //  TODO_LOG 服务类型不一致
        }
        let exec = async function (session, tuple) {
            await handler.call(this, session, tuple);
        };
        this._handlers.set(code, {
            sign,
            exec,
        });
    }
    /**
     * 注册等待式消息协议
     * @param code 协议码
     * @param sign 验证许可证
     * @param handler 处理函数
     */
    registerWaitProtocol(code, sign, handler) {
        if (this._waitHandlers.has(code)) {
            // TODO_LOG
        }
        let type = code & Protocols.ProtocolsCodeMax;
        if (this.serverType !== type) {
            // TODO_LOG
        }
        let exec = async function (session, token, tuple) {
            await handler.call(this, session, token, tuple);
        };
        this._waitHandlers.set(code, {
            sign,
            exec,
        });
    }
    /**
     * 处理协议
     * @param from 源session
     * @param code 协议码
     * @param content 数据
     */
    handleProtocol(from, code, content) {
        // if (handler)
        if (!this._handlers.has(code)) {
            // TODO_LOG
            return;
        }
        let handler = this._handlers.get(code);
        if (!(handler.sign & from.sign)) {
            if (code === 0x000001) {
                // ping网络操作
                return;
            }
        }
        let tuple;
        if (content.length > 0) {
            try {
                tuple = MsgpackLite.decode(content);
            }
            catch (error) {
                // TODO_LOG
                return;
            }
        }
        // Checker 检查每一个协议参数的数据格式
        handler.exec.call(this, from, tuple);
    }
    /**
     * 处理等待式消息协议
     * @param from 源session
     * @param code 协议码
     * @param token token标识
     * @param content 数据内容
     */
    handleWaitProtocol(from, code, token, content) {
        if (!this._waitHandlers.has(code)) {
            // TODO_LOG
        }
        let handler = this._waitHandlers.get(code);
        if (!(handler.sign & from.sign)) {
            if (code === 0x000001) {
                // ping网络操作
                return;
            }
        }
        let tuple;
        if (content.length > 0) {
            try {
                tuple = MsgpackLite.decode(content);
            }
            catch (error) {
                // TODO_LOG
                return;
            }
        }
        // TODO 数值检查
        handler.exec.call(this, from, token, tuple);
    }
    /**
     * 处理回复式消息协议
     * @param from 源session
     * @param code 协议码
     * @param token token标识
     * @param content 数据内容
     */
    handleReplyProtocol(from, code, token, content) {
        let tokenSession = this._tokens.free(token);
        if (!tokenSession) {
            // TODO_LOG
            return;
        }
        this._tokensHeap.remove(tokenSession);
        let session = tokenSession.owner;
        if (!session) {
            tokenSession.reject(Infinity);
            return;
        }
        if (code !== tokenSession.code) {
            tokenSession.reject(Infinity);
            return;
        }
        let tuple;
        if (content.length > 0) {
            try {
                tuple = MsgpackLite.decode(content);
            }
            catch (error) {
                tokenSession.reject(Infinity);
                return;
            }
        }
        tokenSession.resolve(tuple);
    }
    /**
     * 接收协议
     * @param from 源session
     * @param code 协议码
     * @param token token标识
     * @param content 数据内容
     */
    receiveProtocol(from, to, code, flags, content) {
        console.log("接收消息");
        let session = this.uniqueToSession.get(from);
        if (session === null) {
            return;
        }
        if (!this.onReceiveProtocol(from, code, flags, content)) {
            // TODO 关闭session
        }
        switch (flags) {
            case 1 /* Push */: {
                this.handleProtocol(session, code, content);
                break;
            }
            case 2 /* Wait */: {
                if (content.byteLength < 4) {
                    this.closeSession(session.handle, Infinity);
                    return;
                }
                // 截取token
                let token = content.readInt32LE(0);
                this.handleWaitProtocol(session, code, token, content.slice(4));
                break;
            }
            case 3 /* Reply */: {
                if (content.byteLength < 4) {
                    this.closeSession(session.handle, Infinity);
                    return;
                }
                // 截取token
                let token = content.readInt32LE(0);
                this.handleWaitProtocol(session, code, token, content.slice(4));
                break;
            }
            default: {
                break;
            }
        }
    }
    publishProtocol(to, code, data) {
        if (!to) {
            return;
        }
        let content;
        if (data) {
            try {
                content = Buffer.from(MsgpackLite.encode(data));
            }
            catch (error) {
                console.log(error);
                return;
            }
        }
        console.log("fasong");
        to.receive(this._unique, code, content);
    }
    /**
     * 开启session
     * @param session
     */
    openSession(session) {
        session.handle = this._sessions.alloc(session);
        this.uniqueToSession.set(session.unique, session);
        switch (session.serviceType) {
            case 2097152 /* CenterServic */: {
                this._servicesSession.set(session.unique, session);
                break;
            }
            case 3145728 /* FeatureServic */: {
                this._servicesSession.set(session.unique, session);
                break;
            }
            case 1048576 /* GatewayServic */: {
                this._servicesSession.set(session.unique, session);
                break;
            }
            case 4194304 /* SystemServic */: {
                this._servicesSession.set(session.unique, session);
                break;
            }
            default:
                break;
        }
        return session.handle;
    }
    closeSession(handle, reason) {
        let session = this._sessions.get(handle);
        if (session) {
            return;
        }
        switch (session.serviceType) {
            case 2097152 /* CenterServic */: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            }
            case 3145728 /* FeatureServic */: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            }
            case 1048576 /* GatewayServic */: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            }
            case 4194304 /* SystemServic */: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            }
            default:
                break;
        }
        this.uniqueToSession.delete(session.unique);
        session.close();
    }
    /**
     * 添加token
     * @param session
     */
    openToken(session) {
        session.handle = this._tokens.alloc(session);
        session.value = Tool.getSteadyTime() + session.TIMEOUT;
        this._tokensHeap.push(session);
        return session.handle;
    }
    /**
     * 关闭token
     * @param handle
     * @param reason
     */
    closeToken(handle, reason) {
        let session = this._tokens.get(handle);
        if (!session) {
            return;
        }
        this._tokensHeap.remove(session);
        this._tokens.free(handle);
        session.close(reason);
    }
    getSession(handle) {
        return this._sessions.get(handle);
    }
    getSessionByUnique(unique) {
        return this.uniqueToSession.get(unique);
    }
    open(host, port) {
    }
    close() {
    }
}
exports.SystemBase = SystemBase;
//# sourceMappingURL=system_base.js.map