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

    public fromDB<T extends keyof Constants.DBFieldsType>(record: Constants.DBFieldsType[T]): void {
        if (!record) {
            return;
        }
    }

    public toDB<T extends keyof Constants.DBFieldsType>(): Constants.DBFieldsType[T] {
        return null;
    }
}