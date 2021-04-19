import { Page } from "../core/Page";
import { PageInfo } from "../core/View";
import { ideal } from "../ideal";
import { GameLayer } from "../support/enum/GameLayer";
import { AssetUtils } from "../support/utils/AssetUtils";

export class PageManager {
    private _activePage: Page;

    constructor() {
        this._activePage = null;
    }

    show(info: PageInfo, data?: object) {
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

    preload(info: PageInfo) {
        cc.resources.preload(
            AssetUtils.getPrefab(info.url),
            cc.Prefab
        );
    }

    load(info: PageInfo): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load(
                AssetUtils.getPrefab(info.url),
                cc.Prefab,
                (err: Error, prefab: cc.Prefab) => {
                    if (err != null) {
                        cc.error(err), reject(err);
                        return;
                    }
                    resolve(prefab);
                });
        });
    }
}
