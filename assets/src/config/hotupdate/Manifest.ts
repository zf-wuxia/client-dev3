import { HOT_UPDATE_ADDRESS } from "./Config";

// 默认Manifest
export const DEFAULT_MANIFEST = JSON.stringify({
    "packageUrl": HOT_UPDATE_ADDRESS + "/remote-assets/",
    "remoteManifestUrl": HOT_UPDATE_ADDRESS + "/remote-assets/project.manifest",
    "remoteVersionUrl": HOT_UPDATE_ADDRESS + "/remote-assets/version.manifest",
    "version": "1.0.0",
    "assets": {
    },
    "searchPaths": []
});
