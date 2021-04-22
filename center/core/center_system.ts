import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { AcceptServer } from "../../singleton/network/accept";

export class CenterSystem extends System {

    private static _instance: CenterSystem = new CenterSystem();

    protected _accept: AcceptServer;
    protected _gateSession: Session;     
    public static get instance(): CenterSystem {
        return this._instance;
    }
    
    constructor() {
        super(Protocols.ServicType.CenterServic);
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
        super.open(host, port, Constants.ConnectType.Tcp);
        // 连接网关
        this._accept.open(host, port, Protocols.AcceptOperate.active, false, (session: Session) => {
            session.serviceType = Protocols.ServicType.GatewayServic;
            this._gateSession = session;
            setInterval(() => {
                // 向geteway发送消息 拿session
                console.log('hello')
                this.publishProtocol(this._gateSession, 1, Buffer.from("hello"));
            },          5000);
            
        });
        
    }

    
}