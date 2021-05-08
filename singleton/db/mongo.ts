import { MongoClient, Db, Collection, DeleteWriteOpResultObject, UpdateWriteOpResult, FindAndModifyWriteOpResultObject } from 'mongodb';
import { Encoding} from "../../singleton/io/msgpack";
export class MongoMgr {
    private static _instance: MongoMgr = new MongoMgr();
    public static get instance(): MongoMgr {
        return this._instance;
    }

    private _dbUri: string;
    private _dbName: string;
    private _client: MongoClient;
    private _db: Db;
    private _opts: Object;
    private _cols: Map<string, Collection>;

    public get db(): Db {
        return this._db;
    }

    public get client(): MongoClient {
        return this._client;
    }

    constructor () {
        this._client = null;
        this._db = null;
        this._opts = null;
        this._cols = new Map<string, Collection>();
    }
    
    // 初始化配置
    public init(uri: string, dbName: string, opts: Object = { useUnifiedTopology: true }): void {
        this._opts = opts;
        this._dbUri = uri;
        this._dbName = dbName;
    }

    // 连接
    public async connect(): Promise<void> {
        this._client = new MongoClient(this._dbUri, this._opts);
        return new Promise((resolve: Function, reject: Function) => {
            this._client.connect((err: Error) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        }).then(() => {
            this._db = this._client.db(this._dbName);
        }).catch((err) => {
            console.log(err);
        });
    }

    // 断开连接
    public async disconnect(): Promise<void> {
        if (this._client) {
            // 客户端关闭
            await this._client.close()
            this._client = null
            this._db = null
          }
    }

    /**
     * 获取某个数据
     * @param col 集合名
     * @param key 键值
     * @param field 字段？ （默认value）
     */
    public async hget(col: string, key: number | string, opts: Object = {}): Promise<any> {
        try {
            let collection = this.getCollection(col);
            if (!collection) {
                // 创建集合
                return null;
            }
            let data = await collection.findOne(Object.assign(opts,{key}));
            // return Encoding.instance.decode(data.value);
            return JSON.parse(data.value);
        } catch (error) {
            // LOG
        }
        return null;
    }

    /**
     * 获取某个数据
     * @param col 集合名
     * @param key 键值
     * @param field 字段？ （默认value）
     */
     public async hgets(col: string, key: number | string, opts: Object = {}): Promise<any> {
        try {
            let collection = this.getCollection(col);
            if (!collection) {
                // 创建集合
                return null;
            }
            return collection.find(Object.assign(opts,{key}))
        } catch (error) {
            
        }
    }

    /**
     * 
     * @param key 
     * @param value 
     * @param col 
     * @param field 
     */
    public async hset(col: string, key: number | string, value: any,  field: string = "value"): Promise<DeleteWriteOpResultObject | UpdateWriteOpResult | FindAndModifyWriteOpResultObject<any>> {
        try {
            let collection = this.getCollection(col);
            if (!collection) {
                // 创建集合
                collection = this.createCollection(col);
            }
            // collection.in
            let exist = await this.exist(col, key);
            // let data = Encoding.instance.encode(value);
            let data = JSON.stringify(value);
            if (!exist) {
                // 插入
                return await collection.insertOne({key, [field]: data})
            } else {
                // 修改
                return await collection.findOneAndUpdate({key}, {$set: {[field]: data}});
            }
        } catch (error) {
            // LOG
            console.log(`hset error`, error);
        }
        return null;
        
    }

    /**
     * 删除一个
     * @param col 
     * @param key 
     * @returns 
     */
    public async hdel(col: string, key: number | string): Promise<DeleteWriteOpResultObject> {
        try {
            let collection = this.getCollection(col);
            if (!collection) {
                return null;
            }
            return await collection.deleteOne({key});
        } catch (error) {
            // LOG
        }
        return null;
        
    }

    /**
     * 集体删除
     * @param col 
     * @param key 
     * @returns 
     */
    public async hdels(col: string, key: number | string): Promise<DeleteWriteOpResultObject> {
        try {
            let collection = this.getCollection(col);
            if (!collection) {
                return null;
            }
            return await collection.deleteMany({key});
        } catch (error) {
            // LOG
        }
        return null
        
    }

    // to change
    private async exist(col: string, key: number | string): Promise<any> {
        let collection = this.getCollection(col);
        if (!collection) {
            return null;
        }
        return await collection.findOne({key: key})
    }

    private getCollection(col: string): Collection {
        if (!this._db) {
            return null;
        }
        if (!this._cols.has(col)) {
            let collection = this._db.collection(col);
            if (!collection) {
                return null;
            }
            this._cols.set(col, collection)
        }
        return this._cols.get(col);
    }

    private createCollection(col: string, indexs: Object = {key: 1}): Collection {
        if (!this._db) {
            return null;
        }
        this._db.createCollection(col);
        let collection = this._db.collection(col);
        collection.createIndex(indexs);
        return collection;
    }
}
