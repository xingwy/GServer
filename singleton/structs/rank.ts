enum Color {
    Black,
    Red,
}

export class RBTreeNode {
    public parent: RBTreeNode;
    public left: RBTreeNode;
    public right: RBTreeNode;
    public color: Color;
    public key: string;
    public score: number;
    public index: number;

    constructor(k: string, s: number, p: RBTreeNode, l: RBTreeNode = null, r: RBTreeNode = null) {
        this.color = Color.Red;
        this.parent = p;
        this.key = k;
        this.score = s;
        this.left = l;
        this.right = r;
        this.index = 1;
    }

    public setBlack(): void {
        this.color = Color.Black;
    }

    public setRed(): void {
        this.color = Color.Red;
    }

    public recolor(): void {
        this.color == Color.Red ? (this.color = Color.Black) : (this.color = Color.Red);
    }

    public setColor(color: Color): void {
        this.color = color;
    }

    public isRed(): boolean {
        return this.color == Color.Red;
    }

    public isBlack(): boolean {
        return this.color == Color.Black;
    }

    public isRoot(): boolean {
        return this.parent == null;
    }

    public isLeftChild(): boolean {
        if (this.parent == null) {
            return false;
        }
        return this.parent.left == this;
    }

    public isRightChild(): boolean {
        if (this.parent == null) {
            return false;
        }
        return this.parent.right == this;
    }

    public isLeaf(): boolean {
        return this.left == null && this.right == null;
    }

    public getBrother(): RBTreeNode {
        if (!this.parent) {
            return null;
        }

        if (this.parent.left == this) {
            return this.parent.right;
        }
        if (this.parent.right == this) {
            return this.parent.left;
        }
        return null;
    }

    public hasChild(): boolean {
        return !!(this.left || this.right);
    }

}

export class Rank {
    private _root: RBTreeNode;
    private _hash: Map<string, RBTreeNode>;
    constructor() {
        this._root = null;
        this._hash = new Map<string, RBTreeNode>();
    }

   /**
    * 设置k-v
    * @param key 
    * @param score 
    */
    public tset(key: string, score: number): void {
        let node = new RBTreeNode(key, score, null);
        node.setRed();
        if (!this._root) {
            node.setBlack();
            this._root = node;
            this._hash.set(key, node);
        } else {
            if (!this._hash.has(key)) {
                this._onInsert(node, this._root);
            } else {
                // update
            }
        }
    }

    /**
     * 获取排名
     * @param key 
     * @returns 
     */
     public trank(key: string): number {
        let node = this._hash.get(key);
        if (!node) {
            return -1;
        }
        return this._onGetIndex(this._root, node, 0);
    }

    /**
     * 获取元素
     * @param key 
     * @returns 
     */
    public tget(key: string): RBTreeNode  {
        return this._hash.get(key);
    }

    /**
     * 寻找位置点
     * @param e 
     * @param parent 
     */
    private _onInsert(e: RBTreeNode, parent: RBTreeNode): void {
        if (this._compare(e, parent)) {
            parent.index++;
            if (!parent.left) {
                parent.left = e;
                e.parent = parent;
                this._hash.set(e.key, e);
                this._onTuneUp(e);
            } else {
                
                parent = parent.left;
                this._onInsert(e, parent);
            }
        } else {
            if (!parent.right) {
                parent.right = e;
                e.parent = parent;
                this._hash.set(e.key, e);
                this._onTuneUp(e);
            } else {
                parent = parent.right;
                this._onInsert(e, parent);
            }
        }
    }

    /**
     * 移除
     * @param node 
     * @returns 
     */
    public _onRemove(node: RBTreeNode): boolean {
        let parent = node.parent;
        if (node.isLeaf()) {
            if (node.isRed()) {
                // 红叶子节点 直接删除
                if (node.isLeftChild()) {
                    parent.left = null;
                } else {
                    parent.right = null;
                }
            } else {
                // 先修复 在删除
                this._onRepair(node);
                if (node.isLeftChild()) {
                    node.parent.left = null;
                } else {
                    node.parent.right = null;
                }
            }
        } else {
            // 非叶子置换
            if (node.left && !node.right) {
                // 和左节点置换
                this._swapNode(node, node.left);
            } else if (!node.left && node.right) {
                // 和右节点置换
                this._swapNode(node, node.right);
            } else {
                // 双节点 寻找后继节点
                let _swapNode = this._successor(node);
                this._swapNode(node, _swapNode);
            }
            this._onRemove(node);
        }
        return true;
    }

