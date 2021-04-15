import { ideal } from "../ideal";
import { ILoader } from "../interface/ILoader";
import { ILoaderCallback } from "../interface/ILoaderCallback";
import { LoaderType } from "../support/enum/LoaderType";

export class LoaderCallback implements ILoaderCallback {
    private _target: any;
    private _complete: Function;
    private _progress: Function;
    private _error: Function;

    constructor(target: any, onComplete: Function, onProgress?: Function, onError?: Function) {
        this._target = target;
        this._complete = onComplete;
        this._progress = onProgress;
        this._error = onError;
    }

    onProgress(data?: any) {
        if (this._progress) {
            if (data == null) {
                this._progress.call(this._target);
            } else {
                this._progress.call(this._target, data);
            }
        }
    }

    onComplete(data?: any) {
        if (this._complete) {
            if (data == null) {
                this._complete.call(this._target);
            } else {
                this._complete.call(this._target, data);
            }
        }
    }

    onError(data?: any) {
        if (this._error) {
            if (data == null) {
                this._error.call(this._target);
            } else {
                this._error.call(this._target, data);
            }
        }
    }
}

export class Loader implements ILoader {
    cacheAsset: boolean = true;

    protected _contents: any[];
    protected _callbacks: ILoaderCallback[];
    protected _index: number;
    protected _urls: string[];
    protected _progress: number;
    protected _assetTypes: any[];
    protected _loaderTypes: LoaderType[];

    get size(): number { return this._urls.length; }

    constructor() {
        this._contents = [];
        this._callbacks = [];
        this._index = -1;
        this._urls = [];
        this._progress = 0;
        this._assetTypes = [];
        this._loaderTypes = [];
    }

    getUrl(idx: number): string { return this._urls[idx]; }
    getAssetType(idx: number): any { return this._assetTypes ? this._assetTypes[idx] : null; }
    getLoaderType(idx: number): LoaderType { return this._loaderTypes ? this._loaderTypes[idx] : null; }
    getContent(idx: number) { return this._contents[idx]; }

    addCallBack(target: any, onComplete: Function, onProgress?: Function, onError?: Function) {
        let callback = new LoaderCallback(target, onComplete, onProgress, onError);
        this._callbacks.push(callback);
    }

    load(url: string, assetType?: any, loaderType?: LoaderType) {
        if (this._urls.length > 0) {
            this._urls.push(url);
            if (assetType != null) {
                if (this._assetTypes == null) {
                    this._assetTypes = [];
                }
                this._assetTypes[this._assetTypes.length] = assetType;
            }
            if (loaderType != null) {
                if (this._loaderTypes == null) {
                    this._loaderTypes = [];
                }
                this._loaderTypes[this._loaderTypes.length] = loaderType;
            }
        } else {
            this.loads([url],
                assetType ? [assetType] : null,
                loaderType ? [loaderType] : null
            );
        }
    }

    loads(urls: string[], assetTypes?: any[], loadingTypes?: LoaderType[]) {
        this._urls = urls;
        this._assetTypes = assetTypes;
        this._loaderTypes = loadingTypes;
        this._progress = 100 / urls.length;
        this.loadAsset();
    }

    protected loadAsset() {
        this._index++;

        if (this._index >= this._urls.length) {
            setTimeout(() => this.complete(), 1);
        } else {
            let url = this.getUrl(this._index) as any;
            let res = ideal.cache.get(url);
            if (res) {
                this.onLoadComplete(null, res);
            } else {
                let type = this.getAssetType(this._index);
                if (typeof url == 'object') {
                    type = url.type;
                    url = url.asset;
                }
                if (url == '' || url == null || url == undefined || url.length == 0) { return; }
                cc.resources.load(url, type, (a, b, c) => this.onLoadProgress(a, b, c), (a, b) => this.onLoadComplete(a, b));
            }
        }
    }

    protected onLoadProgress(finish: number, total: number, item: any) {
        let p = 100;
        if (total != 0) {
            p = Math.floor(this._progress * this._index + (finish / total * this._progress));
        }
        this.dispatchProgress(p);
    }

    protected onLoadComplete(err: Error, res: any) {
        this._contents.push(res);
        if (err != null) {
            this.onLoadError(err);
        } else if (this.cacheAsset) {
            let url = this.getUrl(this._index);
            if (!ideal.cache.has(url)) {
                ideal.cache.add(url, res);
            }
        }
        this.loadAsset();
    }

    protected complete() {
        this.dispatchComplete();
        this.dispose()
    }

    protected onLoadError(err: Error) {
        cc.error('<资源加载出错>: ', err.message);
        this.dispatchError(err);
    }

    protected dispatchProgress(data?: any) {
        for (let i = 0; i < this._callbacks.length; i++) {
            let item = this._callbacks[i];
            item && item.onProgress(data);
        }
    }

    protected dispatchComplete(data?: any) {
        for (let i = 0; i < this._callbacks.length; i++) {
            let item = this._callbacks[i];
            item && item.onComplete(data);
        }
    }

    protected dispatchError(data?: any) {
        for (let i = 0; i < this._callbacks.length; i++) {
            let item = this._callbacks[i];
            item && item.onError(data);
        }
    }

    reset() {
        // TODO ...
    }

    dispose() {
        this._index = -1;
        this._callbacks.length = 0;
        this._assetTypes && (this._assetTypes.length = 0);
        this._urls.length = 0;
        this._contents.length = 0;
        this.cacheAsset = true;
        ideal.pool.store(this);
    }

    static get(): Loader {
        return ideal.pool.get(Loader);
    }
}
