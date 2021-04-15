export class Dictionary<K, V> {
    private _np$keys: K[] = []
    private _np$vals: V[] = []

    public setVal(key: K, val: V): void {
        let idx = this._np$keys.indexOf(key)
        if (idx == -1) {
            this._np$keys.push(key);
            this._np$vals.push(val);
        } else { this._np$vals[idx] = val; }
    }

    public getVal(key: K): V | null {
        let idx = this._np$keys.indexOf(key)
        return idx == -1 ? null : this._np$vals[idx]
    }

    public remove(key: K): boolean {
        let idx = this._np$keys.indexOf(key, 0)
        if (idx > -1) {
            this._np$keys.splice(idx, 1);
            this._np$vals.splice(idx, 1);
            return true
        }
        return false
    }

    public hasKey(key: K): boolean { return this._np$keys.indexOf(key) != -1 }
    public get size(): number { return this._np$keys.length }

    public keys(): K[] { return this._np$keys }
    public vals(): V[] { return this._np$vals }
}
