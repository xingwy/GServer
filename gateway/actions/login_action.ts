import { ModuleSystem } from "../core/module_system";

export class LoginAction {
    private static _instance: LoginAction = new LoginAction();
    public static get instance(): LoginAction {
        return this._instance;
    }
    constructor() {
    }
    // 验证登陆 已有才会成功
    public async login(): Promise<{code: number, unique: number}> {

        let accountMod = ModuleSystem.instance.getModuleMgr(Constants.ModuleMgrName.AccountMgr);
        

        return {code: 0, unique: 1}
    }
}