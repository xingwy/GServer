import { GatewaySystem } from "./gateway_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { ModuleUserMgr } from "../modules/module_user";

GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.AuthUserLogin,
    Protocols.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.GatewayLoginAuth): Promise<void> {
        let account = tuple[0];
        let password = tuple[1];
        let result = ModuleUserMgr.instance.authUser(account, password);
        
    },
);
GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.CreateUser,
    Protocols.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.CreateUser): Promise<void> {
        let account = tuple[0];
        let password = tuple[1];
        let name = tuple[2];
        let sex = 0;

        let result = ModuleUserMgr.instance.createUser(account, password, name, sex);

    },
);