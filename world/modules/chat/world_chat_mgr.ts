import { ChatRecord } from "./record";
import { BaseMgr } from "../../base/base_mgr";
export class WorldChatMgr extends BaseMgr {
    
    private chatRecord: Map<Constants.ChannelType, ChatRecord>;
    constructor(modName: Constants.ModuleName, dbKey: DBModels.MongoDBKey) {
        super(modName, dbKey);
    }

    public handleChat(sender: number, channel: Constants.ChannelType, uids: Array<number>): void {

    }

}