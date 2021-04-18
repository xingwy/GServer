import { GatewaySystem } from "./gateway_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { ModuleUserMgr } from "../modules/module_user_mgr/module_user_mgr";
import * as Http from "http";

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

        // let result = ModuleUserMgr.instance.createUser(account, password, name, sex);

    },
);

GatewaySystem.instance.registerHttp(
    Protocols.HttpProtocolPath.Create,
    Protocols.RequestType.Post,
    async function(this: System, resquest: Http.ClientRequest, tuple: Protocols.Create): Promise<void> {
        let account = tuple[Protocols.CreateFields.account];
        let password = tuple[Protocols.CreateFields.password];
        let name = tuple[Protocols.CreateFields.name];
        let sex = tuple[Protocols.CreateFields.sex];

        // 创建角色 调用中心服角色创建 获取角色ID（或者gateway去处理ID问题） TODO
        // 校验账号 name
        let code = ResultCode.Success;
        if (ModuleUserMgr.instance.existUser(account)) {
            // 账号存在
        }

        code = ModuleUserMgr.instance.createUser(account, password, name, sex);

        // 返回给客户端code
        // let result = ModuleUserMgr.instance.createUser(account, password, name, sex);
    },
);

GatewaySystem.instance.registerHttp(
    Protocols.HttpProtocolPath.Login,
    Protocols.RequestType.Post,
    async function(this: System, resquest: Http.ClientRequest, tuple: Protocols.Login): Promise<void> {
        let account = tuple[0];
        let password = tuple[1];
        let name = tuple[2];
        let sex = 0;

        // let result = ModuleUserMgr.instance.createUser(account, password, name, sex);

    },
);