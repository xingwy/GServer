import { IAgent } from "../../singleton/core/IAgent";



/**
 * 网关代理人
 */

export class Agent extends IAgent {

    public async fromDB<T>(v: T): Promise<void> {
        return;
    }
    public async toDB<T>(): Promise<T> {
        return null;
    }
} 