import { IPage } from "../interface/IPage";
import { LoaderType } from "../support/enum/LoaderType";
import { AssetUtils } from "../support/utils/AssetUtils";
import { View } from "./View";

export class Page extends View implements IPage {
    get enablePreloadAssets(): boolean { return true; }
    get assets(): { type: LoaderType, url: string }[] { return []; }

    protected ready(data?: object) {
        super.ready(data);
        this.enablePreloadAssets && this.preloadAssets();
    }

    protected preloadAssetsProgress(finish: number, total: number) {
        // TODO ...
    }

    protected preloadAssetsComplete(err: Error) {
        if (err) {
            cc.error(`${this.viewName}预加载资源异常: ${err}`);
            return;
        }
        cc.log(`${this.viewName}预加载资源完毕.`);

        // TODO ...
    }

    private preloadAssets() {
        if (this.assets.length > 0) {
            cc.resources.preload(
                AssetUtils.getAssets(this.assets),
                (finish: number, total: number) => {
                    this.preloadAssetsProgress(finish, total);
                },
                (err: Error) => {
                    this.preloadAssetsComplete(err);
                }
            );
        }
    }
}
