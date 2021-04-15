export interface ILoaderCallback {
    onComplete(data?: any): void;
    onProgress(data?: any): void;
    onError(data?: any): void;
}
