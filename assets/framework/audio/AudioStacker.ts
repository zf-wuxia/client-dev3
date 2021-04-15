import { ideal } from "../ideal";
import { Audio } from "./Audio";
import { Store } from "../core/Store";

export class AudioStacker extends Store {
    currentAudio: Audio = null;
    onComplete: Function;
    loop: boolean = false;

    private _playing: boolean = false;
    private _audios: string[] = [];
    private _volume: number = 1;

    get volume(): number { return this._volume; }
    set volume(v: number) {
        this._volume = v;
        if (this.currentAudio) {
            this.currentAudio.volume = this._volume;
        }
    }

    addAudio(audioName: string) {
        this._audios.push(audioName);
    }

    play() {
        if (this._playing) {
            return;
        }
        this._playing = true;
        this.next();
    }

    clear() {
        this._playing = false;
        this.currentAudio && this.currentAudio.dispose();
        this.currentAudio = null;
        this._audios.length = 0;
        this.loop = false;
    }

    dispose() {
        this.clear();
        this.onComplete = null;
        this.currentAudio = null;
        super.dispose();
    }

    private next() {
        if (this._audios.length == 0) {
            this.onComplete && this.onComplete();
            this.clear();
        } else {
            let audioName = this._audios.shift();
            this.currentAudio && this.currentAudio.dispose();
            this.currentAudio = ideal.pool.get(Audio);
            this.currentAudio.volume = this.volume;
            this.currentAudio.name = audioName;
            this.currentAudio.onComplete = this.next.bind(this);
            this.currentAudio.play();
            if (this.loop) {
                this._audios.push(audioName);
            }
        }
    }
}
