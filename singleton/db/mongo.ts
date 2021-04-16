import { MongoClient } from 'mongodb';

export class MongoMgr {
    private static _instance: MongoMgr = new MongoMgr();
    public static get instance(): MongoMgr {
        return this._instance;
    }

    private _uri: string;
    private _client: MongoClient;

    constructor () {
        // this._client = await mongodb.MongoClient.connect(this._url, _.assign({ useNewUrlParser: true, useUnifiedTopology: true }, _.omit(this._opts, 'dbName')))
        this._client = null;
    }
    
    // 初始化配置
    async init(uri: string, useNewUrlParser: boolean = true): Promise<void> {
        this._uri = uri;
        this._client = new MongoClient(this._uri, { useNewUrlParser });
        await this.connect();
    }

    // 连接
    public connect(): Promise<void> {
        return new Promise((resolve: Function, reject: Function) => {
            this._client.connect((err: Error) => {
                if (err) {
                    reject(err);
                }
                const collection = this._client.db("test").collection("devices");
                // perform actions on the collection object
                this._client.close();
                resolve();
            });
        })
        
    }

    // 断开连接
    public async disconnect(): Promise<void> {
        
    }

    async hget(): Promise<any> {

    }

    async hset(): Promise<boolean> {
        return true;
    }
}
