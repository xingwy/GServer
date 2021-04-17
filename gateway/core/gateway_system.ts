import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { AcceptServer, AcceptClient } from "../../singleton/network/accept";
import { GlobelMgr } from "../../singleton/utils/globel";

export class GatewaySystem extends System {

    private static _instance: GatewaySystem = new GatewaySystem();

    protected _serverAccept: AcceptServer;
    protected _clientAccept: AcceptClient;
    protected _centerSession: Session;
    // 客户端连接
    protected readonly _clients: Map<Uint64, Session>;

    public static get instance(): GatewaySystem {
        return this._instance;
    }
    
    constructor() {
        super(Protocols.ServerType.CenterServic);
        this._serverAccept = new AcceptServer(this);
        this._clientAccept = new AcceptClient(this);
        this._clients = new Map<Uint64, Session>();
    }
    public onReceiveProtocol(from: number, code: number, flags: number, content: Buffer): boolean {
        return true;
    }
    public onSessionOpen(session: Session): void {
    }
    public onSessionError(session: Session, reason: ResultCode): void {
    }
    public onSessionClose(session: Session, reason: ResultCode): void {
    }

    public async connect(args: IAddressInfo): Promise<void> {

    }
    public async close(): Promise<void> {
        super.close();
        console.log("gateway 退出");
        process.exit(0);
    }

    public openServer(host: string, port: number): void {
        this.open(host, port);

        // 监听 进程通信
        this._serverAccept.open(host, port, Protocols.AcceptOperate.passive, false, (session: Session): void => {
            session.serviceType = Protocols.ServerType.GatewayServic;
            // 开启启用随机ID
            session.unique = GlobelMgr.instance.nextId();
            // 创建连接 加入事件处理
            session.open();
            this.openSession(session);
        });
    }

    public openClient(host: string, port: number): void {
        this.open(host, port);
        // 监听 客户端连接
        this._clientAccept.open(host, port, Protocols.AcceptOperate.passive, false, (session: Session): void => {
            session.serviceType = Protocols.ServerType.Client;
            // TODO 采用用户ID
            session.unique = GlobelMgr.instance.nextId();
            // 创建连接缓存
            session.open();
            this.openSession(session);
        });
    }
}