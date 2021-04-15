import { ideal } from "../ideal";
import { AudioStacker } from "../audio/AudioStacker";
import { AudioType } from "../support/enum/LoaderType";
import { AssetUtils } from "../support/utils/AssetUtils";

export class AudioManager {
    private _effectVolume: number = 1;
    private _musicVolume: number = 1;
    private _effect: AudioStacker;
    private _music: AudioStacker;

    get effectVolume(): number { return this._effectVolume; }
    set effectVolume(v: number) {
        if (v == this._effectVolume) {
            return
        }
        this._effectVolume = v;
        if (this._effect) {
            this._effect.volume = v;
        }
    }

    get musicVolume(): number { return this._musicVolume; }
    set musicVolume(v: number) {
        if (this._musicVolume == v) {
            return;
        }
        this._musicVolume = v;
        if (this._music) {
            this._music.volume = v;
        }
    }

    playEffect(audioName: string, alone: boolean = true) {
        let stacker: AudioStacker = null;
        if (alone) {
            stacker = ideal.pool.get(AudioStacker);
            stacker.onComplete = stacker.dispose;
        } else {
            if (this._effect == null) {
                this._effect = ideal.pool.get(AudioStacker);
            }
            stacker = this._effect;
        }
        stacker.volume = this.effectVolume;
        stacker.clear();
        stacker.addAudio(AssetUtils.getAudioURL(audioName, AudioType.EFFECT));
        stacker.play();
    }

    getMusicId(): number {
        return this._music.currentAudio.audioId;
    }

    playMusic(audioName: string, loop: boolean = true) {
        if (this._music == null) {
            this._music = ideal.pool.get(AudioStacker);
        }
        this._music.volume = this._musicVolume;
        this._music.clear();
        this._music.loop = loop;
        this._music.addAudio(AssetUtils.getAudioURL(audioName, AudioType.MUSIC));
        this._music.play();
    }

    stopMusic() {
        if (this._music == null) {
            return;
        }
        this._music.clear();
    }
}
