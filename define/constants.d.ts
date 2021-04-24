/**
 * 常量定义
 */
 declare namespace Constants {
    
    const enum ResultCode {
        Success = 0,     // 成功
    }

    const enum SexType {
        Man = 1,
        Woman = 2,
    }
    

    // account password name sex 
    type Data1 = [string, string, string, number];
    type Data2 = [string, string];

    type CenterLoginInfo = [];

    /*************************** Tuple start ***************************/
    interface DataTuple {
        [DataTupleType.Data1]: Data1,
        [DataTupleType.Data2]: Data2,
    }
    /*************************** Tuple end ***************************/

    const enum DataTupleType {
        Data1 = 0x000001,
        Data2 = 0x000002,
    }

    const enum ModuleName {
        Human = "ModuleHuman",
        Bag = "ModuleBag",
    }

    const enum ConnectType {
        Tcp = 1,
        Http = 2,
    }

    const enum AcceptState {
        connecting,
        connected,
        closed,
    }
    const enum AcceptType {
        server = 1,
        client = 2,
    } 


    /*************************** DB fields start ***************************/

    // gateway
    const enum AccountFields {
        account = 0, // 账号
        uid = 1, // 用户唯一ID
    }
    type Account = [string, number];

    const enum AccountsFields {
        list = 0, // 列表
    }
    type Accounts = [Array<Account>];

    const enum ModuleMgrName {
        AccountMgr = "AccountMgr",
    }

    // center
    const enum UserSocialFields {
        name = 0, // 名称
        level = 1, // 等级
        sex = 2, // 性别
    }
    type UserSocial = [string, number, number];

    const enum MongoDBKey {
        AccountMgr = "AccountMgr",
        Human = "HumanMgr",
        Bag = "Bag",

        UserSocial = "UserSocial"
    }


    // 注册DB值类型
    interface DBFieldsType {
        [MongoDBKey.AccountMgr]: Accounts,
        [MongoDBKey.UserSocial]: UserSocial,
    }

    /***************************  DB fields end  ***************************/


    /*************************** Event start ***************************/
    const enum EventID {
        Login = 1,
    }

    /***************************  Event end  ***************************/


}