    /**
     * 修复
     * @param node 
     */
    private _onRepair(node: RBTreeNode): void {
        if (node.isRoot() || node.isRed()) {
            return;
        }
        let parent = node.parent;
        let brother = node.getBrother();
        if (brother.isBlack()) {
            // 兄弟节点为黑色
            if (node.isLeftChild()) {
                // 左节点
                if (brother.right && !brother.left) {
                    // 只有右节点
                    // 左旋转父节点
                    this._rotateLeft(parent);
                    brother.setColor(parent.color);
                    brother.right.setBlack();
                    parent.setBlack();
                } else if (!brother.right && brother.left) {
                    brother.left.setBlack();
                    brother.setRed();
                    this._rotateRight(brother);
                    this._onRepair(node);
                } else if (brother.left && brother.right) {
                    brother.setColor(parent.color);
                    brother.right.setBlack();
                    parent.setBlack();
                    this._rotateLeft(parent);
                } else if (!brother.left && !brother.right) {
                    brother.setRed();
                    this._onRepair(parent);
                }
            } else { 
                // 右节点
                if (brother.left && !brother.right) {
                    brother.setColor(parent.color);
                    brother.left.setBlack();
                    parent.setBlack();
                    this._rotateRight(parent);
                } else if (!brother.left && brother.right) {
                    brother.right.setBlack();
                    brother.setRed();
                    this._rotateLeft(brother);
                    this._onRepair(node);
                } else if (brother.left && brother.right) {
                    brother.setColor(parent.color);
                    brother.left.setBlack();
                    parent.setBlack();
                    this._rotateRight(parent);
                } else if (!brother.left && !brother.right) {
                    brother.setRed();
                    this._onRepair(parent);
                }
            }
        } else {
            // 兄弟节点为红色
            if (node.isLeftChild()) {
                brother.setBlack();
                brother.left.setRed();
                this._rotateLeft(parent);
            } else {
                brother.setBlack();
                brother.right.setRed();
                this._rotateRight(parent);
            }
        }
    }
    /**
     * 调整树 使之保持平衡
     * @param node 节点 
     */
    private _onTuneUp(node: RBTreeNode): void {
        let parent = node.parent;
        if (!parent) {
            // 根节点
            node.setBlack();
            return;
        }
        if (parent.isRed()) {
            let grandparent = parent.parent;
            let uncle = parent.getBrother();
            if (uncle && uncle.isRed()) {
                uncle.setBlack();
                parent.setBlack();
                grandparent.setRed();
                this._onTuneUp(grandparent);
            } else if (!uncle || uncle.isBlack()) {
                let tmp = grandparent.parent;
                let isLeft = grandparent.isLeftChild();
                if (parent.isLeftChild() && node.isLeftChild()) {
                    // 左左
                    grandparent.parent = parent;
                    grandparent.left = parent.right;
                    grandparent.index = (parent.right ? parent.right.index : 0) + 1;
                    if (parent.right) {
                        parent.right.parent = grandparent;
                    }
                    grandparent.setRed();
                    parent.right = grandparent;
                    parent.setBlack();
                    if (!tmp) {
                        this._root = parent;
                        parent.parent = null;
                    } else {
                        if (isLeft) {
                            tmp.left = parent;
                        } else{
                            tmp.right = parent;
                        }
                        parent.parent = tmp;
                    }
                } else if (parent.isLeftChild() && node.isRightChild()) {
                    // 左右
                    grandparent.left = node;
                    node.parent = grandparent;
                    parent.right = node.left;
                    if (node.left) {
                        node.left.parent = parent;
                    }
                    parent.parent = node;
                    node.left = parent;
                    node.index += parent.index;
                    this._onTuneUp(parent);                    
                } else if (parent.isRightChild() && node.isRightChild()) {
                    // 右右
                    grandparent.parent = parent;
                    grandparent.right = parent.left;
                    if (parent.left) {
                        parent.left.parent = grandparent;
                    }
                    grandparent.setRed();
                    parent.index += grandparent.index;
                    parent.left = grandparent;
                    parent.setBlack();
                    if (!tmp) {
                        parent.parent = null;
                        this._root = parent;
                    } else {
                        if (isLeft) {
                            tmp.left = parent;
                        } else{
                            tmp.right = parent;
                        }
                        parent.parent = tmp;
                    }
                } else if (parent.isRightChild() && node.isLeftChild()) {
                    // 右左
                    grandparent.right = node;
                    node.parent = grandparent;
                    parent.left = node.right;
                    if (node.right) {
                        node.right.parent = parent;
                    }
                    parent.parent = node;
                    parent.index -= node.index;
                    node.right = parent;
                    this._onTuneUp(parent);  
                }
            }
        }
    }

