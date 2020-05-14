import { GatewaySystem } from "./gateway_system";
import { SystemBase } from "../../singleton/network/system_base";
import { Session } from "../../singleton/network/base/session";
import { ModuleUserMgr } from "../modules/module_user";

GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.AuthUserLogin,
    Protocols.SignType.Auth,
    async function(this: SystemBase, session: Session, tuple: Protocols.GatewayLoginAuth): Promise<void> {
        let account = tuple[0];
        let password = tuple[1];
        let result = ModuleUserMgr.instance.authUser(account, password);
        
    },
);
GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.CreateUser,
    Protocols.SignType.Auth,
    async function(this: SystemBase, session: Session, tuple: Protocols.CreateUser): Promise<void> {
        let account = tuple[0];
        let password = tuple[1];
        let name = tuple[2];
        let sex = 0;

        let result = ModuleUserMgr.instance.createUser(account, password, name, sex);

    },
);