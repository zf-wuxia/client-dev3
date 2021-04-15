import { AudioType, LoaderType } from "../enum/LoaderType";

const ROOT_AUDIO: string = 'Audios/';
const ROOT_PREFAB: string = 'Prefabs/';
const ROOT_TEXTURE: string = 'Textures/';
const ROOT_FONT: string = 'Fonts/';
const ROOT_DRAGONBONE: string = 'DragonBones/';
const ROOT_ANIMATION: string = 'Animations/';
const ROOT_EFFECT: string = 'Effects/';
const ROOT_MUSIC: string = 'Musices/';
const ROOT_LANGUAGE: string = "Languages/"

export module AssetUtils {
    export function getAudio(audioName: string): string {
        return ROOT_AUDIO + audioName;
    }

    export function getPrefab(prefabName: string): string {
        if (prefabName.indexOf(ROOT_PREFAB) == 0) {
            return prefabName;
        }
        return ROOT_PREFAB + prefabName
    }

    export function getTexture(textureName: string): string {
        return ROOT_TEXTURE + textureName;
    }

    export function getFont(fontName: string): string {
        return ROOT_FONT + fontName;
    }

    export function getAssets(assets: { type: LoaderType, url: string }[]): string[] {
        let result: string[] = [];
        for (let i = 0; i < assets.length; i++) {
            if (assets[i] != null) {
                switch (assets[i].type) {
                    case LoaderType.PREFAB:
                        result[result.length] = AssetUtils.getPrefab(assets[i].url);
                        break;
                    case LoaderType.IMAGE, LoaderType.SPRITE:
                        result[result.length] = AssetUtils.getTexture(assets[i].url);
                        break;
                    case LoaderType.AUDIO_EFFECT:
                        result[result.length] = AssetUtils.getAudioURL(assets[i].url, AudioType.EFFECT);
                        break;
                    case LoaderType.AUDIO_MUSIC:
                        result[result.length] = AssetUtils.getAudioURL(assets[i].url, AudioType.MUSIC);
                        break;
                    case LoaderType.DRAGON_BONE:
                        result[result.length] = AssetUtils.getDragonBone(assets[i].url).ske;
                        break;
                    case LoaderType.SPRITE_ATLAS:
                        result[result.length] = AssetUtils.getTexture(assets[i].url + '.plist');
                        break;
                }
            }
        }
        return result;
    }

    export function getAnimationPath(animationName: string): string {
        return ROOT_ANIMATION + animationName;
    }

    export function getLanguage(languageName: string): string {
        return ROOT_LANGUAGE + languageName;
    }

    export function getDragonBone(dragonBoneName: string): { name: string, ske: string, tex: string, img: string } {
        return {
            name: ROOT_DRAGONBONE + dragonBoneName,
            ske: ROOT_DRAGONBONE + dragonBoneName + "_ske",
            tex: ROOT_DRAGONBONE + dragonBoneName + "_tex",
            img: ROOT_DRAGONBONE + dragonBoneName + "_tex"
        };
    }

    export function getAudioURL(audioName: string, audioType: AudioType): string {
        switch (audioType) {
            case AudioType.EFFECT:
                return ROOT_EFFECT + audioName;
            case AudioType.MUSIC:
                return ROOT_MUSIC + audioName;
        }
    }
}
