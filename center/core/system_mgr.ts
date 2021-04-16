import { Session } from "../../singleton/network/session";
import { SystemBase } from "../../singleton/system/system_base";
import { CenterSystem } from "../base/center_system";


// 系统之间消息协议

CenterSystem.instance.registerProtocol(
    Protocols.CenterProtocolCode.AuthUserLogin,
    1,
    function(this: SystemBase, session: Session, tuple: Protocols.ProtocolsTuple[Protocols.CenterProtocolCode.AuthUserLogin]) {
        
    },
);

