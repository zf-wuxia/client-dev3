import { ideal } from "../ideal";
import { IModule } from "../interface/IModule";
import { ModuleEvent } from "../support/event/ModuleEvent";
import { AssetUtils } from "../support/utils/AssetUtils";
import { NodeUtils } from "../support/utils/NodeUtils";
import { Store } from "./Store";

export class Module extends Store implements IModule {
    private _inited: boolean;
    private _initedAsset: boolean;
    private _showed: boolean;
    private _moduleName: string;

    protected node: cc.Node;
    protected parent: cc.Node;
    protected moduleData: any;

    get moduleName(): string { return this._moduleName; }
    get assets(): any[] { return []; }
    get inited(): boolean { return this._inited; }
    get valid(): boolean { return !this._initedAsset || (this.node && this.node.isValid); }

    constructor() {
        super();
        this._moduleName = NodeUtils.getQualifiedClassName(this);
    }

    init() {
        if (this._inited) {
            return;
        }
        this._inited = true;
        this.loadAssets();
    }

    showView() {
        if (this.node != null && this._showed) {
            this.node.name = this.moduleName;
            if (this.node.parent == null && this.parent) {
                this.parent.addChild(this.node);
            }
        }
        // TODO ...
        // 这里可以加入一些UI上需要重置显示的逻辑
    }

    hideView() {
        this._showed = false;
        if (this.node != null) {
            this.node.removeFromParent(false);
        }
    }

    ready() {
        // TODO ...
        // 这里可以加入一些UI节点的获取的逻辑
    }

    bindEvents() {
        // TODO ...
    }

    unbindEvents() {
        // TODO ...
    }

    // 该方法由模块管理器调用, 不建议继承或重写
    show(parent: cc.Node, data?: object) {
        if (this.parent != parent && this.node != null) {
            this.node.removeFromParent(false);
        }

        this._showed = true;
        this.parent = parent;
        this.moduleData = data;

        if (this._initedAsset) {
            this.showView();
        }
    }

    // 该方法由模块管理器调用, 不建议继承或重写
    hide(data?: object) {
        this.hideView();
    }

    dispose() {
        this.unbindEvents();
        if (this.node && this.node.isValid) {
            this.node.destroy();
        }
        this._showed = false;
        this._inited = false;
        this._initedAsset = false;
        this._moduleName = null;
        this.node = null;
        this.parent = null;
        this.moduleData = null;
        super.dispose();
    }

    private loadAssets() {
        if (this.assets.length == 0) {
            this.node = new cc.Node(this.moduleName);
            this.initView();
        } else {
            cc.resources.load(
                AssetUtils.getAssets(this.assets),
                (finish: number, total: number) => {
                    this.onLoadAssetProgress(finish, total);
                },
                (err: Error, assets: cc.Prefab[]) => {
                    this.onLoadAssetComplete(err, assets);
                }
            );
        }
    }

    private onLoadAssetProgress(finish: number, total: number) {
        ideal.event.emit(new ModuleEvent(
            ModuleEvent.LOAD_MODULE_ASSET_PROGRESS + this.moduleName,
            this.moduleName,
            null, { progress: finish }
        ));
    }

    private onLoadAssetComplete(err: Error, assets: cc.Prefab[]) {
        if (err != null) {
            cc.error(err);
            return;
        }
        ideal.event.emit(new ModuleEvent(
            ModuleEvent.LOAD_MODULE_ASSET_COMPLETE + this.moduleName,
            this.moduleName
        ));
        this.node = cc.instantiate(assets[0]);
        this.initView();
    }

    private initView() {
        if (this._initedAsset) {
            return;
        }
        this._initedAsset = true;

        this.ready();
        this.showView();
        this.bindEvents();
    }
}
