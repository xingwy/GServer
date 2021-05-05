import { ModuleAccountMgr } from "./module_account_mgr/module_account_mgr";


// 模块导出
export interface ModuleInclude {
    [Constants.ModuleName.AccountMgr]: ModuleAccountMgr,
}