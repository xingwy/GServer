/**
 * 队列数据管理
 */
class Node<T> {
    public parent: Node<T>;
    public next: Node<T>;
    public v: T;
    constructor(v: T) {
        this.v = v;
    }
}

export class Quene<T> {
    private _head: Node<T>;
    private _tail: Node<T>;
    private _size: number;
    constructor() {
        this._head = null;
        this._tail = null;
        this._size = 0;
    }

    public push(v: T): number {
        let node = new Node(v);
        if (this._size == 0) {
            this._head = node;
            this._tail = node;
        } else {
            node.parent = this._tail;
            this._tail.next = node;
            this._tail = node;
        }
        this._size++;
        return this._size;
    }

    public pop(): T {
        if (this._size == 0) {
            return null;
        }
        let v = this._head.v;
        this._head = this._head.next;
        return v;
    }

    public clear(): void {
        this._head = null;
        this._tail = null;
        this._size = 0;
    }
}