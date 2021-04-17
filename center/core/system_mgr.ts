import { Session } from "../../singleton/network/session";
import { System } from "../../singleton/core/system";
import { CenterSystem } from "./center_system";


// 系统之间消息协议

CenterSystem.instance.registerProtocol(
    Protocols.CenterProtocolCode.AuthUserLogin,
    1,
    function(this: System, session: Session, tuple: Protocols.ProtocolsTuple[Protocols.CenterProtocolCode.AuthUserLogin]) {
        
    },
);

