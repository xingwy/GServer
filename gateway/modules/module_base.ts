export class MgrBase {
    constructor() {

    }

    public load(): void {
        // 加载模块执行
    }
    
    public close(): void {
        // 退出前执行
    }
    
    public ontimer(ts: number): void {
        // 定时器
    }

    public fromDB(record: any): void {
        // 数据库加载 (db => 内存/redis) 暂使用本地内存
    }

    public toDB(): any {
        // 数据库落地
    }

}