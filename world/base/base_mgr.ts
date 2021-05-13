
export class BaseMgr {
    constructor() {

    }

    public fromDB(record: any): void {
        // 数据库加载 (db => 内存/redis) 暂使用本地内存
    }

    public toDB(): any {
        // 数据库落地
    }
}