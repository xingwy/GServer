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

    const enum MessageType {
        Push = 0x01,   // 推送
        Wait = 0x02,   // 等待回应
        Reply = 0x03,  // 回复
    }

    /*************************** Base start ***************************/
    
    /*************************** Tuple start ***************************/
    interface ProtocolsTuple {
        [CenterProtocolCode.AuthUserLogin]: number,
        
    }

    /*************************** Tuple end ***************************/


    /*************************** Code start ***************************/
    const enum CenterProtocolCode {
        Base = 0x200000,                 // 起始段
        AuthUserLogin = 0x200001,        // 验证角色登录
        Max = 0x2fffff,
    }
    const ProtocolsCodeMax = 0xF00000;
    /*************************** Code end ***************************/

    const enum AcceptOperate {
        active = 1,
        passive,
    }

}
    

    


    


