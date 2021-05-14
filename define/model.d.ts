/**
 * 数据库字段段映射模型文件
 */

declare namespace DBModels {

    // 账号模型
    const enum AccountFields {
        account = 0,  // 账号
        password = 1,  // 密码
        uid = 2,  // 用户唯一ID
    }
    type Account = [string, string, number];

    // 账号模型集合
    const enum AccountsFields {
        list = 0,  // 用户唯一ID
    }
    type Accounts = [Array<Account>];

    // 玩家人物模型
    const enum UserSocialFields {
        name = 0,  // 姓名
        level = 1,  // 等级
        sex = 2,  // 性别
    }
    type UserSocial = [string, number, number];

    // 玩家人物模型
    const enum HumanFields {
    }
    type Human = [];

    // 背包模型
    const enum BagFields {
    }
    type Bag = [];

    // 世界服聊天
    const enum WorldChatMgrFields {
    }
    type WorldChatMgr = [];

    // 世界服用户
    const enum WorldUserMgrFields {
    }
    type WorldUserMgr = [];

    const enum MongoDBKey {
        AccountMgr = "AccountMgr",
        UserSocial = "UserSocial",
        Human = "Human",
        Bag = "Bag",
        WorldChatMgr = "WorldChatMgr",
        WorldUserMgr = "WorldUserMgr",
    }

    interface DBFieldsType {
        [MongoDBKey.AccountMgr]: Accounts;
        [MongoDBKey.UserSocial]: UserSocial;
        [MongoDBKey.Human]: Human;
        [MongoDBKey.Bag]: Bag;
        [MongoDBKey.WorldChatMgr]: WorldChatMgr;
        [MongoDBKey.WorldUserMgr]: WorldUserMgr;
    }
}