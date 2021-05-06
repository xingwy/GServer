import { Agent } from "../base/agent";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { AcceptServer } from "../../singleton/network/accept";

export class CenterSystem extends System {

    private static _instance: CenterSystem = new CenterSystem();

    protected _accept: AcceptServer;
    protected _gateSession: Session;  

    // 用户Map
    private readonly _userMap: Map<Uint32, Agent>;
    public static get instance(): CenterSystem {
        return this._instance;
    }
    
    constructor() {
        super(Constants.ServicType.CenterServic);
        this._accept = new AcceptServer(this);
        this._userMap = new Map<Uint32, Agent>();
        this._unique = Constants.ServicType.GatewayServic;
    }

    public get useMap(): Map<Uint32, Agent> {
        return this._userMap;
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

    public open(host: string, port: number): void {
        super.open(host, port, Constants.ConnectType.Tcp);
        // 连接网关
        this._accept.open(host, port, Constants.AcceptOperate.active, false, (session: Session) => {
            session.serviceType = Constants.ServicType.GatewayServic;
            this._gateSession = session;
            this._gateSession.open();
            session.unique = Constants.ServicType.GatewayServic;
            this.openSession(session);
        });
    }

    public closeSession(handle: Uint32, reason: Constants.ResultCode): Session {
        let session = super.closeSession(handle, reason);
        if (session == this._gateSession) {
            this.close();
        }
        return session;
    }
    
}