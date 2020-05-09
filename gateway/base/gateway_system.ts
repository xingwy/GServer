import { SystemBase } from "../../singleton/network/system_base";
import { Session } from "../../singleton/network/base/session";
import { AcceptServer } from "../../singleton/network/base/accept";
import { GlobelMgr } from "../../singleton/utils/globel";

export class GatewaySystem extends SystemBase {

    private static _instance: GatewaySystem = new GatewaySystem();

    protected _serverAccept: AcceptServer;
    protected _centerSession: Session;     
    public static get instance(): GatewaySystem {
        return this._instance;
    }
    
    constructor() {
        super(Protocols.ServerType.CenterServic);
        this._serverAccept = new AcceptServer(this);
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

    public open(host: string, port: number): void {
        super.open(host, port);
        // 监听
        this._serverAccept.open(host, port, Protocols.AcceptOperate.passive, false, (session: Session): void => {
            session.serviceType = Protocols.ServerType.GatewayServic;
            session.unique = GlobelMgr.instance.nextId();
            console.log("连接", session.sign);
            // 创建连接缓存
            session.open();
            session.broadcast(Buffer.from("11111"));
            console.log(session.unique, session);
            this.openSession(session);
            this.onSessionOpen(session);
        });
        
        // this._gateSession = session;
        // console.log(this._gateSession);

        // let session = await this._serverAccept.open(host, port, Protocols.AcceptOperate.active, false);
    }
}