/** 背包模块 **/

import { Agent } from "../../base/agent";
import { UserBase } from "../user_base";


export class UserBag extends UserBase {
    constructor (agent: Agent, dbKey: string) {
        super(agent, dbKey);
    }

    public load(): void {
    }

    public ontimer(ts: number): void {

    }

    public fromDB<T extends keyof DBModels.DBFieldsType>(record: DBModels.DBFieldsType[T]): void {
        if (!record) {
            return;
        }
    }

    public toDB<T extends keyof DBModels.DBFieldsType>(): DBModels.DBFieldsType[T] {
        return null;
    }
}