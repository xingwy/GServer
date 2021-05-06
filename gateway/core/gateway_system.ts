import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { AcceptServer, AcceptClient } from "../../singleton/network/accept";
import { Proxy } from "../../singleton/network/proxy";
import { GlobelMgr } from "../../singleton/utils/globel";
import { LoginAction } from "../actions/login_action"; 
import { ModuleSystem } from "./module_system";

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
        super(Constants.ServicType.CenterServic);
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
            session.unique = session.serviceType;
            this.openSession(session);
        });
    }

    public openClient(host: string, port: number): void {
        this.open(host, port, Constants.ConnectType.Tcp);
        // 监听 客户端连接
        this._clientAccept.open(host, port, Constants.AcceptOperate.passive, false, async (session: Session): Promise<void> => {
            session.serviceType = Constants.ServicType.Client;
            // TODO 采用用户ID 登陆时加入map
            let {code, unique} = await LoginAction.instance.login();
            if (code != Constants.ResultCode.Success) {
                return;
            }
            // session.unique = unique;
            // 创建连接缓存
            session.open();
            this.openSession(session);
        });
    }

    // 连入世界服服务器 （目前只认为有一个世界） 
    public connectWorld(host: string, port: number): void {
        // 连接网关
        this._serverAccept.open(host, port, Constants.AcceptOperate.active, false, (session: Session) => {
            session.serviceType = Constants.ServicType.WorldServic;
            this._worldSession = session;
            this._worldSession.open();
            this.openSession(session);
        });
    }

    public openHttpServer(host: string, port: number): void {
-        this._httpServer.open(host, port, () => {
            console.log(`open http port: ${host}: ${port}`)
            this.open(host, port, Constants.ConnectType.Http);
        })
    }
}