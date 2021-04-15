import { Popup } from "../core/Popup";
import { ViewInfo } from "../core/View";
import { ideal } from "../ideal";
import { GameLayer } from "../support/enum/GameLayer";

export class PopupManager {
    private stacks: string[];
    private popups: Map<string, Popup>;

    constructor() {
        this.stacks = [];
        this.popups = Object.create(null);
    }

    show(info: ViewInfo, data?: object) {
        this.load(info).then((prefab: cc.Prefab) => {
            let node = cc.instantiate(prefab);
            let popup = node.getComponent(Popup);
            if (popup == null) {
                cc.error(`${info.name}不是一个有效的Page.`);
                return;
            }
            this.popups.set(info.name, popup);
            this.serialize(info, popup, data);
        });
    }

    hide(info: ViewInfo) {
        let idx = this.stacks.indexOf(info.name);
        let last = this.stacks.length + 1 == idx;
        if (idx > -1) {
            this.stacks.splice(idx, 1);
        }
        this.popups.get(info.name)!.hide();
        last && this.showNext();
    }

    hideAll() {
        for (let i = 0; i < this.stacks.length; i++) {
            this.popups.get(this.stacks[i])!.hide();
        }
        this.stacks.length = 0;
    }

    preload(info: ViewInfo) {
        cc.resources.preload(info.url, cc.Prefab);
    }

    load(info: ViewInfo): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load(info.url, cc.Prefab, (err: Error, prefab: cc.Prefab) => {
                if (err != null) {
                    cc.error(err), reject(err);
                    return;
                }
                resolve(prefab);
            });
        });
    }

    private getCurrentPropup(): Popup {
        if (this.stacks.length > 0) {
            let name = this.stacks[this.stacks.length - 1];
            return this.popups.get(name);
        }
        return null;
    }

    private serialize(info: ViewInfo, popup: Popup, data: object) {
        let currPriority = this.getCurrentPropup()?.node.zIndex || 0;

        if (info.priority < currPriority) {
            popup.node.active = false;
            for (let i = 0; i < this.stacks.length; i++) {
                let temp = this.popups.get(this.stacks[i]);
                if (info.priority <= temp.node.zIndex) {
                    this.stacks.splice(i, 0, info.name);
                    break;
                }
            }
        } else {
            this.hideAll();
            let idx = this.stacks.indexOf(info.name);
            if (idx >= 0) {
                this.stacks.splice(idx, 1);
            }
            this.stacks.push(info.name);
        }

        if (popup.node.zIndex != info.priority) {
            popup.node.zIndex = info.priority;
        }
        if (info.priority >= currPriority) {
            let scene = ideal.scene.currentScene;
            let layer = scene.getLayer(GameLayer.Popup);
            popup.show(layer, data);
        }
    }

    private showNext() {
        let popup: Popup;
        if (this.stacks.length > 0) {
            let name = this.stacks[this.stacks.length - 1];
            popup = this.popups.get(name);
        }
        if (popup && !popup.node.active) {
            popup.node.active = true;
        }
    }
}
