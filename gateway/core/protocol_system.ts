import { GatewaySystem } from "./gateway_system";
import { System } from "../../singleton/core/system";
import { Session } from "../../singleton/network/session";
import { ModuleSystem } from "./module_system";

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
            this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply, [Constants.ResultCode.UserNotExist]); 
            return;
        }
        let userInfo = accountMod.getUser(account);
        // 登录center服务器
        let centerServic = this.getServicSession(Protocols.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            return;
        }
        let msg: Protocols.LoginCenter = [userInfo && userInfo.uid || 112233]
        let loginCenterReply = await this.invokeProtocol(centerServic, Protocols.CenterProtocolCode.LoginCenter, Protocols.GatewayProtocolCode.LoginCenterReply, msg);

        let code = loginCenterReply[Protocols.LoginCenterReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            // 登录失败
            this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply,[code]);
            return;
        }

        // 认为登录成功， 开启session映射表
        this.setUserSession(userInfo.uid, session);
        // 推动客户端登录成功协议
        this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply,[Constants.ResultCode.Success]);
    },
);


GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.CreateUser,
    Protocols.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.CreateUser): Promise<void> {
        let account = tuple[Protocols.CreateUserFields.account];
        let password = tuple[Protocols.CreateUserFields.password];
        let name = tuple[Protocols.CreateUserFields.name];
        let sex = tuple[Protocols.CreateUserFields.sex];

        // 检测account是否存在
        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleMgrName.AccountMgr);
        let user = accountMod.getUser(account);
        if (user) {
            // 已存在
            this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [Constants.ResultCode.ExistUser]);
            return;
        }

        // 拿center服务器session
        let centerServic = this.getServicSession(Protocols.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [Constants.ResultCode.ServicNotExist]);
            return;
        }
        let createUserToCenterReply = await this.invokeProtocol(centerServic, Protocols.CenterProtocolCode.LoginCenter, Protocols.GatewayProtocolCode.LoginCenterReply, [0, name, sex])
        let code = createUserToCenterReply[Protocols.CreateUserToCenterReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [code]);
            return;
        }
        code = await accountMod.createUser(account, password);
        // 保存account uid passward映射表
        if (code != Constants.ResultCode.Success) {
            if (code != Constants.ResultCode.Success) {
                this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [code]);
                return;
            }
        }
        this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [Constants.ResultCode.Success]);
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