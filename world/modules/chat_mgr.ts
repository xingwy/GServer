
export class ChatMgr {
    private static _instance: ChatMgr = new ChatMgr();

    public static get instance(): ChatMgr {
        return this._instance
    }
    constructor() {
    }

    public handleChat(sender: number, channel: Constants.ChannelType, uids: Array<number>): void {

    }
}