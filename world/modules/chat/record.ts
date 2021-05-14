class Record {

}

export class ChatRecord {
    public channel: Constants.ChannelType;
    public contents: Array<Record>;

    constructor(channel: Constants.ChannelType) {
        this.channel = channel;
        this.contents = new Array<Record>();
    }

    public fromDB(): void {

    }
    
    public toDB(): void {
        
    }

    public pushRecord(sender: number, content: string, uids: Array<number>, time: number): void {

    }
}