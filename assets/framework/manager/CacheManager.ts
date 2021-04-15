export class CacheManager {
    private _caches: { [key: string]: object };

    constructor() {
        this._caches = Object.create(null);
    }

    // 是否存在
    has(url: string): boolean {
        return this._caches[url] != null;
    }

    // 添加一个
    add(url: string, obj: object) {
        this._caches[url] = obj;
    }

    // 获得一个
    get(url: string): object {
        return this._caches[url];
    }

    // 移除一个
    remove(url: string) {
        delete this._caches[url];
        cc.loader.release(url);
    }
}
