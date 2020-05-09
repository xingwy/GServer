"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const WebSocket = require("ws");
const session_1 = require("./session");
class Accept {
    constructor(system) {
        this._system = system;
    }
    get pipe() {
        return this._pipe;
    }
    get system() {
        return this._system;
    }
    get address() {
        return this._address;
    }
    get state() {
        return this._state;
    }
    open(host, port, operate, flag, callback) {
        let session;
        if (operate === 1 /* active */) {
            this._state = 0 /* connecting */;
            this._address = { address: host, port, family: "" };
            let pipe;
            if (flag) {
                pipe = new WebSocket(`wss://${host}:${port}`, {
                    rejectUnauthorized: false,
                });
            }
            else {
                pipe = new WebSocket(`ws://${host}:${port}`);
            }
            session = this.onOpen(pipe);
            callback(session);
        }
        else {
            if (flag) {
                let pipe = http.createServer({}).listen(port, host);
                this._pipe = new WebSocket.Server({ server: pipe });
            }
            else {
                this._pipe = new WebSocket.Server({
                    host,
                    port,
                });
            }
            this._pipe.on("listening", () => {
                console.log("监听中");
                this.onListening();
            });
            this.pipe.on("connection", (socket, request) => {
                session = this.onConnection(socket, request);
                socket.send("weqwe");
                callback(session);
            });
            this._pipe.on("error", (error) => {
                this.onError(error);
            });
        }
    }
}
class AcceptServer extends Accept {
    constructor(system) {
        super(system);
        this._type = 1 /* server */;
    }
    get type() {
        return this._type;
    }
    onOpen(socket) {
        return new session_1.ServiceSession(this.system, socket, null);
    }
    onListening() {
    }
    onConnection(socket, request) {
        return new session_1.ServiceSession(this.system, socket, request);
    }
    onError(error) {
    }
}
exports.AcceptServer = AcceptServer;
//# sourceMappingURL=accept.js.map