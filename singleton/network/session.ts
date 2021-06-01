import * as url from "url"
import * as http from "http";
import * as WebSocket from "ws";
import * as MsgPack5 from "msgpack5";
import * as MsgpackLite from "msgpack-lite";
import { IAgent } from "../core/IAgent";
import { System } from "../core/system";

const SERVER_FIXED_BUFFER = 4 + 8 + 8 + 4 + 1;
const CLIENT_FIXED_BUFFER = 4 + 4 + 1;

export class TokenSession  implements IHeapElement {
    public value: number;
    public pointer: Uint32;
    public handle: Uint16;
    public opcode: Uint32;
    public promise: Promise<any>;
    public owner: Session;
    public resolve: (value?: any) => void;
    public reject: (reason: Constants.ResultCode) => void;

    public readonly TIMEOUT: number = 10000;

    public close(reason: Constants.ResultCode): void {
        if (!this.reject) {
            this.reject(reason);
        }
        this.reject = null;
        this.resolve = null;
    }
}

export abstract class Session {

    public sign: Uint8;
    public handle: Uint32;
    public unique: Uint64;
    public serviceType: Constants.ServicType;

    public readonly TIMEOUT: number = 180000;

    protected _address: string;
    protected _port: number;
    protected _socket: WebSocket;
    protected _system: System;

    constructor(system: System, socket: WebSocket, request: http.IncomingMessage) {
        this.sign = 0xff;
        this._socket = socket;
        this._system = system;
    }
    // SOCKET 开启
    public open(): void {
        this._socket.binaryType = "nodebuffer";
        this._socket.onopen = (event: WebSocket.OpenEvent): void => {
            this.onSocketOpen(event);
        };
        this._socket.onmessage = (event: WebSocket.MessageEvent): void => {
            try {
                this.onSocketMessage(event);
                // event.target. ("reply");
            } catch (error) {
                // TO_LOG
            }
        };
        this._socket.onerror = (event: WebSocket.ErrorEvent): void => {
            this.onSocketError(event);
        };

        this._socket.onclose = (event: WebSocket.CloseEvent): void => {
            this.onSocketClose(event);
        };

    }

    public close(code: Constants.SocketCode = Constants.SocketCode.CloseNormal): void {
        if (!this._socket) {
            return;
        }
        if (this._address !== "") {

        } else {

        }

        let readyState = this._socket.readyState;
        if (readyState !== WebSocket.CLOSING && readyState !== WebSocket.CLOSED) {
            console.log("_socket close", code);
            this._socket.close(code);
        }
        this._socket = null;
    }


    /**
     * 连接消息
     * @param event 
     */
    public abstract onSocketMessage(event: WebSocket.MessageEvent): void;

    public abstract receive(from: Uint64, to: Uint64, opcode: ProtocolCode, flag: Uint8, content: Buffer): Promise<Constants.ResultCode>; 

    /**
     * 广播
     * @param content 
     */
    public broadcast(content: Buffer): void {
        if (!this._socket || this._socket.readyState !== this._socket.OPEN) {
            return;
        }
        try {
            this._socket.send(content);
        } catch (error) {
            // TO_LOG
        }
    }

    /**
     * 连接开启事件
     * @param event 
     */
    protected onSocketOpen(event: WebSocket.OpenEvent): void {

    }

    /**
     * 连接错误事件
     * @param event 
     */
    protected onSocketError(event: WebSocket.ErrorEvent): void {

    }

    /**
     * 连接关闭事件
     * @param event 
     */
    protected onSocketClose(event: WebSocket.CloseEvent): void {
        // 断开时调用
        this._system.closeSession(this.handle, 0);
    }
}

export class ServiceSession extends Session {

    // 多服务
    public readonly userSession: Set<Session>;
    constructor(system: System, socket: WebSocket, request: http.IncomingMessage) {
        super(system, socket, request);
        if (request) {
            this._address = request.socket.remoteAddress;
            this._port = request.socket.remotePort;   
            let u = new url.URL(request.url, `http://${this._address}:${this._port}/`);
            let param = u.searchParams;
            let servicType = param.get("servicType");
            let unique = param.get("unique");
            // todo 传入token 防止恶意攻击
            if (servicType) {
                this.unique = Number(unique);
                this.serviceType = Number(servicType);
            }
        }
    }

