/**
 * 网络协议定义
 */
declare namespace Protocols {

    /*************************** Base start ***************************/
    const enum ServicType {
        GatewayServic = 0x100000,   // 网关服务
        CenterServic = 0x200000,    // 中心服务
        FeatureServic = 0x300000,   // 功能服务
        SystemServic = 0x400000,    // 系统服务
        Client = 0x900000,          // 客户端类型
    }

    const enum SignType {
        Ping = 0x01,    // 心跳消息
        Auth = 0x02,    // 验证消息
        Data = 0x04,    // 数据消息
    }
    const enum MessageType {
        Push = 0x01,   // 推送
        Wait = 0x02,   // 等待回应
        Reply = 0x03,  // 回复
    }

    /*************************** Base start ***************************/
    // account password name sex 
    const enum CreateAndLoginUserFields {
        account = 0,
        name = 1,
        sex = 2,
    }
    type CreateAndLoginUser = [string, string, number];

    const enum CreateUserFields {
        account = 0,
        password = 1,
        name = 2,
        sex = 3,
    }
    type CreateUser = [string, string, string, number];

    // 官网验证登陆
    const enum GatewayLoginAuthFiends {
        account = 0,
        password = 1,
    }
    type GatewayLoginAuth = [string, string];

    const enum LoginCenterReplyFields {
        code = 0,
    }
    type LoginCenterReply = [number]

    type CenterLoginInfo = [];


    const enum LoginCenterFields {
        uid = 0,
    }
    type LoginCenter = [number]
    
    /*************************** Tuple start ***************************/
    interface ProtocolsTuple {
        [GatewayProtocolCode.CreateUser]: CreateUser;
        [GatewayProtocolCode.GatewayAuthLogin]: GatewayLoginAuth;
        [GatewayProtocolCode.LoginCenterReply]: LoginCenterReply;
        [GatewayProtocolCode.CreateUserToCenterReply]: CreateUserToCenterReply;
        
        [CenterProtocolCode.CreateUserToCenter]: CreateUserToCenter;
        [CenterProtocolCode.AuthUserLogin]: CenterLoginInfo;
        [CenterProtocolCode.LoginCenter]: LoginCenter;

        [ClientProtocolCode.AuthUserLoginReply]: AuthUserLoginReply;
        [ClientProtocolCode.CreateUserReply]: CreateUserReply;
        
    }

    /*************************** Tuple end ***************************/

    /*************************** Code start ***************************/
    
    
    const enum CreateUserToCenterReplyFields {
        code = 0,
    }
    type CreateUserToCenterReply = [number];
    
    const enum GatewayProtocolCode {
        Base = 0x100000,                    // 起始段
        CreateUser = 0x100001,              // 创建角色
        GatewayAuthLogin = 0x100002,        // 网关登录
        LoginCenterReply = 0x100003,        // 登录中心服返回
        CreateUserToCenterReply = 0x100004, // 创建角色返回
        Max = 0x1fffff,
    }
    
    
    const enum CreateUserToCenterFields {
        uid = 0,
        name = 1,
        sex = 2,
    }
    type CreateUserToCenter = [number, string, number];

    const enum CenterProtocolCode {
        Base = 0x200000,                 // 起始段
        CreateUserToCenter = 0x200001,   // 创建角色 
        AuthUserLogin = 0x200002,        // 验证角色登录
        LoginCenter = 0x200003,          // 登录中心服务
        Max = 0x2fffff,
    }

    const enum AuthUserLoginReplyFields {
        code = 0,
    }
    type AuthUserLoginReply = [number];

    const enum CreateUserReplyFields {
        code = 0,
    }
    type CreateUserReply = [number];

    const enum ClientProtocolCode {
        Base = 0x900000,                 // 起始段
        CreateUserReply = 0x900001,      // 客户端创角返回
        AuthUserLoginReply = 0x900002,   // 验证角色登录返回
        Max = 0x9fffff,
    }

    const enum ProtocolCode {
        ProtocolsCodeMax = 0xF00000,      
    }
    /*************************** Code end ***************************/

    const enum AcceptOperate {
        active = 1,
        passive,
    }

    const enum RequestType {
        Get = 1,
        Post = 2,
    }

    
    /*************************** Http start ***************************/

    enum CreateFields {
        account = 0,
        password = 1,
        name = 2,
        sex = 3,
    }
    type Create = [string, string, string, number];

    enum LoginFields {
        account = 0,
        password = 1,
        name = 2,
        sex = 3,
    }
    type Login = [string, string, string, number];

    const enum HttpProtocolPath {
        CreateAccount = "/user/createAccount",
        Create = "/user/create",
        Login = "/user/login",
    }

    interface RequestTuple {
        [HttpProtocolPath.Create]: Create,
        [HttpProtocolPath.Login]: Login,
    }
    /*************************** Http end ***************************/

}
    

    


    


