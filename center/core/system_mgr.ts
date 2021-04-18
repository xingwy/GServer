import { Session } from "../../singleton/network/session";
import { System } from "../../singleton/core/system";
import { CenterSystem } from "./center_system";


// 系统之间消息协议

CenterSystem.instance.registerProtocol(
    Protocols.CenterProtocolCode.CreateAndLoginUser,
    1,
    function(this: System, session: Session, tuple: Protocols.CreateAndLoginUser) {
        // 创建session 存储session
        let account = tuple[Protocols.CreateAndLoginUserFields.account];
        let name = tuple[Protocols.CreateAndLoginUserFields.name];
        let sex = tuple[Protocols.CreateAndLoginUserFields.sex];

        // TODO
        
    },
);

