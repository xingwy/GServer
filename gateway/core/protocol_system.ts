import { GatewaySystem } from "./gateway_system";
import { System } from "../../singleton/core/system";
import { ClientSession, Session } from "../../singleton/network/session";
import { ModuleSystem } from "./module_system";
import { Agent } from "../base/agent";

// 验证登录  大概为 gateway => center(拿数据) => gateway => client
GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.GatewayAuthLogin,
    Constants.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.GatewayAuthLogin): Promise<void> {
        let account = tuple[Protocols.GatewayAuthLoginFields.account];
        let password = tuple[Protocols.GatewayAuthLoginFields.password];
        // 本地验证 获取到Uid
        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleName.AccountMgr);
        let exist = accountMod.existUser(account);
        if (!exist) {
            this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply, [Constants.ResultCode.UserNotExist]); 
            return;
        }
        let code = accountMod.authUser(account, password);
        if (code != Constants.ResultCode.Success) {
            this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply, [code]);
            return;
        }
        let userInfo = accountMod.getUser(account);
        // 登录center服务器
        let centerServic = this.getServicSession(Constants.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            return;
        }
        let msg: Protocols.LoginCenter = [userInfo && userInfo.uid]
        let loginCenterReply = await this.invokeProtocol(centerServic, Protocols.CenterProtocolCode.LoginCenter, Protocols.GatewayProtocolCode.LoginCenterReply, msg);
        code = loginCenterReply[Protocols.LoginCenterReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            // 登录失败
            this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply,[code]);
            return;
        }

        let worldServic = this.getServicSession(Constants.ServicType.WorldServic);
        if (!worldServic) {
            // world未连接 
            return;
        }
        let loginWorldReply = await this.invokeProtocol(worldServic, Protocols.WorldProtocolCode.LoginWorld, Protocols.GatewayProtocolCode.LoginWorldReply, msg);
        code = loginWorldReply[Protocols.LoginWorldReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            // 登录失败
            this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply,[code]);
            return;
        }
        
        // 认为登录成功， 开启session映射表
        this.setUserSession(userInfo.uid, session);
        (<ClientSession>session).vaild =  true;
        (<ClientSession>session).agent =  new Agent(userInfo.uid);
        // 推动客户端登录成功协议
        this.publishProtocol(session, Protocols.ClientProtocolCode.AuthUserLoginReply,[Constants.ResultCode.Success]);
    },
);


GatewaySystem.instance.registerProtocol(
    Protocols.GatewayProtocolCode.CreateUser,
    Constants.SignType.Auth,
    async function(this: System, session: Session, tuple: Protocols.CreateUser): Promise<void> {
        let account = tuple[Protocols.CreateUserFields.account];
        let password = tuple[Protocols.CreateUserFields.password];
        let name = tuple[Protocols.CreateUserFields.name];
        let sex = tuple[Protocols.CreateUserFields.sex];

        // 检测account是否存在
        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleName.AccountMgr);
        let user = accountMod.getUser(account);
        if (user) {
            // 已存在
            this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [Constants.ResultCode.ExistUser]);
            return;
        }
        console.log(user)
        // 拿center服务器session
        let centerServic = this.getServicSession(Constants.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            this.publishProtocol(session, Protocols.ClientProtocolCode.CreateUserReply, [Constants.ResultCode.ServicNotExist]);
            return;
        }
        let createUserToCenterReply = await this.invokeProtocol(centerServic, Protocols.CenterProtocolCode.LoginCenter, Protocols.GatewayProtocolCode.LoginCenterReply, [0, name, sex])
        let code = createUserToCenterReply[Protocols.CreateUserToCenterReplyFields.code];
        console.log(code);
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
    Protocols.HttpProtocolPath.Login,
    Constants.RequestType.Post,
    async function(this: System, query: any, params: any): Promise<void> {
    },
);

// 登录失败的时候 创建 
GatewaySystem.instance.registerHttp(
    Protocols.HttpProtocolPath.Create,
    Constants.RequestType.Post,
    async function(this: System, query: any, params: any): Promise<any> {
        return {};
    },
);