import { System } from "../../singleton/core/system";
import { ClientSession, Session } from "../../singleton/network/session";
import { AcceptServer, AcceptClient } from "../../singleton/network/accept";
import { Proxy } from "../../singleton/network/proxy";
import { GlobelMgr } from "../../singleton/utils/globel";
import { ModuleSystem } from "./module_system";
import { Sign } from "../sign/login"

export class GatewaySystem extends System {

    private static _instance: GatewaySystem = new GatewaySystem();

    protected _serverAccept: AcceptServer;
    protected _clientAccept: AcceptClient;
    protected _worldSession: Session; 
    // 客户端连接
    protected readonly _clients: Map<Uint64, Session>;

    public static get instance(): GatewaySystem {
        return this._instance;
    }
    
    constructor() {
        super(Constants.ServicType.GatewayServic);
        this._serverAccept = new AcceptServer(this);
        this._clientAccept = new AcceptClient(this);
        this._clients = new Map<Uint64, Session>();
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
        await ModuleSystem.instance.close();
        process.exit(0);
    }

    public openServer(host: string, port: number): void {
        this.open(host, port, Constants.ConnectType.Tcp);

        // 监听 进程通信
        this._serverAccept.open(host, port, Constants.AcceptOperate.passive, false, (session: Session): void => {
            // 开启启用随机ID
            // 获取类型 connenction传过来
            // 创建连接 加入事件处理
            session.open();
            this.openSession(session);
        });
    }

    public openClient(host: string, port: number): void {
        this.open(host, port, Constants.ConnectType.Tcp);
        // 监听 客户端连接
        this._clientAccept.open(host, port, Constants.AcceptOperate.passive, false, async (session: Session): Promise<void> => {
            session.serviceType = Constants.ServicType.Client;
            // TODO 采用用户ID 登陆时加入map 仅是连接
            let code = await Sign.signLogin((<ClientSession>session).account, (<ClientSession>session).password, (<ClientSession>session));
            if (code != Constants.ResultCode.Success) {
                // 断开session
                session.close(Constants.SocketCode.AuthUserError);
                return;
            }
            // 验证数据库账号 密码 以及UID
            // 创建连接缓存
            console.log("client connect...")
            session.open();
            this.openSession(session);
        });
    }

    // 连入世界服服务器 （目前只认为有一个世界） 
    public connectWorld(host: string, port: number): void {
        // 连接网关
        this._serverAccept.open(host, port, Constants.AcceptOperate.active, false, (session: Session) => {
            this._worldSession = session;
            this._worldSession.open();
            // 目标网关的unique取自group
            session.serviceType = Constants.ServicType.WorldServic;
            this._worldSession.unique = GlobelMgr.instance.worldId + Constants.ServicType.WorldServic;
            console.log("connect to world ");
            this.openSession(session);
        });
    }

    public openHttpServer(host: string, port: number): void {
-        this._httpServer.open(host, port, () => {
            this.open(host, port, Constants.ConnectType.Http);
        })
    }
}