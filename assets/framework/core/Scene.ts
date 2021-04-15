import { ideal } from "../ideal";
import { SCREEN_DESIGN_HEIGHT, SCREEN_DESIGN_WIDTH } from "../config/Screen";
import { IModule } from "../interface/IModule";
import { GameLayer, GameLayerNames } from "../support/enum/GameLayer";
import { Module } from "./Module";
import { View } from "./View";

export class Scene extends View {
    protected modules: { [key: string]: IModule } = {};

    private _layers: cc.Node[] = [];

    onLoad() {
        ideal.scene.currentScene = this;
        this.initLayers();
    }

    onGetSceneData(data: object) {

    }

    ready() {
        // TODO ...
        // 这里可以加入一些module载入的逻辑
    }

    showView() {
        // TODO ...
        // 这里可以加入一些UI初始化的逻辑
    }

    onDisable() {
        for (let key in this.modules) {
            if (ideal.module.__hasModule(key)) {
                ideal.module.__disposeModule(key);
            }

            let assets = this.modules[key].assets;
            for (let i = 0; i < assets.length; i++) {
                cc.resources.release(assets[i]);
            }

            delete this.modules[key];
        }
        super.onDisable();
    }

    getLayer(layerIdx: GameLayer): cc.Node {
        return this._layers[layerIdx];
    }

    addModule(moduleName: string, moduleClass: typeof Module | IModule) {
        switch (typeof moduleClass) {
            case 'function':
                ideal.module.__addModuleClass(moduleName, moduleClass);
                break;
            case 'object':
                ideal.module.__addModule(moduleName, moduleClass);
                break;
        }
        this.modules[moduleName] = ideal.module.__getModule(moduleName, true);
    }

    preloadAssets(onProgress?: (finish: number, total: number) => void, onComplete?: (err: Error) => void) {
        let assets = [];
        for (let key in this.modules) {
            assets = assets.concat(this.modules[key].assets);
        }

        cc.resources.preload(assets,
            (finish: number, total: number) => {
                onProgress && onProgress(finish, total);
            },
            (err: Error) => {
                onComplete && onComplete(err);
            }
        );
    }

    private initLayers() {
        for (let i = 0; i < GameLayerNames.length; i++) {
            let layer = this.node.getChildByName(GameLayerNames[i]);
            if (layer == null) {
                layer = new cc.Node(GameLayerNames[i]);
                this.node.addChild(layer);
                layer.setContentSize(SCREEN_DESIGN_WIDTH, SCREEN_DESIGN_HEIGHT);
            }
            this._layers.push(layer);
        }

        this.ready();
        this.showView();
    }
}
