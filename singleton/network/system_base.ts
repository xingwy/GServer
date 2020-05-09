import { Session, TokenSession, ServiceSession } from "./base/session";
import { Slots } from "../structs/slots";
import { Heap } from "../structs/heap";
import * as Tool from "../utils/tool";
import * as MsgpackLite from "msgpack-lite";
import { rejects } from "assert";

export abstract class SystemBase {

    public get serverType(): Protocols.ServerType {
        return this._serverType;
    }

    // Session
    public readonly uniqueToSession: Map<Uint64, Session>;
    // 包含连接 断开 连接属性 套接字注册等等
    public readonly _serverType: Protocols.ServerType;
    public readonly _sessions: Slots<Session>;
    protected readonly _userSessions: Map<Uint64, Session>;
    protected readonly _servicesSession: Map<Uint8, ServiceSession>;

    protected readonly _tokens: Slots<TokenSession>;
    protected readonly _tokensHeap: Heap<TokenSession>;
    protected _unique: Uint64;

    private readonly _handlers: Map<ProtocolCode, {exec: (this: SystemBase, session: Session, tuple: any) => void, sign: number}>;
    private readonly _waitHandlers: Map<ProtocolCode, {exec: (this: SystemBase, session: Session, token: Uint32, tuple: any) => void, sign: number}>;
    constructor(serverType: Protocols.ServerType) {

        this._serverType = serverType;
        // 会话管理
        this.uniqueToSession = new Map<Uint64, Session>();
        this._sessions = new Slots<Session>();
        this._userSessions = new Map<Uint64, Session>();
        this._servicesSession = new Map<Uint8, ServiceSession>();
        // Wait事件 reply token管理
        this._tokens = new Slots<TokenSession>();
        this._tokensHeap = new Heap<TokenSession>((l: TokenSession, r: TokenSession): boolean => (l.value < r.value));
        // 事件管理
        this._handlers = new Map<ProtocolCode, {exec: (this: SystemBase, session: Session, tuple: any) => void, sign: number}>();
        this._waitHandlers = new Map<ProtocolCode, {exec: (this: SystemBase, session: Session, token: Uint32, tuple: any) => void, sign: number}>();
    }

    public abstract onReceiveProtocol(from: Uint64, code: Uint16, flags: Uint8, content: Buffer): boolean;
    public abstract onSessionOpen(session: Session): void;
    public abstract onSessionError(session: Session, reason: ResultCode): void;
    public abstract onSessionClose(session: Session, reason: ResultCode): void;

