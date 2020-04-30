"use strict";
/**
 * 堆数据管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Heap {
    constructor(comparator) {
        this._elements = new Array();
        this._comparator = comparator;
    }
    get top() {
        return this._elements[0];
    }
    get size() {
        return this._elements.length;
    }
    getElement(index) {
        if (index >= this._elements.length) {
            return null;
        }
        return this._elements[index];
    }
    getElementList() {
        return this._elements;
    }
    isEmtry() {
        return !this._elements.length;
    }
    push(e) {
        this._elements.push(e);
        this.shifUp(this._elements.length, e);
    }
    clear() {
        this._elements.length = 0;
    }
    pop() {
        let res = this._elements[0];
        let v = this._elements.pop();
        if (this._elements.length) {
            this.shifDown(0, v);
        }
        return res;
    }
    remove(e) {
        let i = e.pointer;
        if (i >= this._elements.length) {
            return false;
        }
        if (this._elements[i] !== e) {
            return false;
        }
        let v = this._elements.pop();
        if (i < this._elements.length) {
            this.shifDown(i, v);
        }
        return true;
    }
    update(e) {
        let i = e.pointer;
        if (i >= this._elements.length) {
            return;
        }
        if (this._elements[i] !== e) {
            return;
        }
        if (i !== 0) {
            let p = (i - 1) >> 1;
            if (this._comparator(e, this._elements[p])) {
                this.shifUp(i, e);
                return;
            }
        }
        let count = this._elements.length;
        let l = (i << 1) + 1;
        let r = i + 1;
        if (l < count) {
            let v = this._elements[l];
            if (r < count && this._comparator(this._elements[r], v)) {
                v = this._elements[r];
            }
            if (this._comparator(v, e)) {
                this.shifDown(i, e);
            }
        }
    }
    shifUp(i, e) {
        let p = (i - 1) >> 1;
        let v;
        // 调整堆
        while (0 !== i) {
            v = this._elements[p];
            if (!this._comparator(e, v)) {
                break;
            }
            // 置换节点
            v.pointer = i;
            this._elements[i] = v;
            i = p;
            p = (i - 1) >> 1;
        }
        e.pointer = i;
        this._elements[i] = e;
    }
    shifDown(i, e) {
        let l = (i << 1);
        let r = l + 1;
        let count = this._elements.length;
        let v;
        while (l < count) {
            v = this._elements[l];
            if (r < count && this._comparator(this._elements[r], v)) {
                v = this._elements[r];
                l = r;
            }
            if (this._comparator(e, v)) {
                break;
            }
            v.pointer = i;
            this._elements[i] = v;
            i = l;
            l = (i << 1) + 1;
            r = l + 1;
        }
        e.pointer = i;
        this._elements[i] = e;
    }
}
exports.Heap = Heap;
//# sourceMappingURL=heap.js.map