/**
 * 常量定义
 */
declare namespace Constants {
    
    const enum ResultCode {
        Success = 0,     // 成功
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

    const enum MongoDBKey {
        Human = "Human",
        Bag = "Bag",
    }

    const enum ModuleName {
        Human = "ModuleHuman",
        Bag = "ModuleBag",
    }
}

