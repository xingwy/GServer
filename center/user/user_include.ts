import { UserBag } from "./user_bag/user_bag";
import { UserHuman } from "./user_human/user_human";


// 模块导出
export interface UserInclude {
    [Constants.ModuleName.Bag]: UserBag,
    [Constants.ModuleName.Human]: UserHuman,
}