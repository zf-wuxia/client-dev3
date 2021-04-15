import { LoaderType } from "../support/enum/LoaderType";

export interface IPage {
    enablePreloadAssets: boolean;
    assets: { type: LoaderType, url: string }[];
    on(eventName: string, func: Function): void;
    off(eventName: string, func: Function): void;
}
