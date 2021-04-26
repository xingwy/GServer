import { Agent } from "../base/agent";
import { CenterSystem } from "./center_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";

// 创角  gateway调用center 创建user基础数据， uid在gateway生成，创角色成功保存 account <=> uid 映射表
CenterSystem.instance.registerWaitProtocol(
    Protocols.CenterProtocolCode.CreateUserToCenter,
    Protocols.SignType.Data,
    async function(this: System, session: Session, token: Uint32, tuple: Protocols.CreateUserToCenter): Promise<void> {
        let uid = tuple[Protocols.CreateUserToCenterFields.uid]
        let name = tuple[Protocols.CreateUserToCenterFields.name];
        let sex = tuple[Protocols.CreateUserToCenterFields.sex];
        let agent = new Agent(uid);
        let humanMod = agent.getModule(Constants.ModuleName.Human)
        humanMod.setName(name);
        humanMod.setSex(sex);
        let msg: Protocols.CreateUserToCenterReply = [Constants.ResultCode.Success];
        this.replyProtocol(session, Protocols.GatewayProtocolCode.CreateUserToCenterReply, token, msg);
    }
);

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
        let msg: Protocols.LoginCenterReply = [Constants.ResultCode.Success];
        this.replyProtocol(session, Protocols.GatewayProtocolCode.LoginCenterReply, token, msg);
    }
);
