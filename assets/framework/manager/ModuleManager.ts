import { Module } from "../core/Module";
import { ideal } from "../ideal";
import { IModule } from "../interface/IModule";
import { GameLayer } from "../support/enum/GameLayer";
import { ModuleEvent } from "../support/event/ModuleEvent";
import { SceneEvent } from "../support/event/SceneEvent";

export class ModuleManager {
    private _domains: { [key: string]: typeof Module } = {};
    private _modules: { [key: string]: IModule } = {};

    constructor() {
        ideal.event.on(ModuleEvent.HIDE_MODULE, this.onHideModule, this);
        ideal.event.on(ModuleEvent.DISPOSE_MODULE, this.onDisposeModule, this);
    }

    __addModuleClass(moduleName: string, moduleClass: typeof Module, force?: boolean) {
        if (this._domains[moduleName]) {
            if (force) {
                this._domains[moduleName] = moduleClass;
            } else {
                // console.warn(`[ModuleManager]: ${moduleName} 模块类已经存在`);
            }
        } else {
            this._domains[moduleName] = moduleClass;
        }
    }

    __addModule(moduleName: string, module: IModule) {
        if (this._modules[moduleName] == null) {
            this._modules[moduleName] = module;
        } else {
            console.warn(`[ModuleManager]: ${moduleName} 实例已经存在`);
        }
    }

    __removeModule(moduleName: string) {
        delete this._modules[moduleName];
    }

    __hasModule(moduleName: string): boolean {
        return this._modules[moduleName] != null;
    }

    __getModule(moduleName: string, disposeInvalid?: boolean): IModule {
        if (disposeInvalid) {
            // 销毁无效的Module
            if (this._modules[moduleName] && this._modules[moduleName].inited && !this._modules[moduleName].valid) {
                this._modules[moduleName].dispose();
                delete this._modules[moduleName];
            }
        }
        if (this._modules[moduleName] == null) {
            let moduleClass = this._domains[moduleName];
            if (moduleClass != null) {
                this._modules[moduleName] = new moduleClass();
            }
        }
        return this._modules[moduleName];
    }

    __disposeModule(moduleName: string) {
        console.log(`销毁模块实例 => ${moduleName}`);
        this._modules[moduleName].dispose();
        delete this._modules[moduleName];
    }

    show(moduleName: string, gameLayer: GameLayer | cc.Node, data?: object) {
        if (gameLayer == null) return;
        let module = this.__getModule(moduleName, true);
        if (module == null) { return; }

        let scene = ideal.scene.currentScene;
        let parent = (gameLayer instanceof cc.Node) ? gameLayer : scene.getLayer(gameLayer as GameLayer);
        module.moduleName = moduleName;
        module.init();
        module.show(parent, data);
    }

    private onHideModule(ev: ModuleEvent) {
        if (this.__hasModule(ev.moduleName)) {
            this.__getModule(ev.moduleName).hide(ev.data);
        }
    }

    private onDisposeModule(ev: ModuleEvent) {
        if (this.__hasModule(ev.moduleName)) {
            this.__disposeModule(ev.moduleName);
        }
    }
}
