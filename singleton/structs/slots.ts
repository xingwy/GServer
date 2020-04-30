/**
 * 端口卡槽
 */


const enum SlotConstant {
    IndexBits = 16,
    MaxIndexCount = 1 << IndexBits,
    IndexMask = MaxIndexCount - 1,

    BasicMagic = 1 << IndexBits,
    MagicMask = (1 << 32 - IndexBits) - 1,
    MaxMagicValue = MagicMask,
} 



// 迭代器
class KeyIterableIterator<T extends object> implements IterableIterator<Uint16> {
    private _slots: Array<IEntry<T>>;
    private _cursor: number;
    constructor(slots: Array<IEntry<T>>) {
        this._slots = slots;
        this._cursor = 0;
    }
    public [Symbol.iterator](): IterableIterator<Uint16> {
        return this;
    }

    public next(value?: any): IteratorResult<Uint16> {
        const length = this._slots.length;
        while (this._cursor < length) {
            let slot: IEntry<T> = this._slots[this._cursor++];
            if (!slot || !slot.res) {
                continue;
            }
            return {
                done: false,
                value: slot.handle,
            };
        }
        return {
            done: true,
            value: null,
        };
    } 
}

class ValueIterableIterator<T extends object> implements IterableIterator<T> {
    private _slots: Array<IEntry<T>>;
    private _cursor: number;
    constructor(slots: Array<IEntry<T>>) {
        this._slots = slots;
        this._cursor = 0;
    }
    public [Symbol.iterator](): IterableIterator<T> {
        return this;
    }

    public next(value?: any): IteratorResult<T> {
        const length = this._slots.length;
        while (this._cursor < length) {
            let slot: IEntry<T> = this._slots[this._cursor++];
            if (!slot || !slot.res) {
                continue;
            }
            return {
                done: false,
                value: slot.res,
            };
        }
        return {
            done: true,
            value: null,
        };
    } 
}

export class Slots<T extends object> {
    private _slots: Array<IEntry<T>>;
    private _freeSlot: IEntry<T>;
    private _count: Uint16;

    constructor(initialSize: number = 256) {
        this._slots = new Array<IEntry<T>>(initialSize);
        this._count = 0;
        this._freeSlot = null;
    }

    public get count(): Uint16 {
        return this._count;
    }

    public [Symbol.iterator](): IterableIterator<T> {
        return new ValueIterableIterator(this._slots);
    }

    public keys(): IterableIterator<Uint16> {
        return new KeyIterableIterator(this._slots);    
    }

    public values(): IterableIterator<T> {
        return new ValueIterableIterator(this._slots);    
    }

    public get(handle: Uint16): T {
        let slot: IEntry<T> = this.findEntry(handle);
        if (!slot) {
            return null;
        }
        return slot.res;
    }
    public has(handle: Uint16): boolean {
        let slot: IEntry<T> = this.findEntry(handle);
        return !!slot;
    }

    /**
     * 分配
     * @param res 
     */
    public alloc(res: T): Uint16 {
        if (!res) {
            return 0;
        }

        // 扩容 上限 1<<16
        if (this._count === this._slots.length) {
            if (this._count * 2 > SlotConstant.MaxIndexCount) {
                throw Error("Slots overflow!");
            }
            this._slots.length = this._count * 2;
        }

        let slot: IEntry<T>;
        if (this._freeSlot) {
            ++this._count;
            slot = this._freeSlot;
            let next: Uint16 = slot.next;
            this._freeSlot = next !== -1 ? this._slots[next] : null;
        } else {
            slot = Object.create(null);
            slot.handle = SlotConstant.BasicMagic + this._count;
            this._slots[this._count++] = slot;
        }
        slot.next = -1;
        slot.res = res;
        return slot.handle;
    }

    /**
     * 释放并返回
     * @param handle 
     */
    public free(handle: Uint16): T {
        let slot: IEntry<T> = this.findEntry(handle);
        if (!slot) {
            return null;
        }

        let res: T = slot.res;
        let magic: Uint16 = (slot.handle / SlotConstant.MaxIndexCount) | 0;
        magic = (magic === SlotConstant.MaxMagicValue) ? 1 : magic + 1;
        slot.handle = (magic * SlotConstant.MaxIndexCount) + (slot.handle & SlotConstant.IndexMask);
        slot.res = null;
        this._freeSlot = slot;
        --this._count;
        return res;
    }

    // 返回入口情况
    public findEntry(handle: Uint16): IEntry<T> {
        let index: Uint16 = handle & SlotConstant.IndexMask;
        if (index >= this._slots.length) {
            return null;
        }
        let slot: IEntry<T> = this._slots[index];
        if (!slot || !slot.res || slot.handle !== handle) {
            return null;
        }
        return slot;
    }

}