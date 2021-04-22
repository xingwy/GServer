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
    enum CreateAndLoginUserFields {
        account = 0,
        name = 1,
        sex = 2,
    }
    type CreateAndLoginUser = [string, string, number];

    enum CreateUserFields {
        account = 0,
        password = 1,
        name = 2,
        sex = 3,
    }
    type CreateUser = [string, string, number, number];

    // 官网验证登陆
    const enum GatewayLoginAuthFiends {
        account = 0,
        password = 1,
    }
    type GatewayLoginAuth = [string, string];

    type CenterLoginInfo = [];

    /*************************** Tuple start ***************************/
    interface ProtocolsTuple {
        [GatewayProtocolCode.CreateUser]: CreateUser,
        [GatewayProtocolCode.GatewayAuthLogin]: GatewayLoginAuth,

        [CenterProtocolCode.CreateAndLoginUser]: CreateAndLoginUser,
        [CenterProtocolCode.AuthUserLogin]: CenterLoginInfo,
        
    }

    /*************************** Tuple end ***************************/

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


    /*************************** Code start ***************************/
    const enum GatewayProtocolCode {
        Base = 0x100000,                 // 起始段
        CreateUser = 0x100001,           // 创建角色
        GatewayAuthLogin = 0x100002,        // 网关登录
    }
    
    const enum CenterProtocolCode {
        Base = 0x200000,                 // 起始段
        CreateAndLoginUser = 0x200001,   // 创建角色 
        AuthUserLogin = 0x200002,        // 验证角色登录
        Max = 0x2fffff,
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

}
    

    


    


