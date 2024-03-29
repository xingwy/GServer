import { WorldSystem } from "./world_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { ModuleSystem } from "./module_system";

// 角色登入世界服 保存其映射的网关
WorldSystem.instance.registerWaitProtocol(
    Protocols.WorldProtocolCode.LoginWorld,
    Constants.SignType.Data,
    async function(this: System, session: Session, token: Uint32, tuple: Protocols.LoginWorld): Promise<void> {
        let uid = tuple[Protocols.LoginWorldFields.uid];
        let name = tuple[Protocols.LoginWorldFields.name];
        let sex = tuple[Protocols.LoginWorldFields.sex];
        let worldUserMgr = ModuleSystem.instance.getModuleMgr(Constants.ModuleName.WorldUserMgr)
        let user = worldUserMgr.getUser(uid);
        let userInfo = {name, sex};
        let code: Constants.ResultCode;
        if (user) {
            // LOG 覆盖登录
            code = worldUserMgr.login(uid, userInfo);
        } else {
            // 正常登录
            code = worldUserMgr.login(uid, userInfo);
        }

        this.replyProtocol(session, Protocols.GatewayProtocolCode.LoginWorldReply, token, [code]) 
    },
);

WorldSystem.instance.registerProtocol(
    Protocols.WorldProtocolCode.SendChat,
    Constants.SignType.Data,
    async function(this: System, session: Session, tuple: Protocols.SendChat): Promise<void> {
        let sender = tuple[Protocols.SendChatFields.sender];
        let channel = tuple[Protocols.SendChatFields.channel];
        let content = tuple[Protocols.SendChatFields.content];
        let receiver = tuple[Protocols.SendChatFields.receiver];
        let worldChatMgr = ModuleSystem.instance.getModuleMgr(Constants.ModuleName.WorldChatMgr);
        if (!worldChatMgr) {
            this.publishProtocol(session, Protocols.ClientProtocolCode.SendChatReply, [Constants.ResultCode.ModuleNotExist]);
            return;
        }
        let code = worldChatMgr.handleChat(sender, channel, content, receiver);
        this.publishProtocol(session, Protocols.ClientProtocolCode.SendChatReply, [code]);
    }
);

// 测试 world服发给center服务器
WorldSystem.instance.registerProtocol(
    Protocols.WorldProtocolCode.CenterSendToWorld,
    Constants.SignType.Data,
    async function(this: System, session: Session, tuple: Protocols.CenterSendToWorld): Promise<void> {
        console.log("CenterSendToWorld", tuple);
    }
);

// 测试 world服发给center服务器
WorldSystem.instance.registerWaitProtocol(
    Protocols.WorldProtocolCode.WaitCenterSendToWorld,
    Constants.SignType.Data,
    async function(this: System, session: Session, token: Uint32, tuple: Protocols.WaitCenterSendToWorld): Promise<void> {
        this.replyProtocol(session, Protocols.CenterProtocolCode.WaitCenterSendToWorldReply, token, [2]) 
    },
);

// 测试路由连接
setInterval(async () => {
    let gateway = WorldSystem.instance.getServicSession(Constants.ServicType.GatewayServic);
    
    let data = await WorldSystem.instance.invokeProtocol(gateway, Protocols.CenterProtocolCode.WaitWorldSendToCenter, Protocols.WorldProtocolCode.WaitWorldSendToCenterReply, [4]);
}, 3000)
