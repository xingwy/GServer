import { Session, TokenSession, ServiceSession } from "../network/session";
import { Slots } from "../structs/slots";
import { Heap } from "../structs/heap";
import { Proxy } from "../network/proxy";
import * as Http from "http";
import * as Tool from "../utils/tool";
import * as MsgpackLite from "msgpack-lite";
import { GlobelMgr } from "../utils/globel";
const UNIQUE_SIZE = 4;
export abstract class System {

    public get servicType(): Constants.ServicType {
        return this._servicType;
    }

    // Session
    public readonly uniqueToSession: Map<Uint64, Session>;
    // 包含连接 断开 连接属性 套接字注册等等
    public readonly _sessions: Slots<Session>;
    private readonly _servicType: Constants.ServicType;
    protected readonly _userSessions: Map<Uint64, Session>;
    protected readonly _servicesSession: Map<Uint32, ServiceSession>;

    protected readonly _tokens: Slots<TokenSession>;
    protected readonly _tokensHeap: Heap<TokenSession>;
    public unique: Uint64 = 0;

    protected _httpServer: Proxy;

    private readonly _handlers: Map<ProtocolCode, {exec: (this: System, session: Session, tuple: any) => void, sign: number}>;
    private readonly _waitHandlers: Map<ProtocolCode, {exec: (this: System, session: Session, token: Uint32, tuple: any) => void, sign: number}>;
    private readonly _requestHandlers: Map<Protocols.HttpProtocolPath, {exec: (this: System, query: Object, params: Object) => Object, type: Constants.RequestType}>;
    constructor(serverType: Constants.ServicType) {

        this._servicType = serverType;
        // 会话管理
        this.uniqueToSession = new Map<Uint64, Session>();
        this._sessions = new Slots<Session>();
        this._userSessions = new Map<Uint64, Session>();
        this._servicesSession = new Map<Uint32, ServiceSession>();
        this._httpServer = new Proxy(this);
        // Wait事件 reply token管理
        this._tokens = new Slots<TokenSession>();
        this._tokensHeap = new Heap<TokenSession>((l: TokenSession, r: TokenSession): boolean => (l.value < r.value));
        // 事件管理
        this._handlers = new Map<ProtocolCode, {exec: (this: System, session: Session, tuple: any) => void, sign: number}>();
        this._waitHandlers = new Map<ProtocolCode, {exec: (this: System, session: Session, token: Uint32, tuple: any) => void, sign: number}>();
        this._requestHandlers = new Map<Protocols.HttpProtocolPath, {exec: (this: System, query: Object, params: Object) => Object, type: Constants.RequestType}>();
    }

    public abstract onReceiveProtocol(from: Uint64, opcode: Uint16, flags: Uint8, content: Buffer): boolean;
    public abstract onSessionOpen(session: Session): void;
    public abstract onSessionError(session: Session, reason: Constants.ResultCode): void;
    public abstract onSessionClose(session: Session, reason: Constants.ResultCode): void;

    /**
     * 注册HTTP请求协议
     * @param path 请求路径
     * @param type 类型
     * @param handler 处理
     * @returns 
     */
    public registerHttp<T extends Protocols.HttpProtocolPath>(path: T, type: Constants.RequestType, handler: (this: System, query: Object, params: Object) => Object) {
        if (this._requestHandlers.has(path)) {
            // TODO_LOG
            return;
        }
        let exec = async function(this: System, query: Object, params: Object): Promise<Object> {
            return await handler.call(this, query, params);
        };

        // 映射表
        this._requestHandlers.set(path, {
            type,
            exec,
        });
    }

