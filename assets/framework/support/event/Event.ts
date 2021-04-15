export class Event {
    private _type: string;
    private _data: any;

    constructor(type: string, data?:any) {
        this._type = type;
        this._data = data;
    }

    public get type(): string {
        return this._type;
    }
    
    public get data(): any {
        return this._data;
    }
}
