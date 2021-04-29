import { WorldSystem } from "./world_system";
import { System } from "../../singleton/core/system";
import { UserMgr, BaseInfo } from "../modules/user_mgr";
import { Session } from "../../singleton/network/session";

// 角色登入世界服 保存其映射的网关
WorldSystem.instance.registerWaitProtocol(
    Protocols.WorldProtocolCode.LoginWorld,
    Protocols.SignType.Data,
    async function(this: System, session: Session, token: Uint32, tuple: Protocols.LoginWorld): Promise<void> {
        let uid = tuple[Protocols.LoginWorldFields.uid];
        let name = tuple[Protocols.LoginWorldFields.name];
        let sex = tuple[Protocols.LoginWorldFields.sex];

        let user = UserMgr.instance.getUser(uid);
        let userInfo = {name, sex};
        let code: Constants.ResultCode;
        if (user) {
            // LOG 覆盖登录
            code = UserMgr.instance.login(uid, userInfo);
        } else {
            // 正常登录
            code = UserMgr.instance.login(uid, userInfo);
        }

        this.replyProtocol(session, Protocols.GatewayProtocolCode.LoginWorldReply, token, [code]) 
    },
);
