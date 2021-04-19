import { ideal } from "../ideal";
import { NodeUtils } from "../support/utils/NodeUtils";

const { ccclass, menu } = cc._decorator;

@ccclass
export class View extends cc.Component {
    protected data: any;

    private _viewName: string;
    get viewName(): string { return this._viewName; }

    constructor() {
        super();
        this._viewName = NodeUtils.getQualifiedClassName(this);
    }
    
    onEnable() {
        this.bindEvents();
    }

    onDisable() {
        ideal.event.off(null, null, this);
    }

    show(parent: cc.Node, data?: object) {
        if (parent != null && this.node != null) {
            this.node.removeFromParent();
            parent.addChild(this.node);
            this.ready(data);
        }
    }

    hide() {
        if (this.node != null) {
            this.node.removeFromParent();
        }
    }

    on(eventName: string, func: Function) {
        ideal.event.on(eventName, func, this);
    }

    off(eventName: string, func: Function) {
        ideal.event.off(eventName, func, this);
    }

    protected ready(data?: any) {
        this.data = data;
    }

    protected bindEvents() {
        // TODO ...
    }
}

export type PageInfo = {
    name: string;
    url: string;
};

export type PopupInfo = {
    name: string;
    url: string;
    priority?: number;
    only: boolean;    // 唯一Popup会顶替掉前面相同的Popup
    orderly: boolean; // 有秩序的Popup当显示优先级低于当前正在显示的Popup会进去堆栈
}
