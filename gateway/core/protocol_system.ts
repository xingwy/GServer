import { GatewaySystem } from "./gateway_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { ModuleSystem } from "./module_system";
import { ModuleAccountMgr } from "../modules/module_account_mgr/module_account_mgr";

// 验证登录  大概为 gateway => center(拿数据) => gateway => client
GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.GatewayAuthLogin,
    Protocols.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.GatewayLoginAuth): Promise<void> {
        let account = tuple[Protocols.GatewayLoginAuthFiends.account];
        let password = tuple[Protocols.GatewayLoginAuthFiends.password];
        // 本地验证 获取到Uid
        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleMgrName.AccountMgr);
        let exist = accountMod.existUser(account);
        if (!exist) {
            // reply 
            return;
        }
        let userInfo = accountMod.getUser(account);
        // 登录center服务器
        let centerServic = this.getServicSession(Protocols.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            return;
        }
        let msg: Protocols.LoginCenter = [userInfo.uid]
        let loginCenterReply = await this.invokeProtocol(centerServic, Protocols.CenterProtocolCode.LoginCenter, Protocols.GatewayProtocolCode.LoginCenterReply, msg);
        console.log(loginCenterReply);
        
        this.publishProtocol(session, 1,["ok", "123"])
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
        this.publishProtocol(session, 1, [account, 1, password]);
    },
);

GatewaySystem.instance.registerHttp(
    Protocols.HttpProtocolPath.CreateAccount,
    Protocols.RequestType.Post,
    async function(this: System, query: Object, params: Object): Promise<Object> {
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
setTimeout(() => {
let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleMgrName.AccountMgr);
    
}, 2000);