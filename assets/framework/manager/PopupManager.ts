import { Popup } from "../core/Popup";
import { PopupInfo, View } from "../core/View";
import { ideal } from "../ideal";
import { GameLayer } from "../support/enum/GameLayer";
import { AssetUtils } from "../support/utils/AssetUtils";

export class PopupManager {
    private actives: { name: string, node: cc.Node }[];
    private caches: Map<string, cc.Prefab>;

    constructor() {
        this.actives = [];
        this.caches = new Map();
    }

    show(info: PopupInfo, data?: object) {
        this.load(info.url).then((prefab: cc.Prefab) => {
            let node = cc.instantiate(prefab);
            let popup = node.getComponent(Popup);
            if (popup == null) {
                cc.error(`${info.name}不是一个有效的Popup.`);
                return;
            }
            let scene = ideal.scene.currentScene;
            let layer = scene.getLayer(GameLayer.Popup);
            popup.show(layer, data);
            this.actives.push({ name: info.name, node: node });
        });
    }

    hide(info: PopupInfo | string) {
        let name = typeof info == 'object' ? info.name : info;
        for (let i = this.actives.length - 1; i > -1 ; i--) {
            if (this.actives[i].name == name) {
                this.actives[i].node.getComponent(Popup).hide();
            }
        }
    }

    hideAll() {
        while(this.actives.length > 0) {
            this.actives[0].node.getComponent(Popup).hide();
        }
    }

    __hide(node: cc.Node) {
        for (let i = 0; i < this.actives.length; i++) {
            if (this.actives[i].node == node) {
                node.removeFromParent();
                this.actives.splice(i, 1);
                break;
            }
        }
    }

    private preload(info: PopupInfo) {
        cc.resources.preload(
            AssetUtils.getPrefab(info.url),
            cc.Prefab
        );
    }

    private load(url: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            let cache = this.caches.get(url);
            if (cache == null) {
                cc.resources.load(
                    AssetUtils.getPrefab(url),
                    cc.Prefab,
                    (err: Error, prefab: cc.Prefab) => {
                        if (err != null) {
                            cc.error(err), reject(err);
                            return;
                        }
                        this.caches.set(url, prefab);
                        resolve(prefab);
                    }
                );
            } else {
                resolve(cache);
            }
        });
    }
}
