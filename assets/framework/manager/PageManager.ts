import { Page } from "../core/Page";
import { ViewInfo } from "../core/View";
import { ideal } from "../ideal";
import { GameLayer } from "../support/enum/GameLayer";

export class PageManager {
    private _activePage: Page;

    constructor() {
        this._activePage = null;
    }

    show(info: ViewInfo, data?: object) {
        let scene = ideal.scene.currentScene;
        let layer = scene.getLayer(GameLayer.UI);

        if (layer.getChildByName(info.name)) {
            return;
        }

        this.load(info).then((prefab: cc.Prefab) => {
            let node = cc.instantiate(prefab);
            let page = node.getComponent(Page);
            if (page == null) {
                cc.error(`${info.name}不是一个有效的Page.`);
                return;
            }
            page.show(layer, data);
            if (this._activePage && this._activePage.isValid) {
                this._activePage.hide();
            }
            this._activePage = page;
        });
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
}
