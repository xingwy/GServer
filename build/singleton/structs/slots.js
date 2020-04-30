"use strict";
/**
 * 端口卡槽
 */
Object.defineProperty(exports, "__esModule", { value: true });
// 迭代器
class KeyIterableIterator {
    constructor(slots) {
        this._slots = slots;
        this._cursor = 0;
    }
    [Symbol.iterator]() {
        return this;
    }
    next(value) {
        const length = this._slots.length;
        while (this._cursor < length) {
            let slot = this._slots[this._cursor++];
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
class ValueIterableIterator {
    constructor(slots) {
        this._slots = slots;
        this._cursor = 0;
    }
    [Symbol.iterator]() {
        return this;
    }
    next(value) {
        const length = this._slots.length;
        while (this._cursor < length) {
            let slot = this._slots[this._cursor++];
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
class Slots {
    constructor(initialSize = 256) {
        this._slots = new Array(initialSize);
        this._count = 0;
        this._freeSlot = null;
    }
    get count() {
        return this._count;
    }
    [Symbol.iterator]() {
        return new ValueIterableIterator(this._slots);
    }
    keys() {
        return new KeyIterableIterator(this._slots);
    }
    values() {
        return new ValueIterableIterator(this._slots);
    }
    get(handle) {
        let slot = this.findEntry(handle);
        if (!slot) {
            return null;
        }
        return slot.res;
    }
    has(handle) {
        let slot = this.findEntry(handle);
        return !!slot;
    }
    /**
     * 分配
     * @param res
     */
    alloc(res) {
        if (!res) {
            return 0;
        }
        // 扩容 上限 1<<16
        if (this._count === this._slots.length) {
            if (this._count * 2 > 65536 /* MaxIndexCount */) {
                throw Error("Slots overflow!");
            }
            this._slots.length = this._count * 2;
        }
        let slot;
        if (this._freeSlot) {
            ++this._count;
            slot = this._freeSlot;
            let next = slot.next;
            this._freeSlot = next !== -1 ? this._slots[next] : null;
        }
        else {
            slot = Object.create(null);
            slot.handle = 65536 /* BasicMagic */ + this._count;
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
    free(handle) {
        let slot = this.findEntry(handle);
        if (!slot) {
            return null;
        }
        let res = slot.res;
        let magic = (slot.handle / 65536 /* MaxIndexCount */) | 0;
        magic = (magic === 65535 /* MaxMagicValue */) ? 1 : magic + 1;
        slot.handle = (magic * 65536 /* MaxIndexCount */) + (slot.handle & 65535 /* IndexMask */);
        slot.res = null;
        this._freeSlot = slot;
        --this._count;
        return res;
    }
    // 返回入口情况
    findEntry(handle) {
        let index = handle & 65535 /* IndexMask */;
        if (index >= this._slots.length) {
            return null;
        }
        let slot = this._slots[index];
        if (!slot || !slot.res || slot.handle !== handle) {
            return null;
        }
        return slot;
    }
}
exports.Slots = Slots;
//# sourceMappingURL=slots.js.map