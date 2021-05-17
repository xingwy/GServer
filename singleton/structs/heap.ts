/**
 * 堆数据管理
 */

// 定义比较方式
type Comparetor<T extends IHeapElement> = (l: T, r: T) => boolean;

export class Heap<T extends IHeapElement> {
    private readonly _elements: Array<T>;
    private readonly _comparator: Comparetor<T>;

    constructor(comparator: Comparetor<T>) {
        this._elements = new Array<T>();
        this._comparator = comparator;
    }

    public get top(): T {
        return this._elements[0];
    }

    public get size(): number {
        return this._elements.length;    
    }

    public getElement(index: Uint32): T {
        if (index >= this._elements.length) {
            return null;
        }
        return this._elements[index];
    }

    public getElementList(): Array<T> {
        return this._elements;
    }

    public isEmtry(): boolean {
        return !this._elements.length;
    }

    public push(e: T): void {
        this._elements.push(e);
        this.shifUp(this._elements.length, e);
    }

    public clear(): void {
        this._elements.length = 0;
    }

    public pop(): T {
        let res: T = this._elements[0];
        let v: T = this._elements.pop();
        if ( this._elements.length) {
            this.shifDown(0, v);
        }
        return res;
    }

    public remove(e: T): boolean {
        let i: Uint32 = e.pointer;
        if (i >= this._elements.length) {
            return false;
        }

        if (this._elements[i] !== e) {
            return false;
        }

        let v: T = this._elements.pop();
        if (i < this._elements.length) {
            this.shifDown(i, v);
        }
        return true;
    }

    public update(e: T): void {
        let i: Uint32 = e.pointer;
        if (i >= this._elements.length) {
            return;
        }
        if (this._elements[i] !== e) {
            return;
        }

        if (i !== 0) {
            let p: Uint32 = (i - 1) >> 1;
            if (this._comparator(e, this._elements[p])) {
                this.shifUp(i, e);
                return;
            }
        }

        let count: Uint32 = this._elements.length;
        let l: Uint32 = (i << 1) + 1;
        let r: Uint32 = i + 1;
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
    private shifUp(i: Uint32, e: T): void {
        let p: Uint32 = (i - 1) >> 1;
        let v: T;
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

    private shifDown(i: Uint32, e: T): void {
        let l: Uint32 = (i << 1);
        let r: Uint32 = l + 1;
        let count = this._elements.length;
        let v: T;

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