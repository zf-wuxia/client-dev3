import { NodeUtils } from "../support/utils/NodeUtils";

export class PoolManager {
    private pools: { [key: string]: any[] };
    private prefabPaths: { [key: string]: string };

    constructor() {
        this.pools = Object.create(null);
        this.prefabPaths = Object.create(null);
    }

    store(obj: any) {
        this.addObject(NodeUtils.getQualifiedClassName(obj), obj);
    }

    storeNode(obj: cc.Component | cc.Node, pool: boolean = false) {
        if (obj instanceof cc.Node) {
            this.resetNode(obj);
            if (obj['_prefab']) {
                let fileId = '';
                if (pool) {
                    fileId = '_' + obj['_prefab']['fileId'];
                }
                let prefabName = this.prefabPaths[obj['_prefab']['fileId']] + fileId;
                this.addObject(prefabName, obj);
            }
        }
        else if (obj && obj.node) {
            this.resetNode(obj.node);
            if (obj instanceof cc.Sprite) {
                obj.sizeMode = cc.Sprite.SizeMode.TRIMMED;
                obj.spriteFrame = null;
            }
            let className = NodeUtils.getQualifiedClassName(obj);
            this.addObject(className, obj);
        }
    }

    get(clz: any): any {
        let className = NodeUtils.getQualifiedClassName(clz);
        let obj = this.getObject(className);
        if (obj == null) {
            obj = new clz();
        }
        return obj;
    }

    getPrefabNode(prefabName: string, pool: boolean = false): any {
        // if (CacheManager.hasCache()) {

        // }
        return null;
    }

    getNode(clz: typeof cc.Component | cc.Prefab, pool: boolean = false): any {
        let className = NodeUtils.getQualifiedClassName(clz);
        if (clz instanceof cc.Prefab) {
            let fileId = '';
            if (pool) {
                fileId = '' + clz['data']['_prefab']['fileId'];
            }
            let prefab = this.getObject(className + '_' + clz.name + fileId);
            if (prefab == null) {
                prefab = cc.instantiate(clz);
            }
            if (prefab['_prefab'] != null) {
                this.prefabPaths[prefab['_prefab'['fileId']]] = className + '_' + clz.name;
            }
            return prefab;
        }

        let obj = this.getObject(className);
        if (obj == null) {
            obj = new cc.Node().addComponent(clz);
        }
        return obj;
    }

    private getObject(name: string): any {
        if (this.pools[name] != null && this.pools[name].length > 0) {
            return this.pools[name].shift();
        }
        return null;
    }

    private addObject(name: string, obj: any) {
        if (this.pools[name] == null) {
            this.pools[name] = [];
        }
        if (this.pools[name].indexOf(obj) == -1) {
            this.pools[name].push(obj);
        }
    }

    private resetNode(node: cc.Node): void {
        if (node.parent) {
            node.removeFromParent();
        }
        node.scaleX = 1;
        node.scaleY = 1;
        node.opacity = 255;
        node.angle = 0;
        node.skewX = 0;
        node.skewY = 0;
        node.x = 0;
        node.y = 0;
    }
}