    public onSocketMessage(event: WebSocket.MessageEvent): void {
        let content = <Buffer> event.data;
        // 增加接收处理分发
        try {
            if (content.length < SERVER_FIXED_BUFFER) {
                console.log("数据长度不足");
                return;
            }
            // 系统消息 包含from to
            let [from, to, opcode, flag, tuple] = this.buildFixedData(content);
            this._system.receiveProtocol(from, to, opcode, flag, tuple);
        } catch (error) {
            console.log(error);
        }
    }

    public async receive(from: Uint64, to: Uint64, opcode: Uint16, flag: Uint8, content: Buffer): Promise<Constants.ResultCode> {
        // TODO 发送检查
        try {
            let buffer = this.setFixedData(from, to, opcode, flag, content);
            this._socket.send(buffer);
        } catch (error) {
            console.log(error);
            return Constants.ResultCode.UnknownError;
        }
        return Constants.ResultCode.Success;
    }

    public buildFixedData(content: Buffer): [number, number, number, number, Buffer] {
        let offset = 0;
        let size = content.readUInt32LE(offset);
        offset += 4;
        if (size !== content.length) {
            // 校验数据长度
            console.log("消息长度不足");
            throw(new Error("消息长度不足"));
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
    
    public setFixedData(from: Uint64, to: Uint64, opcode: Uint16, flag: Uint8, content: Buffer): Buffer {
        let size = content && content.length || 0;
        let buffer = Buffer.allocUnsafe(SERVER_FIXED_BUFFER + size);
        let offset = 0;
        buffer.writeUInt32LE(<Uint32> (buffer.byteLength), offset);
        offset += 4;
        buffer.writeDoubleLE(from, offset);
        offset += 8;
        buffer.writeDoubleLE(to, offset);
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

export class ClientSession extends Session {
    private _agent: IAgent;
    public vaild: boolean = false;
    public account: string = "";
    public password: string = "";

    public get agent(): IAgent {
        return this._agent;
    }
    public set agent(agent: IAgent) {
        this._agent = agent;
    }

    constructor (system: System, socket: WebSocket, request: http.IncomingMessage) {
        super(system, socket, request);
        if (request) {
            this._address = request.socket.remoteAddress;
            this._port = request.socket.remotePort;   
            let u = new url.URL(request.url, `http://${this._address}:${this._port}/`);
            let param = u.searchParams;
            let account = param.get("account");
            let password = param.get("password");
            this.account = account;
            this.password = password;
        }
    }
    public onSocketMessage(event: WebSocket.MessageEvent): void {
        let content = <Buffer> event.data;
        console.log(content)
        
        // 增加接收处理分发
        try {
            if (content.length < CLIENT_FIXED_BUFFER) {
                console.log("数据长度不足");
                return;
            }
            // 也需要包含from/to 用来追源使用
            // 验证检查
            let [from, opcode, flag, tuple] = this.buildFixedData(content);
            console.log([from, opcode, flag, tuple])
            
            console.log(MsgpackLite.decode(tuple))
            // 没有通过验证  允许发送验证协议
            if (flag != Constants.SignType.Auth && !this.vaild) {
                console.log("角色未验证");
                // 是否需要回复
                return;
            }
            
            this._system.receiveProtocol(this.unique, 0, opcode, flag, tuple);
        } catch (error) {
            console.log(error);
        }
    }

    public async receive(from: SessionId, to: SessionId, opcode: Uint16, flag: Uint8, content: Buffer): Promise<Constants.ResultCode> {
        // TODO 发送检查
        try {
            let buffer = this.setFixedData(from, opcode, flag, content);
            this._socket.send(buffer);
        } catch (error) {
            console.log(error);
            return Constants.ResultCode.UnknownError;
        }
        return Constants.ResultCode.Success;
    }

    public buildFixedData(content: Buffer): [number, number, number, Buffer] {
        let offset = 0;
        let size = content.readUInt32LE(offset);
        offset += 4;
        if (size !== content.length) {
            // 校验数据长度
            console.log("消息长度不足");
            throw(new Error("消息长度不足"));
        }
        let from = content.readUInt32LE(offset);
        offset += 4;
        let opcode = content.readUInt32LE(offset);
        offset += 4;
        let flag = content.readUInt8(offset);
        offset += 1;
        let tuple = content.slice(offset);
        return [from, opcode, flag, tuple];
    }
    
    public setFixedData(from: SessionId, opcode: Uint16, flag: Uint8, content: Buffer): Buffer {
        let size = content && content.length || 0;
        let buffer = Buffer.allocUnsafe(CLIENT_FIXED_BUFFER + size);
        let offset = 0;
        buffer.writeUInt32LE(<Uint32> (buffer.byteLength), offset);
        offset += 4;
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
