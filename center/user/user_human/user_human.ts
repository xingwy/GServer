/** 社交模块 **/

import { Agent } from "../../base/agent";
import { UserBase } from "../user_base";


export class UserHuman extends UserBase {
    private _name: string;
    private _level: number;
    private _sex: Constants.SexType;
    constructor (agent: Agent, dbKey: string) {
        super(agent, dbKey);
        this._name = "";
        this._level = 1;
        this._sex = Constants.SexType.Man;
    }

    public load(): void {
    }

    public ontimer(ts: number): void {
    }

    public fromDB<T extends keyof Constants.DBFieldsType>(record: Constants.DBFieldsType[T]): void {
        if (!record) {
            return;
        }
        let data = <Constants.UserSocial>record;
        this._name = data[Constants.UserSocialFields.name];
        this._level = data[Constants.UserSocialFields.level];
        this._sex = data[Constants.UserSocialFields.sex];
    }

    public toDB<T extends keyof Constants.DBFieldsType>(): Constants.DBFieldsType[T] {
        let data: Constants.UserSocial = [this._name, this._level, this._sex];
        return data as any;
    }

    public setName(name: string): void {
        this._name = name;
    }

    public setSex(sex: Constants.SexType): void {
        this._sex = sex;
    }
}

