import * as http from "http";
import * as WebSocket from "ws";
import { SystemBase } from "../system_base";

const FIXED_BUFFER = 4 + 8 + 8 + 4 + 1;

export class TokenSession  implements IHeapElement {
    public value: number;
    public pointer: Uint32;
    public handle: Uint16;
    public opcode: Uint32;
    public promise: Promise<any>;
    public owner: Session;
    public resolve: (value?: any) => void;
    public reject: (reason: ResultCode) => void;

    public readonly TIMEOUT: number = 10000;

    public close(reason: ResultCode): void {
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
    public serviceType: Protocols.ServerType;

    public readonly TIMEOUT: number = 180000;

    protected _address: string;
    protected _port: number;
    protected _socket: WebSocket;
    protected _system: SystemBase;

    constructor(system: SystemBase, socket: WebSocket, request: http.IncomingMessage) {

        this.sign = 0x01;
        this._socket = socket;
        this._system = system;

        if (request) {
            this._address = request.socket.remoteAddress;
            this._port = request.socket.remotePort;   
        }

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

    public close(): void {
        if (!this._socket) {
            return;
        }
        if (this._address !== "") {

        } else {

        }

        let readyState = this._socket.readyState;
        if (readyState !== WebSocket.CLOSING && readyState !== WebSocket.CLOSED) {
            this._socket.close();
        }
        this._socket = null;
    }


    /**
     * 连接消息
     * @param event 
     */
    public abstract onSocketMessage(event: WebSocket.MessageEvent): void;

    public abstract receive(from: SessionId, opcode: ProtocolCode, flag: Uint8, content: Buffer): Promise<ResultCode>; 

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
        this._system.closeSession(this.unique, 0);
    }
}

export class ServiceSession extends Session {

    public readonly userSession: Set<Session>;
    constructor(system: SystemBase, socket: WebSocket, request: http.IncomingMessage) {
        super(system, socket, request);
    }

    public onSocketMessage(event: WebSocket.MessageEvent): void {
        let content = <Buffer> event.data;
        // 增加接收处理分发
        try {
            if (content.length < FIXED_BUFFER) {
                console.log("数据长度不足");
                return;
            }
            let [from, to, opcode, flag, tuple] = this.buildFixedData(content);
            this._system.receiveProtocol(from, to, opcode, from, tuple);
        } catch (error) {
            console.log(error);
        }
    }

    public async receive(from: SessionId, opcode: Uint16, flag: Uint8, content: Buffer): Promise<ResultCode> {
        // TODO 发送检查
        try {
            let buffer = this.setFixedData(from, opcode, flag, content);
            this._socket.send(buffer);
        } catch (error) {
            console.log(error);
            return ResultCode.Error;
        }
        return ResultCode.Success;
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
    
    public setFixedData(from: SessionId, opcode: Uint16, flag: Uint8, content: Buffer): Buffer {
        let size = content && content.length || 0;
        let buffer = Buffer.allocUnsafe(FIXED_BUFFER + size);
        let offset = 0;
        buffer.writeUInt32LE(<Uint32> (buffer.byteLength), offset);
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

export class ClientSession extends Session {
    public onSocketMessage(event: WebSocket.MessageEvent): void {
        // TODO 客户端消息的处理
    }
    public async receive(from: number, opcode: number, flag: number, content: Buffer): Promise<ResultCode> {
        // 客户端消息发送
        return ResultCode.Success;
    }
    
}