    /**
     * 寻找后继节点
     * @param node 
     */
    private _successor(node: RBTreeNode): RBTreeNode {
        if (node == null){
        	return null;
        }
        if (null != node.right) { // 获取 后继节点
        	let p = node.right;
            while (null != p.left){
            	p = p.left;
            }
            return p;
        } else {
        	let p = node.parent;
        	let ch = node;
            while (p != null && ch == p.right) {
                ch = p;
                p = p.parent;
            }
            return p;
        }
    }
    /**
     * 左旋转
     * @param node 
     */
    private _rotateLeft(node: RBTreeNode): void {
        let isLeft = node.isLeftChild();
        let parent = node.parent;
        let right = node.right;

        node.right = right.left;
        if (right.left) {
            right.left.parent = node;
        }
        right.parent = parent;
        if (parent) {
            if (isLeft) {
                parent.left = right;
            } else {
                parent.right = right;
            }
        } else {
            this._root = right;
        }
    }

    /**
     * 左旋转
     * @param node 
     */
    private _rotateRight(node: RBTreeNode): void {
        let isLeft = node.isLeftChild();
        let parent = node.parent;
        let left = node.left;
        
        node.left = left.right;
        if (left.right) {
            left.right.parent = node;
        }

        left.parent = parent;
        if (parent) {
            if (isLeft) {
                parent.left = left;
            } else {
                parent.right = left;
            }
        } else {
            this._root = left;
        }
    }

    /**
     * 交换节点位置  简单做法为值交换 这里采用节点交换
     * @param nodeFirst 
     * @param nodeSecond 
     */
    private _swapNode(nodeFirst: RBTreeNode, nodeSecond: RBTreeNode) {
        let firstParent = nodeFirst.parent;
        let firstLeft = nodeFirst.left;
        let firstRight = nodeFirst.right;
        let firstIsLeft = nodeFirst.isLeftChild();

        let secondParent = nodeSecond.parent;
        let secondLeft = nodeSecond.left;
        let secondRight = nodeSecond.right;
        let secondIsLeft = nodeSecond.isLeftChild();

        // 重定向first node
        nodeFirst.parent = secondParent;
        if (secondParent) {
            if (secondIsLeft) {
                secondParent.left = nodeFirst;
            } else {
                secondParent.right = nodeFirst;
            }
        }
        nodeFirst.left = secondLeft;
        if (secondLeft) {
            secondLeft.parent = nodeFirst;
        }
        nodeFirst.right = secondRight;
        if (secondRight) {
            secondRight.parent = nodeFirst;
        }

        // 重定向second node
        nodeSecond.parent = firstParent;
        if (firstParent) {
            if (firstIsLeft) {
                firstParent.left = nodeFirst;
            } else {
                secondParent.right = nodeFirst;
            }
        }
        nodeSecond.left = firstLeft;
        if (firstLeft) {
            firstLeft.parent = nodeSecond;
        }
        nodeSecond.right = firstRight;
        if (firstRight) {
            firstRight.parent = nodeSecond;
        }
    }
    
    /**
     * 比较器
     * @param e 当前
     * @param target 目标 
     * @returns 
     */
    private _compare(e: RBTreeNode, target: RBTreeNode): boolean {
        return e.score <= target.score;
    }

    /**
     * 获取序号
     * @param prev 
     * @param node 
     * @param index 
     * @returns 
     */
    private _onGetIndex(prev: RBTreeNode, node: RBTreeNode, index: number): number {
        if (!prev) {
            return -1;
        }
        if (node == prev) {
            return prev.index + index;
        }
        if (this._compare(node, prev)) {
            return this._onGetIndex(prev.left, node, index);         
        } else {
            return this._onGetIndex(prev.right, node, index+prev.index);
        }
    }

    /****************************** TEST *****************************/
    public test_toshow(): Array<Array<any>> {
        let show = new Array<Array<any>>();
        let lvl = 0;
        let nodes = [this._root];
        // console.log(this._root)
        while (true) {
            let exit = true;
            for (let node of nodes) {
                if (node) {
                    exit = false;
                }
            }
            if (exit) {
                break;
            }
            let swap = [];
            show[lvl] = new Array<any>();
            for (let node of nodes) {
                if (node) {
                    show[lvl].push({key: node.key, score: node.score, index: node.index});
                    swap.push(node.left);
                    swap.push(node.right);
                } else {
                    show[lvl].push(null)
                    swap.push(null);
                    swap.push(null);
                }
            }
            nodes = swap;
            lvl++;
        }
        return show;
    }

}