import { ideal } from "../../../framework/ideal";
import { Module } from "../../../framework/core/Module";
import { NodeUtils } from "../../../framework/support/utils/NodeUtils";
import { SceneName } from "../../config/namings/SceneName";

export class PlayerModule extends Module {
    get assets(): any { return ['Login/PlayerModule/PlayerModule']; }

    private sprHeroBody: cc.Sprite;
    private btnSubmit: cc.Button;
    private btnRandom: cc.Button;
    private layHeadWrap: cc.Node;
    private layName: cc.Node;
    private layNameWrap: cc.Node;
    private layNameCancel: cc.Node;
    private txtName: cc.EditBox;
    private animlock: boolean;

    ready() {
        this.sprHeroBody = NodeUtils.getNodeChildByName(this.node, 'HeroBody', cc.Sprite);
        this.layHeadWrap = NodeUtils.getNodeChildByName(this.node, 'HeadWrap');
        this.layName = NodeUtils.getNodeChildByName(this.node, 'HeroName');
        this.layNameWrap = NodeUtils.getNodeChildByName(this.node, 'HeroName/Wrap');
        this.layNameCancel = NodeUtils.getNodeChildByName(this.node, 'HeroName/Cancel');
        this.btnSubmit = NodeUtils.getNodeChildByName(this.node, 'HeroName/Wrap/Btn_Submit', cc.Button);
        this.btnRandom = NodeUtils.getNodeChildByName(this.node, 'HeroName/Wrap/Btn_Random', cc.Button);
        this.txtName = NodeUtils.getNodeChildByName(this.node, 'HeroName/Wrap/EditBox', cc.EditBox);
    }

    bindEvents() {
        this.btnRandom.node.on(cc.Node.EventType.TOUCH_END, this.onRandom, this);
        this.btnSubmit.node.on(cc.Node.EventType.TOUCH_END, this.onSubmit, this);
        this.layNameCancel.on(cc.Node.EventType.TOUCH_END, this.onCancelName, this);

        this.layHeadWrap.children.forEach((node: cc.Node, idx: number) => {
            node.on(cc.Node.EventType.TOUCH_END, () => {
                this.animlock = true;
                this.layName.active = true;
                cc.tween(this.layNameWrap).set({
                    opacity: 180,
                    x: -cc.winSize.width,
                }).to(0.3, {
                    x: 0,
                    opacity: 255,
                }).call(() => {
                    this.animlock = false;
                }).start();
            }, this);
        });
    }

    private onSubmit() {
        console.log(`名字: ${this.txtName.string}`);
        ideal.scene.changeScene(SceneName.SCENE_GAME);
    }

    private onRandom() {
        this.txtName.string = '我是传奇';
    }

    private onCancelName() {
        if (this.animlock) {
            return;
        }
        this.animlock = true;
        cc.tween(this.layNameWrap).to(0.3, {
            x: -cc.winSize.width,
            opacity: 128,
        }).call(() => {
            this.animlock = false;
            this.layName.active = false;
        }).start();
    }
}
