import { GameLayer } from "../enum/GameLayer";
import { Event } from "./Event";

export class ModuleEvent extends Event {
    static SHOW_MODULE: string = 'ShowModule';
    static HIDE_MODULE: string = 'HideModule';
    static DISPOSE_MODULE: string = 'DisposeModule';
    static EXCUTE_MODULE_FUNCTION: string = 'ExcuteModuleFunction';
    static LOAD_MODULE_ASSET_PROGRESS: string = 'LoadModuleAssetProgress';
    static LOAD_MODULE_ASSET_COMPLETE: string = 'LoadModuleAssetComplete';

    private _moduleName: string;
    get moduleName(): string {
        return this._moduleName;
    }

    private _gameLayer: GameLayer | cc.Node;
    get gameLayer(): GameLayer | cc.Node {
        return this._gameLayer;
    }

    constructor(type: string, moduleName: string, gameLayer?: GameLayer | cc.Node, data?: object) {
        super(type, data);
        this._moduleName = moduleName;
        this._gameLayer = gameLayer;
    }
}
