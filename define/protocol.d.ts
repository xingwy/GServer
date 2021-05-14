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

    // 世界服发往中心服
    const enum WorldSendToCenterFields {
        code = 0,
    }
    type WorldSendToCenter = [number];

    // 世界服发往中心服
    const enum WaitWorldSendToCenterFields {
        code = 0,
    }
    type WaitWorldSendToCenter = [number];

    // 世界服发往中心服 reply
    const enum WaitCenterSendToWorldReplyFields {
        code = 0,
    }
    type WaitCenterSendToWorldReply = [number];

    // 登录到世界服
    const enum LoginWorldFields {
        uid = 0,
        name = 1,
        sex = 2,
    }
    type LoginWorld = [number, string, number];

    // 聊天消息
    const enum SendChatFields {
        sender = 0,
        channel = 1,
        receiver = 2,
        content = 3,
    }
    type SendChat = [number, number, number, string];

    // 中心服发往世界服
    const enum CenterSendToWorldFields {
        code = 0,
    }
    type CenterSendToWorld = [number];

    // 中心服发往世界服
    const enum WaitWorldSendToCenterReplyFields {
        code = 0,
    }
    type WaitWorldSendToCenterReply = [number];

    // 中心服发往世界服 wait协议
    const enum WaitCenterSendToWorldFields {
        code = 0,
    }
    type WaitCenterSendToWorld = [number];

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

    // 聊天返回
    const enum SendChatReplyFields {
        code = 0,
    }
    type SendChatReply = [number];

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
        WorldSendToCenter = 0x200003,  // 世界服发往中心服
        WaitWorldSendToCenter = 0x200004,  // 世界服发往中心服
        WaitCenterSendToWorldReply = 0x200005,  // 世界服发往中心服 reply
    }

    const enum WorldProtocolCode {
        LoginWorld = 0x300001,  // 登录到世界服
        SendChat = 0x300002,  // 聊天消息
        CenterSendToWorld = 0x300003,  // 中心服发往世界服
        WaitWorldSendToCenterReply = 0x300004,  // 中心服发往世界服
        WaitCenterSendToWorld = 0x300005,  // 中心服发往世界服 wait协议
    }

    const enum ClientProtocolCode {
        AuthUserLoginReply = 0x900001,  // 用户登录返回
        CreateUserReply = 0x900002,  // 创建用户返回
        SendChatReply = 0x900003,  // 聊天返回
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
        [CenterProtocolCode.WorldSendToCenter]: WorldSendToCenter;
        [CenterProtocolCode.WaitWorldSendToCenter]: WaitWorldSendToCenter;
        [CenterProtocolCode.WaitCenterSendToWorldReply]: WaitCenterSendToWorldReply;
        [WorldProtocolCode.LoginWorld]: LoginWorld;
        [WorldProtocolCode.SendChat]: SendChat;
        [WorldProtocolCode.CenterSendToWorld]: CenterSendToWorld;
        [WorldProtocolCode.WaitWorldSendToCenterReply]: WaitWorldSendToCenterReply;
        [WorldProtocolCode.WaitCenterSendToWorld]: WaitCenterSendToWorld;
        [ClientProtocolCode.AuthUserLoginReply]: AuthUserLoginReply;
        [ClientProtocolCode.CreateUserReply]: CreateUserReply;
        [ClientProtocolCode.SendChatReply]: SendChatReply;
    }

    interface RequestTuple {
        [HttpProtocolPath.Create]: Create;
        [HttpProtocolPath.Login]: Login;
    }
}