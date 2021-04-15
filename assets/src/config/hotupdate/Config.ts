// 本地存储路径
export const STORAGE_PATH = (CC_JSB && jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset';

// 热更服务器地址
export const HOT_UPDATE_ADDRESS = 'http://192.168.0.103:8066';

// 启用热更
export const ENABLE_HOT_UPDATE = true;
