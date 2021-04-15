import { AssetUtils } from "../support/utils/AssetUtils";
import { Store } from "../core/Store";

export class Audio extends Store {
    name: string;
    loop: boolean = false;
    onComplete: Function;

    private _volume: number = 1;
    private _sound: cc.AudioClip;
    private _audioId: number = -1;
    private _playing: boolean = false;

    get volume(): number { return this._volume; }
    set volume(value: number) {
        this._volume = value;
        if (this._sound != null && this._audioId != -1) {
            cc.audioEngine.setVolume(this._audioId, this._volume);
        }
    }

    get audioId(): number { return this._audioId; }
    get playing(): boolean { return this._playing }

    play() {
        if (this.name == null || this.name == "" || this._playing) {
            return;
        }
        this._playing = true;
        let url = AssetUtils.getAudio(this.name);
        this._sound = cc.resources.get(url, cc.AudioClip);
        if (this._sound != null) {
            this.playSound();
        } else {
            cc.resources.load(url, cc.AudioClip, (err: Error, assets: cc.AudioClip) => {
                this._sound = assets;
                if (this._playing) {
                    this.playSound();
                }
            });
        }
    }

    dispose() {
        this.onComplete = null;
        this.stopSound();
        this.name = null;
        this.volume = 1;
        this.loop = false;
        this._playing = false;
        this._sound = null;
        this._audioId = -1;
        super.dispose()
    }

    private playSound(): void {
        if (this._sound == null) {
            return;
        }
        this._audioId = cc.audioEngine.play(this._sound, this.loop, this.volume);
        cc.audioEngine.setFinishCallback(this._audioId, () => {
            this._audioId = -1;
            this.onComplete && this.onComplete();
        });
    }

    private stopSound(): void {
        if (this._sound == null || this._audioId == -1) {
            return;
        }
        cc.audioEngine.stop(this._audioId);
    }
}
