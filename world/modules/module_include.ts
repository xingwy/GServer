import { WorldUserMgr } from "./user/world_user_mgr";
import { WorldChatMgr } from "./chat/world_chat_mgr";

// 模块导出
export interface ModuleInclude {
    [Constants.ModuleName.WorldUserMgr]: WorldUserMgr,
    [Constants.ModuleName.WorldChatMgr]: WorldChatMgr,
}