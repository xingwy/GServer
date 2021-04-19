import * as http from "http";
import * as https from "https";
import * as net from "net";
import * as url from "url"
import * as querystring from "querystring";
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
        // 开启监听
        this._state = Constants.AcceptState.connected;
        this._address = {address: host, port, family: ""};
        this._pipe = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
            let u = new url.URL(req.url, `http://${this.address.address}:${this.address.port}/`);
            let path = u.pathname;
            let query = u.searchParams;
            console.log(req.method)
            if (req.method == "GET") {
                // 路由分发 TODO 调用系统分发器
                let result = await this.system.handleRequest(path as Protocols.HttpProtocolPath, Protocols.RequestType.Get, query);
                // 暂时这样设计
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(result);
            } else if (req.method == "POST") {
                let postData = new Array<Uint8Array>();
				req.on('data', (chunk: Uint8Array) => {
					postData.push(chunk);
				});

                req.on('end', async () => {
                    let buffer = Buffer.concat(postData);
                    let data = {}
                    try {
                        data = decodeURIComponent(buffer.toString());
                    } catch (error) {
                        data = buffer.toString();
                    }
                    let result = await this.system.handleRequest(path as Protocols.HttpProtocolPath, Protocols.RequestType.Post, query, data);
                    // 暂时这样设计
                    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                    res.end(JSON.stringify(result || {}));
                })
            }
        });

        this._pipe.on("listening", this.onListening.bind(this));
        this._pipe.on("connection", this.onConnection.bind(this));
        this._pipe.on("error", this.onError.bind(this));

        this._pipe.listen(port, host);
        callback();
    }

    protected onOpen(socket: WebSocket): void {

    }
    protected onListening(): void {

    }
    protected onConnection(socket: net.Socket, request: http.IncomingMessage): void {
    }
    protected onError(error: Error): void {
        console.log("error", error)
    }
}