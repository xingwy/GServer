import { WorldSystem } from "./world_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";

// 角色登入世界服 保存其映射的网关
WorldSystem.instance.registerProtocol(
    Protocols.WorldProtocolCode.LoginWorld,
    Protocols.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.LoginWorld): Promise<void> {
        
    },
);