    /**
     * 注册推送式消息协议
     * @param protocolCode 协议码
     * @param sign 验证许可证
     * @param handler 处理函数
     */
    public registerProtocol<T extends keyof Protocols.ProtocolsTuple>(opcode: T, sign: Uint8, handler: (this: System, session: Session, tuple: Protocols.ProtocolsTuple[T]) => void): void {
        if (this._handlers.has(opcode)) {
            // TODO_LOG
        }
        let type = opcode & Constants.ProtocolsCode.Max;
        if (this._servicType !== type) {
            //  TODO_LOG 服务类型不一致
        }
        let exec = async function(this: System, session: Session, tuple: Protocols.ProtocolsTuple[T]): Promise<void> {
            await handler.call(this, session, tuple);
        };

        this._handlers.set(opcode, {
            sign,
            exec,
        });
    }
    /**
     * 注册等待式消息协议
     * @param opcode 协议码
     * @param sign 验证许可证
     * @param handler 处理函数
     */
    public registerWaitProtocol<T extends keyof Protocols.ProtocolsTuple>(opcode: T, sign: Uint8, handler: ((this: System, session: Session, token: Uint32, tuple: Protocols.ProtocolsTuple[T]) => void)): void {
        if (this._waitHandlers.has(opcode)) {
            // TODO_LOG
        }
        let type = opcode & Constants.ProtocolsCode.Max;
        if (this._servicType !== type) {
            // TODO_LOG
        }
        
        let exec = async function(this: System, session: Session, token: Uint32, tuple: Protocols.ProtocolsTuple[T]): Promise<void> {
            await handler.call(this, session, token, tuple);
        };
        this._waitHandlers.set(opcode, {
            sign,
            exec,
        });
    }

    // 采用JSON
    public async handleRequest(path: Protocols.HttpProtocolPath, methon: Constants.RequestType, query: Object = {}, params: Object = {}): Promise<Object> {
        if (!this._requestHandlers.has(path)) {
            return null;
        }
        let handler = this._requestHandlers.get(path);
        if (handler.type != methon) {
            return null;
        }
        let reply = await handler.exec.call(this, query, params);
        return reply;
    }