    /**
     * 注册推送式消息协议
     * @param protocolCode 协议码
     * @param sign 验证许可证
     * @param handler 处理函数
     */
    public registerProtocol<T extends keyof Protocols.ProtocolsTuple>(code: T, sign: Uint8, handler: (this: SystemBase, session: Session, tuple: Protocols.ProtocolsTuple[T]) => void): void {
        if (this._handlers.has(code)) {
            // TODO_LOG
        }
        let type = code & Protocols.ProtocolsCodeMax;
        if (this.serverType !== type) {
            //  TODO_LOG 服务类型不一致
        }
        let exec = async function(this: SystemBase, session: Session, tuple: Protocols.ProtocolsTuple[T]): Promise<void> {
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
    public registerWaitProtocol<T extends keyof Protocols.ProtocolsTuple>(code: T, sign: Uint8, handler: ((this: SystemBase, session: Session, token: Uint32, tuple: Protocols.ProtocolsTuple[T]) => void)): void {
        if (this._waitHandlers.has(code)) {
            // TODO_LOG
        }
        let type = code & Protocols.ProtocolsCodeMax;
        if (this.serverType !== type) {
            // TODO_LOG
        }
        
        let exec = async function(this: SystemBase, session: Session, token: Uint32, tuple: Protocols.ProtocolsTuple[T]): Promise<void> {
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
    public handleProtocol(from: Session, code: Uint32, content: Buffer): void {
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
     * @param code 协议码
     * @param token token标识
     * @param content 数据内容
     */
    public handleWaitProtocol(from: Session, code: Uint32, token: Uint32, content: Buffer): void {
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
     * @param code 协议码
     * @param token token标识
     * @param content 数据内容
     */
    public handleReplyProtocol(from: Session, code: Uint32, token: Uint32, content: Buffer): void {
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
     * @param code 协议码
     * @param token token标识
     * @param content 数据内容
     */
    public receiveProtocol(from: Uint64, to: Uint64, code: Uint32, flags: Uint8, content: Buffer): void {
        console.log("接收消息");
        let session = this.uniqueToSession.get(from);
        if (session === null) {
            return;
        }

        if (!this.onReceiveProtocol(from, code, flags, content)) {
            // TODO 关闭session
        }

        switch (flags) {
            case Protocols.MessageType.Push: {
                this.handleProtocol(session, code, content);
                break;
            }
            case Protocols.MessageType.Wait: {
                if (content.byteLength < 4) {
                    this.closeSession(session.handle, Infinity);
                    return;
                }
                // 截取token
                let token: Uint32 = content.readInt32LE(0);
                this.handleWaitProtocol(session, code, token, content.slice(4));
                break;
            }
            case Protocols.MessageType.Reply: {
                if (content.byteLength < 4) {
                    this.closeSession(session.handle, Infinity);
                    return;
                }
                // 截取token
                let token: Uint32 = content.readInt32LE(0);
                this.handleWaitProtocol(session, code, token, content.slice(4));
                break;
            }
            default: {
                break;
            }   
        }
    }

    public publishProtocol(to: Session, code: Uint32, data: any): void {
        
        if (!to) {
            return;
        }
        let content: Buffer;
        if (data) {
            try {
                content = Buffer.from(MsgpackLite.encode(data));
            } catch (error) {
                console.log(error);
                return;
            }
        }
        to.receive(this._unique, code, 1, content);
    }

    public invokeProtocol(to: Session, code: Uint32, data: any): any {
        let token = new TokenSession();

        let promise = new Promise<any>(
            (resolve: (value: any) => void, reject: (reason: any) => void) => {
                token.resolve = resolve;
                token.reject = reject;
            });
        token.promise = promise;
        token.owner = to;

        if (!to) {
            token.reject(0);
            return promise;
        }

        this.openToken(token);
        let content: Buffer;
        if (data) {
            try {
                content = Buffer.from(MsgpackLite.encode(data));
            } catch (error) {
                console.log(error);
                return;
            }
        }
        to.receive(this._unique, code, 1, content);
        return promise;
    }

    /**
     * 开启session
     * @param session 
     */
    public openSession(session: Session): Uint16 {
        session.handle = this._sessions.alloc(session);
        this.uniqueToSession.set(session.unique, session);
        switch (session.serviceType) {
            case Protocols.ServerType.CenterServic: {
                this._servicesSession.set(session.unique, <ServiceSession> session);
                break;
            } 
            case Protocols.ServerType.FeatureServic: {
                this._servicesSession.set(session.unique, <ServiceSession> session);
                break;
            } 
            case Protocols.ServerType.GatewayServic: {
                this._servicesSession.set(session.unique, <ServiceSession> session);
                break;
            } 
            case Protocols.ServerType.SystemServic: {
                this._servicesSession.set(session.unique, <ServiceSession> session);
                break;
            }
            default:
                break; 
        }
        return session.handle;
    }

    public closeSession(handle: Uint32, reason: ResultCode): void {
        let session = this._sessions.get(handle);
        if (session) {
            return;
        }
        switch (session.serviceType) {
            case Protocols.ServerType.CenterServic: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            } 
            case Protocols.ServerType.FeatureServic: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            } 
            case Protocols.ServerType.GatewayServic: {
                if (this._servicesSession.has(session.unique)) {
                    this._servicesSession.delete(session.unique);
                }
                break;
            } 
            case Protocols.ServerType.SystemServic: {
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
    public closeToken(handle: Uint16, reason: ResultCode): void {
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

    public open(host: string, port: number): void {
        
    }
    public close(): void {

    }
    
}
