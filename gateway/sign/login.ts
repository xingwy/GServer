import { Agent } from "../base/agent";
import { ModuleSystem } from "../core/module_system";
import { GatewaySystem } from "../core/gateway_system";
import { GlobelMgr } from "../../singleton/utils/globel";
import { ClientSession, Session } from "../../singleton/network/session";

export namespace Sign {
    export async function signLogin(account: string, password: string, session: ClientSession): Promise<Constants.ResultCode> {
        // 本地验证 获取到Uid
        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleName.AccountMgr);
        let exist = accountMod.existUser(account);
        let code;
        if (!exist) {
            // 调用创角
            code = await create(account, password);
            if (code != Constants.ResultCode.Success) {
                return code;
            }
            // return Constants.ResultCode.UserNotExist;
        }
        code = accountMod.authUser(account, password);
        if (code != Constants.ResultCode.Success) {
            return code;
        }
        let userInfo = accountMod.getUser(account);
        // 登录center服务器
        let centerServic = GatewaySystem.instance.getServicSession(Constants.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            return Constants.ResultCode.ServicNotExist;
        }
        let msg: Protocols.LoginCenter = [userInfo.uid]
        let loginCenterReply = await GatewaySystem.instance.invokeProtocol(centerServic, Protocols.CenterProtocolCode.LoginCenter, Protocols.GatewayProtocolCode.LoginCenterReply, msg);
        code = loginCenterReply[Protocols.LoginCenterReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            return code;
        }
        let name = loginCenterReply[Protocols.LoginCenterReplyFields.name];
        let sex = loginCenterReply[Protocols.LoginCenterReplyFields.sex];
        let worldServic = GatewaySystem.instance.getServicSession(Constants.ServicType.WorldServic);
        if (!worldServic) {
            // world未连接 
            return Constants.ResultCode.ServicNotExist;
        }
        let loginWorldReply = await GatewaySystem.instance.invokeProtocol(worldServic, Protocols.WorldProtocolCode.LoginWorld, Protocols.GatewayProtocolCode.LoginWorldReply, [userInfo.uid, name, sex]);
        code = loginWorldReply[Protocols.LoginWorldReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            // 登录失败
            return code;
        }
        
        // 认为登录成功， 开启session映射表
        session.unique = userInfo.uid;
        GatewaySystem.instance.setUserSession(userInfo.uid, session);
        (<ClientSession>session).vaild =  true;
        (<ClientSession>session).agent =  new Agent(userInfo.uid);
        return Constants.ResultCode.Success;
    }

    // 没有角色就创建 临时方案
    export async function create(account: string, password: string): Promise<Constants.ResultCode> {
        // 本地验证 获取到Uid
        let name = account;
        let sex = Constants.SexType.Man;

        // 检测account是否存在
        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleName.AccountMgr);
    
        // 拿center服务器session
        let centerServic = GatewaySystem.instance.getServicSession(Constants.ServicType.CenterServic);
        if (!centerServic) {
            // center未连接 reply
            return Constants.ResultCode.ServicNotExist;
        }

        
        
        let uid = GlobelMgr.instance.nextId();
        let createUserToCenterReply = await GatewaySystem.instance.invokeProtocol(centerServic, Protocols.CenterProtocolCode.CreateUserToCenter, Protocols.GatewayProtocolCode.CreateUserToCenterReply, [uid, name, sex])
        let code = createUserToCenterReply[Protocols.CreateUserToCenterReplyFields.code];
        if (code != Constants.ResultCode.Success) {
            return code;
        }

        code = await accountMod.createUser(uid, account, password);
        // 保存account uid passward映射表
        if (code != Constants.ResultCode.Success) {
            return code;
        }
        
        return Constants.ResultCode.Success;
    }
}