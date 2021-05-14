class Record {
    public content: string;
    public channel: Constants.ChannelType;
    public sender: number;
    public receiver: number;  // 接收者ID （如果是队伍 则是队伍ID  如果是工会 则是工会ID）

    public loadFromDB(record: DBModels.ChatRecord): void {
        this.sender = record[DBModels.ChatRecordFields.sender];
        this.channel = record[DBModels.ChatRecordFields.channel];
        this.content = record[DBModels.ChatRecordFields.content];
        this.receiver = record[DBModels.ChatRecordFields.receiver];
    }
    
    public buildForDB(): DBModels.ChatRecord {
        return [this.sender, this.channel, this.content, this.receiver];
    }
}

export class ChatRecord {
    public channel: Constants.ChannelType;
    public records: Map<number, Array<Record>>;

    constructor(channel: Constants.ChannelType) {
        this.channel = channel;
        this.records = new Map<number, Array<Record>>();
    }

    public loadFromDB(record: DBModels.ChatRecords): void {
        if (!record) {
            return;
        }

        this.channel = record[DBModels.ChatRecordsFields.channel];
        let chatRecords = record[DBModels.ChatRecordsFields.records];
        for (let record of chatRecords) {
            let receiver = record[DBModels.ChatRecordFields.receiver]
            if (!this.records.has(receiver)) {
                this.records.set(receiver, new Array<Record>());
            }
            let r = new Record();
            r.loadFromDB(record);
            this.records.get(receiver).push(r);
        }
    }
    
    public buildForDB(): DBModels.ChatRecords {
        let data: DBModels.ChatRecords = [this.channel, new Array<DBModels.ChatRecord>()];
        for (let [_, record] of this.records) {
            for (let v of record) {
                data[DBModels.ChatRecordsFields.records].push(v.buildForDB()); 
            }
        }
        return data;
    }

    public pushRecord(sender: number, content: string, receiver: number, time: number): void {

    }
}