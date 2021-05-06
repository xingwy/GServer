import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { AcceptServer, AcceptClient } from "../../singleton/network/accept";
import { Proxy } from "../../singleton/network/proxy";
import { GlobelMgr } from "../../singleton/utils/globel";

export class WorldSystem extends System {

    private static _instance: WorldSystem = new WorldSystem();

    // 客户端连接
    protected _serverAccept: AcceptServer;
    protected readonly _clients: Map<Uint64, Uint16>;

    public static get instance(): WorldSystem {
        return this._instance;
    }
    
    constructor() {
        super(Constants.ServicType.WorldServic);
        this._serverAccept = new AcceptServer(this);
        this._clients = new Map<Uint64, Uint16>();
    }
    public onReceiveProtocol(from: number, code: number, flags: number, content: Buffer): boolean {
        return true;
    }
    public onSessionOpen(session: Session): void {
    }
    public onSessionError(session: Session, reason: Constants.ResultCode): void {
    }
    public onSessionClose(session: Session, reason: Constants.ResultCode): void {
    }

    public async connect(args: IAddressInfo): Promise<void> {

    }
    public async close(): Promise<void> {
        super.close();
        process.exit(0);
    }

    public openServer(host: string, port: number): void {
        this.open(host, port, Constants.ConnectType.Tcp);

        // 开启监听 等待网关连接
        this._serverAccept.open(host, port, Constants.AcceptOperate.passive, false, (session: Session): void => {
            // session.unique = GlobelMgr.instance.nextId(); 后面扩展多服 传uid
            // 获取类型 connenction传过来
            // 创建连接 加入事件处理
            session.open();
            session.unique = session.serviceType;
            this.openSession(session);
        });
    }

    public openHttpServer(host: string, port: number): void {
-        this._httpServer.open(host, port, () => {
            this.open(host, port, Constants.ConnectType.Http);
        })
    }

    // 重写openSession 
    // public openSession(session: Session): Uint16 {
    //     session.handle = this._sessions.alloc(session);
    //     this.onSessionOpen(session);
    //     return session.handle;
    // }
 
    public getGatewayServic(handle: Uint16): Session {
        return this._sessions.get(handle);
    }

    public getClienthandle(uid: Uint64): Uint16 {
        return this._clients.get(uid);
    }

    public getClientServic(uid: Uint64): Session {
        return this.getGatewayServic(this.getClienthandle(uid));
    }

    // 客户端登录到世界服调用  由客户端所连接的网关发来消息
    public clientLogin(uid: Uint64, session: Session): void{
        if (this._sessions.has(session.handle)) {
            this._clients.set(uid, session.handle);
        }
    }
}