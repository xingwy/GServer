import { CenterSystem } from "./center_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";

// 验证登录  大概为 gateway => center(拿数据) => gateway => client
CenterSystem.instance.registerWaitProtocol(
    Protocols.CenterProtocolCode.LoginCenter,
    Protocols.SignType.Data,
    async function(this: System, session: Session, token: Uint32, tuple: Protocols.LoginCenter): Promise<void> {
        let uid = tuple[Protocols.LoginCenterFields.uid];
       console.log(uid);
       let msg: Protocols.LoginCenterReply = [uid, "xingwy login"]
       this.replyProtocol(session, Protocols.GatewayProtocolCode.LoginCenterReply, token, msg);
    }
);
