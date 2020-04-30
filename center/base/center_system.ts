import { SystemBase } from "../../singleton/network/system_base";
import { Session } from "../../singleton/network/base/session";
import { AcceptServer } from "../../singleton/network/base/accept";

export class CenterSystem extends SystemBase {

    private static _instance: CenterSystem = new CenterSystem();

    protected _accept: AcceptServer;
    protected _gateSession: Session;     
    public static get instance(): CenterSystem {
        return this._instance;
    }
    
    constructor() {
        super(Protocols.ServerType.CenterServic);
        this._accept = new AcceptServer(this);
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
        process.exit(0);
    }

    public open(host: string, port: number): void {
        super.open(host, port);
        // 连接网关
        this._accept.open(host, port, Protocols.AcceptOperate.active, false, (session: Session) => {
            session.serviceType = Protocols.ServerType.GatewayServic;
            this._gateSession = session;
            console.log("连接");
            setInterval(() => {
                this.publishProtocol(this._gateSession, 1, Buffer.from("hello"));
            },          5000);
            
        });
        
    }
}