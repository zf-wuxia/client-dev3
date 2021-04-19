import { ideal } from "../../../framework/ideal";
import { Loader } from "../../../framework/loader/Loader";
import { LoaderType } from "../../../framework/support/enum/LoaderType";
import { AssetUtils } from "../../../framework/support/utils/AssetUtils";
import { SceneName } from "../../config/namings/SceneName";
import LauncherScene, { PROGRESS_WIDTH } from "../LauncherScene";

const PRELOAD_ASSETS = [
    { type: LoaderType.PREFAB, url: 'Login/LoginModule/LoginModule' },
    { type: LoaderType.PREFAB, url: 'Login/PlayerModule/PlayerModule' },
    { type: LoaderType.PREFAB, url: 'Login/ReadyModule/ReadyModule' },
    { type: LoaderType.PREFAB, url: 'Login/RegisterModule/RegisterModule' },
    { type: LoaderType.PREFAB, url: 'Login/ServerModule/ServerModule' },
    { type: LoaderType.PREFAB, url: 'Game/HomePage' }
];

export class DefaultEnter extends cc.Component {
    private _launchScene: LauncherScene;

    onLoad() {
        this._launchScene = this.node.getComponent(LauncherScene);

        this.ready();
    }

    private ready() {
        this.showProgress();
        this.setMessage('正在加载必要资源，请耐心等待。。。');

        let loader = Loader.get();
        loader.loads(AssetUtils.getAssets(PRELOAD_ASSETS));
        loader.addCallBack(this, this.onLoadComplete, this.onLoadProgress);
    }

    private onLoadComplete(err: Error) {
        ideal.scene.changeScene(SceneName.SCENE_GAME);
    }

    private onLoadProgress(finish: number, total: number) {
        this.setProgress(parseFloat((finish / 100).toFixed(2)));
    }

    private setMessage(message: string) {
        if (this._launchScene != null) {
            this._launchScene.lblMessage.string = message;
            cc.log(`Message: ${message} `);
        }
    }

    private setProgress(progress: number) {
        if (this._launchScene != null) {
            this._launchScene.lblProgress.string = parseFloat((progress * 100).toFixed(2)) + '%';
            this._launchScene.barProgress.width = PROGRESS_WIDTH * progress;
        }
    }

    private showProgress() {
        if (this._launchScene != null) {
            this._launchScene.layProgress.active = true;
        }
    }

    private hideProgress() {
        if (this._launchScene != null) {
            this._launchScene.layProgress.active = false;
        }
    }
}
