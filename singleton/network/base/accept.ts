import * as http from "http";
import * as https from "https";
import * as net from "net";
import * as WebSocket from "ws";
import { SystemBase } from "../system_base";
import { Session, ServiceSession } from "./session";
const enum AcceptState {
    connecting,
    connected,
    closed,
}
const enum AcceptType {
    server = 1,
} 

abstract class Accept {
    private _pipe: WebSocket.Server;
    private _system: SystemBase;
    private _address: net.AddressInfo;
    private _state: AcceptState;

    constructor(system: SystemBase) {
        this._system = system;
    }

    public get pipe(): WebSocket.Server {
        return this._pipe;
    }
    public get system(): SystemBase {
        return this._system;
    }
    public get address(): net.AddressInfo {
        return this._address;
    }
    public get state(): AcceptState {
        return this._state;
    }

    public open(host: string, port: number, operate: Protocols.AcceptOperate, flag: boolean, callback: (session: Session) => void): void {
        let session;
        if (operate === Protocols.AcceptOperate.active) {
            this._state = AcceptState.connecting;
            this._address = {address: host, port, family: ""};
            let pipe: WebSocket;
            if (flag) {
                pipe = new WebSocket(`wss://${host}:${port}`, {
                    rejectUnauthorized: false,
                });
            } else {
                pipe = new WebSocket(`ws://${host}:${port}`);
            }
            session = this.onOpen(pipe);
            callback(session);
            
        } else {
            if (flag) {
                let pipe = http.createServer({
                    
                }).listen(port, host);
                this._pipe = new WebSocket.Server({server: pipe});
            } else {
                this._pipe = new WebSocket.Server({
                    host,
                    port,
                });
            }

            this._pipe.on("listening", () => {
                console.log("监听中");
                this.onListening();
            });

            this.pipe.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {
                session = this.onConnection(socket, request);
                socket.send("weqwe");
                callback(session);
            });

            this._pipe.on("error", (error: Error) => {
                this.onError(error);
            });
        }
            
    }

    protected abstract onOpen(socket: WebSocket): Session;
    protected abstract onListening(): void;
    protected abstract onConnection(socket: WebSocket, request: http.IncomingMessage): Session;
    protected abstract onError(error: Error): void;
}

export class AcceptServer extends Accept {
    private _type: AcceptType;
    constructor(system: SystemBase) {
        super(system);
        this._type = AcceptType.server;
    }

    public get type(): AcceptType {
        return this._type;
    }
    protected onOpen(socket: WebSocket): Session {
        return new ServiceSession(this.system, socket, null);
    }
    protected onListening(): void {
    }
    protected onConnection(socket: WebSocket, request: http.IncomingMessage): Session {
        return new ServiceSession(this.system, socket, request);
    }
    protected onError(error: Error): void {
    }
    
}