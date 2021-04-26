

interface IHeapElement {
    value: number;
    pointer: number;
}

interface IEntry<T extends object> {
    res: T;
    handle: Uint16;
    next: Uint16;
}

interface IAddressInfo {
    host: string;
    port: number;
}

declare type SessionId = number;
declare type UserId = number;
declare type ProtocolCode = number;
declare type ServiceType = number;
declare type Uint8 = number;
declare type Uint16 = number;
declare type Uint32 = number;
declare type Uint64 = number;