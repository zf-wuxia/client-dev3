import { IStore } from "./IStore";

export interface IModule extends IStore {
    moduleName: string;
    assets: any[];
    inited: boolean;
    valid: boolean;

    init(): void;
    show(parent: cc.Node, data?: object): void;
    hide(data?: object): void;
    ready(): void;
    showView(): void;
    hideView(): void;
    bindEvents(): void;
    unbindEvents(): void;
}
