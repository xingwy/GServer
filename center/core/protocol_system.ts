import { Agent } from "../base/agent";
import { CenterSystem } from "./center_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";

// 验证登录  大概为 gateway => center(拿数据) => gateway => client
CenterSystem.instance.registerWaitProtocol(
    Protocols.CenterProtocolCode.LoginCenter,
    Protocols.SignType.Data,
    async function(this: System, session: Session, token: Uint32, tuple: Protocols.LoginCenter): Promise<void> {
        let uid = tuple[Protocols.LoginCenterFields.uid];
        if ((<CenterSystem>this).useMap.has(uid)) {
            // 重新登录
        } else {
            // 登录
            let agent = new Agent(uid);
            await agent.load();
            (<CenterSystem>this).useMap.set(uid, agent);
        }
        let msg: Protocols.LoginCenterReply = [uid, "xingwy login"]
        this.replyProtocol(session, Protocols.GatewayProtocolCode.LoginCenterReply, token, msg);
    }
);
