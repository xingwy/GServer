import { ChatRecord } from "./record";
import { BaseMgr } from "../../base/base_mgr";
export class WorldChatMgr extends BaseMgr {
    
    private _chatRecord: Map<Constants.ChannelType, ChatRecord>;
    constructor(modName: Constants.ModuleName, dbKey: DBModels.MongoDBKey) {
        super(modName, dbKey);
    }

    public handleChat(sender: number, channel: Constants.ChannelType, content: string, uids: Array<number>): Constants.ResultCode {
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
        chatRecord.pushRecord(sender, content, uids, now);
        // 分发聊天内容 TODO
        return Constants.ResultCode.Success;
    }

}