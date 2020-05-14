"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mgr_base_1 = require("../base/mgr_base");
class ModuleUserMgr extends mgr_base_1.MgrBase {
    constructor() {
        super();
    }
    static get instance() {
        return this._instance;
    }
    checkUser(account) {
        if (this._userMap.has(account)) {
            return false;
        }
        return true;
    }
    createUser(account, password, name, sex) {
        // 检查重复账号
        if (!this.checkUser(account)) {
            return 1 /* Error */;
        }
        let user;
        user.account = account;
        user.password = password;
        user.name = name;
        user.sex = sex;
        this._userMap.set(account, user);
        return 0 /* Success */;
    }
    authUser(account, password) {
        if (!this._userMap.has(account)) {
            return 1 /* Error */;
        }
        let user = this._userMap.get(account);
        if (user.password !== password) {
            return 1 /* Error */;
        }
        return 0 /* Success */;
    }
}
ModuleUserMgr._instance = new ModuleUserMgr();
exports.ModuleUserMgr = ModuleUserMgr;
//# sourceMappingURL=module_user.js.map