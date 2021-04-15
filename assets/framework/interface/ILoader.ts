import { LoaderType } from "../support/enum/LoaderType";
import { IStore } from "./IStore";

export interface ILoader extends IStore {
    size: number
    load(url: any, assetType?: any, loaderType?: LoaderType): void
    getAssetType(index: number): any
    getContent(index: number): any
    addCallBack(target: any, complete: Function, progress?: Function, error?: Function): void
}
