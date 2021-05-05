/**
 * 协议约定模型文件
 */

declare namespace Protocols {

    // 网关创建账户
    const enum CreateUserFields {
        account = 0,
        password = 1,
        name = 2,
        sex = 3,
    }
    type CreateUser = [string, string, string, number];

    // 网关登录验证
    const enum GatewayAuthLoginFields {
        account = 0,
        password = 1,
    }
    type GatewayAuthLogin = [string, string];

    // 登录中心服返回
    const enum LoginCenterReplyFields {
        code = 0,
    }
    type LoginCenterReply = [number];

    // 创建账号（TO Center）返回
    const enum CreateUserToCenterReplyFields {
        code = 0,
    }
    type CreateUserToCenterReply = [number];

    // 登录世界服（TO World）返回
    const enum LoginWorldReplyFields {
        code = 0,
    }
    type LoginWorldReply = [number];

    // 创建角色（To Center）
    const enum CreateUserToCenterFields {
        uid = 0,
        name = 1,
        sex = 2,
    }
    type CreateUserToCenter = [number, string, number];

    // 网关登录验证
    const enum LoginCenterFields {
        uid = 0,
    }
    type LoginCenter = [number];

    // 登录到世界服
    const enum LoginWorldFields {
        uid = 0,
        name = 1,
        sex = 2,
    }
    type LoginWorld = [number, string, number];

    // 用户登录返回
    const enum AuthUserLoginReplyFields {
        code = 0,
    }
    type AuthUserLoginReply = [number];

    // 创建用户返回
    const enum CreateUserReplyFields {
        code = 0,
    }
    type CreateUserReply = [number];

    // 客户端创建账号
    const enum CreateFields {
        account = 0,
        password = 1,
        name = 2,
        sex = 3,
    }
    type Create = [string, string, string, number];

    // 客户端登录账号
    const enum LoginFields {
        account = 0,
        password = 1,
    }
    type Login = [string, string];

    const enum GatewayProtocolCode {
        CreateUser = 0x100001,  // 网关创建账户
        GatewayAuthLogin = 0x100002,  // 网关登录验证
        LoginCenterReply = 0x100003,  // 登录中心服返回
        CreateUserToCenterReply = 0x100004,  // 创建账号（TO Center）返回
        LoginWorldReply = 0x100005,  // 登录世界服（TO World）返回
    }

    const enum CenterProtocolCode {
        CreateUserToCenter = 0x200001,  // 创建角色（To Center）
        LoginCenter = 0x200002,  // 网关登录验证
    }

    const enum WorldProtocolCode {
        LoginWorld = 0x300001,  // 登录到世界服
    }

    const enum ClientProtocolCode {
        AuthUserLoginReply = 0x900001,  // 用户登录返回
        CreateUserReply = 0x900002,  // 创建用户返回
    }

    const enum HttpProtocolPath {
        Create = "/user/Create",  // 客户端创建账号
        Login = "/user/Login",  // 客户端登录账号
    }

    interface ProtocolsTuple {
        [GatewayProtocolCode.CreateUser]: CreateUser;
        [GatewayProtocolCode.GatewayAuthLogin]: GatewayAuthLogin;
        [GatewayProtocolCode.LoginCenterReply]: LoginCenterReply;
        [GatewayProtocolCode.CreateUserToCenterReply]: CreateUserToCenterReply;
        [GatewayProtocolCode.LoginWorldReply]: LoginWorldReply;
        [CenterProtocolCode.CreateUserToCenter]: CreateUserToCenter;
        [CenterProtocolCode.LoginCenter]: LoginCenter;
        [WorldProtocolCode.LoginWorld]: LoginWorld;
        [ClientProtocolCode.AuthUserLoginReply]: AuthUserLoginReply;
        [ClientProtocolCode.CreateUserReply]: CreateUserReply;
    }

    interface RequestTuple {
        [HttpProtocolPath.Create]: Create;
        [HttpProtocolPath.Login]: Login;
    }
}