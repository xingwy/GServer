"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gateway_system_1 = require("./gateway_system");
const module_user_1 = require("../modules/module_user");
gateway_system_1.GatewaySystem.instance.registerProtocol(1048577 /* AuthUserLogin */, 2 /* Auth */, async function (session, tuple) {
    let account = tuple[0];
    let password = tuple[1];
    let result = module_user_1.ModuleUserMgr.instance.authUser(account, password);
});
gateway_system_1.GatewaySystem.instance.registerProtocol(2097153 /* CreateUser */, 2 /* Auth */, async function (session, tuple) {
    let account = tuple[0];
    let password = tuple[1];
    let name = tuple[2];
    let sex = 0;
    let result = module_user_1.ModuleUserMgr.instance.createUser(account, password, name, sex);
});
//# sourceMappingURL=module_mgr.js.map