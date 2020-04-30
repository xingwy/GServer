import * as http from "http";
import * as WebSocket from "ws";

import { SystemBase } from "../system_base";

export class TokenSession  implements IHeapElement {
    public value: number;
    public pointer: Uint32;
    public handle: Uint16;
    public code: Uint32;
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

    public abstract async receive(from: SessionId, code: ProtocolCode, content: Buffer): Promise<ResultCode>; 

    /**
     * 广播
     * @param content 
     */
    public broadcast(content: Buffer): void {
        if (this._socket || this._socket.readyState !== this._socket.OPEN) {
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

    }
}

export class ServiceSession extends Session {

    public readonly userSession: Set<Session>;
    constructor(system: SystemBase, socket: WebSocket, request: http.IncomingMessage) {
        super(system, socket, request);
    }

    public onSocketMessage(event: WebSocket.MessageEvent): void {
        let content = <Buffer> event.data;
        // TODO 增加接收处理分发

    }

    public async receive(from: SessionId, code: Uint16, content: Buffer): Promise<ResultCode> {
        // TODO 发送检查
        this._socket.send(content);
        return ResultCode.Success;
    }
} 