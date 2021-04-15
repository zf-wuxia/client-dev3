import { ideal } from "../../../framework/ideal";
import { ENABLE_HOT_UPDATE, STORAGE_PATH } from "../../config/hotupdate/Config";
import { DEFAULT_MANIFEST } from "../../config/hotupdate/Manifest";
import { SceneName } from "../../config/namings/SceneName";
import LoginScene from "../../login/LoginScene";
import LauncherScene, { PROGRESS_WIDTH } from "../LauncherScene";

export class NativeEnter extends cc.Component {
    private _launchScene: LauncherScene;
    private _assetsManager: jsb.AssetsManager;
    private _working: boolean;
    private _canRetry: boolean;
    private _failCount: number;

    onLoad() {
        // 默认的Manifest配置
        let manifest: jsb.Manifest = new jsb.Manifest(DEFAULT_MANIFEST, STORAGE_PATH);

        this._launchScene = this.node.getComponent(LauncherScene);
        this._assetsManager = new jsb.AssetsManager('', STORAGE_PATH);
        this._assetsManager.setVersionCompareHandle(this.versionCompareHandle);
        this._assetsManager.loadLocalManifest(manifest, STORAGE_PATH);

        cc.log(`热更文件存储地址: ${STORAGE_PATH}`);
        cc.log(`ManifetsRoot: ${this._assetsManager.getLocalManifest().getManifestRoot()}`);
        cc.log(`ManifetsVersion: ${this._assetsManager.getLocalManifest().getVersion()}`);
        this.ready();
    }

    private ready() {
        this.setMessage('正在启动引擎，请稍后。。。');
        this.checkUpdate();
    }

    private checkUpdate() {
        if (ENABLE_HOT_UPDATE) {
            this.setMessage('正在检测版本，请稍后。。。');
            this._assetsManager.setEventCallback(this.onCheckUpdate.bind(this));
            this._assetsManager.checkUpdate();
        } else {
            this.onComplete();
        }
    }

    private hotUpdate() {
        cc.log('开始热更工作');
        this.showProgress();
        this._assetsManager.setEventCallback(this.onHotUpdate.bind(this));
        this._failCount = 0;
        this._assetsManager.update();
    }

    private retry() {
        if (!this._working && this._canRetry) {
            this._canRetry = false;

            this.setMessage('Retry failed Assets...');
            this._assetsManager.downloadFailedAssets();
        }
    }

    private versionCompareHandle(versionA: string, versionB: string): number {
        cc.log(`Version Compare: version A is ${versionA}, version B is ${versionB}.`);
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || '0');
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }

    private onCheckUpdate(ev: jsb.EventAssetsManager) {
        cc.log(`onCheckUpdate Code: ${ev.getEventCode()}`);

        switch (ev.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.setMessage('没有找到本地清单文件，即将跳过热更。。。');
                this.onComplete();
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.setMessage('下载或解析清单文件失败，即将跳过热更。。。');
                this.onComplete();
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.setMessage('已经是最新版本，即将跳过热更。。。');
                this.onComplete();
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                let newVersion: string = this._assetsManager.getRemoteManifest().getVersion();
                let totalBytes: number = Math.ceil(this._assetsManager.getTotalBytes() / 1024);
                this.setMessage(`发现新版本${newVersion}，需要更新${totalBytes}kb。`);
                this.hotUpdate();
                break;
            default:
                return;
        }
    }

    private onHotUpdate(ev: jsb.EventAssetsManager) {
        cc.log(`onHotUpdate Code: ${ev.getEventCode()} `);

        var needRetry = false;
        var needRestart = false;

        switch (ev.getEventCode()) {
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let downloadedFiles: number = ev.getDownloadedFiles();
                let totalFiles: number = ev.getTotalFiles();
                let downloadedBytes: number = parseFloat((ev.getDownloadedBytes() / 1024 / 1024).toFixed(2));
                let totalBytes: number = parseFloat((ev.getTotalBytes() / 1024 / 1024).toFixed(2));
                this.setMessage(`文件: ${downloadedFiles}/${totalFiles}, 大小: ${downloadedBytes}/${totalBytes}MB`);
                this.setProgress(ev.getPercent());
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.setMessage('即将进入游戏，请稍后。。。');
                this.onComplete();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                needRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.setMessage(`资源更新错误: ${ev.getAssetId()}, ${ev.getMessage()}`);
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.setMessage(ev.getMessage());
                break;
            default:
                break;
        }

        if (needRetry) {
            this._assetsManager.setEventCallback(null);
            this.retry();
        }
        else if (needRestart) {
            this._assetsManager.setEventCallback(null);

            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._assetsManager.getLocalManifest().getSearchPaths();
            cc.log(`清单搜索路径：${JSON.stringify(newPaths)}`);

            Array.prototype.unshift.apply(searchPaths, newPaths);
            localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.log('即将重启。。。');
            setTimeout(() => cc.game.restart(), 1000);
        }
    }

    private onComplete() {
        // this.setMessage('即将进入游戏，请稍后。。。');
        this._assetsManager.setEventCallback(null);

        let loginScene = new LoginScene();
        loginScene.ready();
        loginScene.preloadAssets(null, () => {
            ideal.scene.changeScene(SceneName.SCENE_LOGIN);
        });
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
