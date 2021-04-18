import * as http from "http";
import * as https from "https";
import * as net from "net";
import { System } from "../core/system";

export class Proxy {
    private _pipe: http.Server;
    private _system: System;
    private _address: net.AddressInfo;
    private _state: Constants.AcceptState;

    constructor(system: System) {
        this._system = system;
    }

    public get pipe(): http.Server {
        return this._pipe;
    }
    public get system(): System {
        return this._system;
    }
    public get address(): net.AddressInfo {
        return this._address;
    }
    public get state(): Constants.AcceptState {
        return this._state;
    }

    public open(host: string, port: number, callback: () => void): void {
       
        // 连接模式
        this._state = Constants.AcceptState.connected;
        this._address = {address: host, port, family: ""};
        this._pipe = new http.Server();
        this._pipe.listen(port, host, () => {

        })
        this._pipe.on("listening", () => {
            this.onListening();
        });

        this.pipe.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {
        });

        this._pipe.on("error", (error: Error) => {
            this.onError(error);
        });
    }

    protected onOpen(socket: WebSocket): void {

    }
    protected onListening(): void {

    }
    protected onConnection(): void {

    }
    protected onError(error: Error): void {

    }
}