import iTableView, { EventType } from "./iTableView";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("框架组件/iViewCell")
export default class iViewCell extends cc.Component {
    private pressed: boolean = false

    public data: any = null
    public parent: iTableView = null

    // 更新视图 (待子类重写)
    public updateView(index: number) {
        // TODO...
    }

    // 刷新TableView
    public refreshTableView() {
        if (this.parent != null) {
            this.parent.refresh()
        }
    }

    public onEnable() {
        if (!CC_EDITOR) {
            this.registerEvent()
        }
    }

    public onDisable() {
        if (!CC_EDITOR) {
            this.unregisterEvent()
        }
    }

    private registerEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this)
    }

    private unregisterEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this)
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this)
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this)
    }

    private onTouchBegan(ev: cc.Event.EventTouch) {
        this.pressed = true
        ev.stopPropagation()
    }

    private onTouchMoved(touch: cc.Touch) {
        let deltaMove = touch.getLocation().sub(touch.getStartLocation())
        if (deltaMove.mag() > 7 && this.pressed) {
            this.pressed = false
        }
    }

    private onTouchEnded(ev: cc.Event.EventTouch) {
        if (this.pressed) {
            this.parent.dispatchEvent(EventType.VIEWCELL_CHECKED, this.data)
        }
        ev.stopPropagation()
    }
}
