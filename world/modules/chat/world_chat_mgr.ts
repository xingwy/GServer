import { ChatRecord } from "./chat_record";
import { BaseMgr } from "../../base/base_mgr";
export class WorldChatMgr extends BaseMgr {
    
    private _chatRecord: Map<Constants.ChannelType, ChatRecord>;
    constructor(modName: Constants.ModuleName, dbKey: DBModels.MongoDBKey) {
        super(modName, dbKey);
        this._chatRecord = new Map<Constants.ChannelType, ChatRecord>();
    }

    public handleChat(sender: number, channel: Constants.ChannelType, content: string, receiver: number): Constants.ResultCode {
        let chatRecord;
        let now = Date.now();
        // 存入记录
        switch (channel) {
            case Constants.ChannelType.broadcast:
                chatRecord = this._chatRecord.get(channel);
                break;
            case Constants.ChannelType.union:
                chatRecord = this._chatRecord.get(channel);
                break;
            case Constants.ChannelType.team:
                chatRecord = this._chatRecord.get(channel);
                break;
            default:
                return Constants.ResultCode.ChannelTypeError
        }

        if (!chatRecord) {
            chatRecord = new ChatRecord(channel);
            this._chatRecord.set(channel, chatRecord);
        }

        // chatRecord
        chatRecord.pushRecord(sender, content, receiver, now);
        // 分发聊天内容 TODO
        return Constants.ResultCode.Success;
    }

    public fromDB<T extends keyof DBModels.DBFieldsType>(record: DBModels.DBFieldsType[T]): void {
        if (!record) {
            return;
        }

        let data = <DBModels.WorldChatMgr>record;
        let chatRecords = data[DBModels.WorldChatMgrFields.chatRecords];
        for (let v of chatRecords) {
            let channel = v[DBModels.ChatRecordsFields.channel];
            if (!this._chatRecord.has(channel)) {
                let chatRecord = new ChatRecord(channel);
                chatRecord.loadFromDB(v);
                this._chatRecord.set(channel, chatRecord);
            }
        }
    }

    public toDB<T extends keyof DBModels.DBFieldsType>(): DBModels.DBFieldsType[T] {
        let data: DBModels.WorldChatMgr = [new Array<DBModels.ChatRecords>()];
        for (let [_, chatRecord] of this._chatRecord) {
            data[DBModels.WorldChatMgrFields.chatRecords].push(chatRecord.buildForDB());
        }
        return <DBModels.DBFieldsType[T]>data;
    }

}