declare namespace Constants { 

    const ProtocolsCodeMax = 0xFFFFFF;
    const ProtocolsCodeAuth = 0xF00000;
    const enum ServicType {
        GatewayServic = 0x100000,   // 网关服务
        CenterServic = 0x200000,    // 中心服务
        WorldServic = 0x300000,     // 世界服务
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

    const enum AcceptOperate {
        active = 1,
        passive,
    }

    const enum RequestType {
        Get = 1,
        Post = 2,
    }

    // 后期脚本整合错误码
    const enum ResultCode {
        Success = 0,     // 成功
        UnknownError = 1,       // 未知错误
        ServicNotExist = 2,     // 服务不存在
        ExistUser = 3,   // 角色已经存在
        WrongPassword = 3,  // 密码错误
        UserNotExist = 4,   // 角色不存在
    }

    const enum SexType {
        Man = 1,
        Woman = 2,
    }

    const enum ModuleName {
        Human = "ModuleHuman",
        Bag = "ModuleBag",
        AccountMgr = "AccountMgr",
    }

    const enum ConnectType {
        Tcp = 1,
        Http = 2,
    }

    const enum AcceptState {
        connecting,
        connected,
        closed,
    }
    const enum AcceptType {
        server = 1,
        client = 2,
    } 
}