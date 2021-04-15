import { IStore } from "../interface/IStore";

export class Store implements IStore {
    public reset(): void {

    }

    public dispose(): void {
        // EventManager.getInstance().removeEvent(null, null, this);
    }
}
