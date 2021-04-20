import { GatewaySystem } from "./gateway_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
// 验证登录  大概为 gateway => center(拿数据) => gateway => client
GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.AuthUserLogin,
    Protocols.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.GatewayLoginAuth): Promise<void> {
        let account = tuple[0];
        let password = tuple[1];
        // let result = ModuleUserMgr.instance.authUser(account, password);
        
        
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

        // let result = ModuleUserMgr.instance.createUser(account, password, name, sex);

    },
);

GatewaySystem.instance.registerHttp(
    Protocols.HttpProtocolPath.CreateAccount,
    Protocols.RequestType.Post,
    async function(this: System, query: Object, params: Object): Promise<Object> {
        console.log(query, params)
        // 返回给客户端code
        // let result = ModuleUserMgr.instance.createUser(account, password, name, sex);
        return {success: true}
    },
);

GatewaySystem.instance.registerHttp(
    Protocols.HttpProtocolPath.Login,
    Protocols.RequestType.Post,
    async function(this: System, query: Object, params: Object): Promise<void> {
    

        // let result = ModuleUserMgr.instance.createUser(account, password, name, sex);

    },
);
