/**
 * 网络协议定义
 */
declare namespace Protocols {

    /*************************** Base start ***************************/
    const enum ServerType {
        GatewayServic = 0x100000,   // 网关服务
        CenterServic = 0x200000,    // 中心服务
        FeatureServic = 0x300000,   // 功能服务
        SystemServic = 0x400000,    // 系统服务
    }

    const enum SignType {
        Ping = 1,
        Auth = 2,

    }
    const enum MessageType {
        Push = 0x01,   // 推送
        Wait = 0x02,   // 等待回应
        Reply = 0x03,  // 回复
    }

    /*************************** Base start ***************************/
    // account password name sex 
    type CreateUser = [string, string, string, number];
    type GatewayLoginAuth = [string, string];

    type CenterLoginInfo = [];

    /*************************** Tuple start ***************************/
    interface ProtocolsTuple {
        [GatewayProtocolCode.CreateUser]: CreateUser,
        [GatewayProtocolCode.AuthUserLogin]: GatewayLoginAuth,


        [CenterProtocolCode.AuthUserLogin]: CenterLoginInfo,
        
    }

    /*************************** Tuple end ***************************/


    /*************************** Code start ***************************/
    const enum GatewayProtocolCode {
        Base = 0x100000,                 // 起始段
        CreateUser = 0x200001,           // 创建角色
        AuthUserLogin = 0x100001,        // 网关登录
    }
    
    const enum CenterProtocolCode {
        Base = 0x200000,                 // 起始段
        AuthUserLogin = 0x200002,        // 验证角色登录
        Max = 0x2fffff,
    }
    const ProtocolsCodeMax = 0xF00000;
    /*************************** Code end ***************************/

    const enum AcceptOperate {
        active = 1,
        passive,
    }

}
    

    


    