    /**
     * 处理协议
     * @param from 源session
     * @param opcode 协议码
     * @param content 数据
     */
    public handleProtocol(from: Session, opcode: Uint32, content: Buffer): void {
        // if (handler)
        if (!this._handlers.has(opcode)) {
            // TODO_LOG
            return;
        }
        let handler = this._handlers.get(opcode);

        if ((handler.sign & from.sign) == Constants.SignType.Ping) {
            return;
        }
        if ((handler.sign & from.sign) != Constants.SignType.Auth) {
            if (!from.unique) {
                // 未经验证
                return;
            }
        }
        let tuple;
        if (content.length > 0) {
            try {
                tuple = MsgpackLite.decode(content);
            } catch (error) {
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
     * @param opcode 协议码
     * @param token token标识
     * @param content 数据内容
     */
    public handleWaitProtocol(from: Session, opcode: Uint32, token: Uint32, content: Buffer): void {
        if (!this._waitHandlers.has(opcode)) {
            // TODO_LOG
            return;
        }
        let handler = this._waitHandlers.get(opcode);
        if ((handler.sign & from.sign) == Constants.SignType.Ping) {
            return;
        }

        let tuple;
        if (content.length > 0) {
            try {
                tuple = MsgpackLite.decode(content);
            } catch (error) {
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
     * @param opcode 协议码
     * @param token token标识
     * @param content 数据内容
     */
    public handleReplyProtocol(from: Session, opcode: Uint32, token: Uint32, content: Buffer): void {
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
        if (opcode !== tokenSession.opcode) {
            tokenSession.reject(Infinity);
            return;
        }
        let tuple;
        if (content.length > 0) {
            try {
                tuple = MsgpackLite.decode(content);
            } catch (error) {
                tokenSession.reject(Infinity);
                return;
            }
        }
        tokenSession.resolve(tuple);
    }

    /**
     * 接收协议
     * @param from 源session
     * @param opcode 协议码
     * @param token token标识
     * @param content 数据内容
     */
    public receiveProtocol(from: Uint64, to: Uint64, opcode: Uint32, flags: Uint8, content: Buffer): void {
        let session = this.uniqueToSession.get(from);
        // let session = this._sessions.get(handle);
        if (session == null) {
            return;
        }
        let targetType = opcode & Constants.ProtocolsCode.Auth;
        // 检查是不是本服务的消息且为网关类型转发操作
        if (targetType != this.servicType && this.servicType == Constants.ServicType.GatewayServic) {
            // 判断是否是客户端协议（目的地）
            this.route(from, to, opcode, flags, content);
            return;
        }

        // TODO ？其他非网关服务发送 ， 是否也需要做路由功能，暂不设计，后面考虑抽出自动路由功能

        switch (flags) {
            case Constants.MessageType.Push: {
                this.handleProtocol(session, opcode, content);
                break;
            }
            case Constants.MessageType.Wait: {
                if (content.byteLength < 4) {
                    this.closeSession(session.handle, Infinity);
                    return;
                }
                // 截取token
                let token: Uint32 = content.readInt32LE(0);
                this.handleWaitProtocol(session, opcode, token, content.slice(4));
                break;
            }
            case Constants.MessageType.Reply: {
                if (content.byteLength < 4) {
                    this.closeSession(session.handle, Infinity);
                    return;
                }
                // 截取token
                let token: Uint32 = content.readInt32LE(0);
                this.handleReplyProtocol(session, opcode, token, content.slice(4));
                break;
            }
            default: {
                break;
            }   
        }
    }

    /**
     * 
     * @param from 源socket句柄
     * @param to 目标socket句柄
     * @param opcode 协议码
     * @param flags 验证标志
     * @param content 内容
     */
    private route(from: Uint64, to: Uint64, opcode: Uint32, flags: Uint8, content: Buffer): void {
        let targetType = opcode & Constants.ProtocolsCode.Auth;
        let session: Session;
        switch (targetType) {
            case Constants.ServicType.WorldServic: {
                // 世界服消息
                session = this.getSessionByUnique(Constants.ServicType.WorldServic + GlobelMgr.instance.worldId);
            }
            break;
            
            case Constants.ServicType.CenterServic: {
                // 世界服消息
                session = this.getServicSession(Constants.ServicType.CenterServic);
            }
            break;

            case Constants.ServicType.Client: {
                // to 目标角色ID
                session = this.getSessionByUnique(to);
            };
            break;

            default:
                // LOG ERROR
        }
        
        if (!session) {
            // LOG ERROR 找不到目标服务
            return;
        }
        // 发送给目标session 这里暂时传入handle 待优化重构：传入源头ID
        session.receive(this.unique, to, opcode, flags, content);
    }

    public publishProtocol(to: Session, opcode: Uint32, data: any): void {
        if (!to) {
            return;
        }
        let content: Buffer;
        if (data) {
            try {
                content = MsgpackLite.encode(data);
            } catch (error) {
                console.log(error);
                return;
            }
        }
        // 系统通信 ID使用服务类型
        to.receive(this.unique, to.unique, opcode, Constants.MessageType.Push, content);
    }

    public invokeProtocol(to: Session, opcode: Uint32, reply: Uint32, data: any): any {
        let token = new TokenSession();

        let promise = new Promise<any>(
            (resolve: (value: any) => void, reject: (reason: any) => void) => {
                token.resolve = resolve;
                token.reject = reject;
            });
        token.promise = promise;
        token.owner = to;
        token.opcode = reply;

        if (!to) {
            token.reject(0);
            return promise;
        }

        this.openToken(token);
        // token 句柄写入content
        let size = 0;
        let buffer: Buffer;
        if (data) {
            try {
                buffer = MsgpackLite.encode(data);
                size += buffer.length;
            } catch (error) {
                console.log(error);
                return;
            }
        }
        let content: Buffer = Buffer.allocUnsafe(UNIQUE_SIZE + size);
        let offset = 0;
        content.writeInt32LE(token.handle, offset);
        offset += UNIQUE_SIZE;
        if (buffer) {
            buffer.copy(content, offset);
        }
        // 系统通信 ID使用服务类型
        to.receive(this.unique, to.unique, opcode, Constants.MessageType.Wait, content);
        return promise;
    }

    public replyProtocol(to: Session, opcode: Uint32, token: Uint32, data: any): any {
        if (!to) {
            console.log("reply session 失效");
            return;
        }

        let buffer: Buffer;
        let size = 0;
        if (data) {
            try {
                buffer = Buffer.from(MsgpackLite.encode(data));
                size += buffer.length;
            } catch (error) {
                console.log("error");
            }
        }

        let content: Buffer = Buffer.allocUnsafe(UNIQUE_SIZE + size);
        let offset = 0;
        content.writeInt32LE(token, offset);
        offset += UNIQUE_SIZE;
        if (buffer) {
            buffer.copy(content, offset);
        }
        // 系统通信 ID使用服务类型
        to.receive(this.unique, to.unique, opcode, Constants.MessageType.Reply, content);
    }

    /**
     * 开启session
     * @param session 
     */
    public openSession(session: Session): Uint16 {
        // session.handle = this._sessions.alloc(session);
        this.uniqueToSession.set(session.unique, session); 
        switch (session.serviceType) {
            case Constants.ServicType.CenterServic: {
                this._servicesSession.set(session.serviceType, <ServiceSession> session);
                break;
            } 
            case Constants.ServicType.GatewayServic: {
                this._servicesSession.set(session.serviceType, <ServiceSession> session);
                break;
            } 
            case Constants.ServicType.WorldServic: {
                // 客户端服务不操作 不验证先不存映射表
                this._servicesSession.set(session.serviceType, <ServiceSession> session);
                break;
            }
            case Constants.ServicType.Client: {
                // 客户端服务不操作 不验证先不存映射表
                // this._userSessions.set(session.unique, <ServiceSession> session);
                break;
            }
            default:
                break; 
        }
        this.onSessionOpen(session);
        return session.handle;
    }

    public closeSession(unique: Uint32, reason: Constants.ResultCode): Session {
        let session = this._sessions.get(unique);
        if (!session) {
            return null;
        }
        switch (session.serviceType) {
            case Constants.ServicType.CenterServic: {
                if (this._servicesSession.has(session.serviceType)) {
                    this._servicesSession.delete(session.serviceType);
                }
                break;
            }
            case Constants.ServicType.GatewayServic: {
                if (this._servicesSession.has(session.serviceType)) {
                    this._servicesSession.delete(session.serviceType);
                }
                break;
            }
            case Constants.ServicType.Client: {
                // if (this.uniqueToSession.has(session.unique)) {
                //     this.uniqueToSession.delete(session.unique);
                // }
                // break;
            }
            default:
                break; 
        }
        this.uniqueToSession.delete(session.unique);
        this._sessions.free(session.handle);
        session.close();
        return session;
        
    }

    /**
     * 添加token
     * @param session 
     */
    public openToken(session: TokenSession): Uint16 {
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
    public closeToken(handle: Uint16, reason: Constants.ResultCode): void {
        let session = this._tokens.get(handle);
        if (!session) {
            return;
        }
        this._tokensHeap.remove(session);
        this._tokens.free(handle);
        session.close(reason);
    }
    public getSession(handle: Uint32): Session {
        return this._sessions.get(handle);
    }
    public getSessionByUnique(unique: Uint64): Session {
        return this.uniqueToSession.get(unique);
    }

    public setUserSession(uid: Uint64, session: Session): void {
        this.uniqueToSession.set(uid, session);
    }

    public getUserSession(uid: Uint64): Session {
        return this.uniqueToSession.get(uid);
    }

    public getServicSession(servicType: Constants.ServicType): Session {
        return this._servicesSession.get(servicType)
    }

    public open(host: string, port: number, type: Constants.ConnectType): void {
    }

    public close(): void {
    }
    
}
