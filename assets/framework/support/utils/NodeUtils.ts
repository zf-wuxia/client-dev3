export module NodeUtils {
    export function getQualifiedClassName(value: any): string {
        if (value['ClassName'] != null) {
            return value['ClassName'];
        }
        if (typeof value == 'function') {
            let prototype = value.prototype;
            if (prototype && prototype.hasOwnProperty('__classname__') && prototype.__classname__) {
                return prototype.__classname__;
            }
            let retval = '';
            if (value.name) {
                retval = value.name;
            }
            if (value.toString) {
                let arr, str = value.toString();
                if (str.charAt(0) == '[') {
                    arr = str.match(/\[\w+\s*(\w+)\]/);
                } else {
                    arr = str.match(/function\s*(\w+)/);
                }
                if (arr && arr.length == 2) {
                    retval = arr[1];
                }
            }
            return retval != 'Object' ? retval : '';
        }
        else if (value && value.constructor) {
            return getQualifiedClassName(value.constructor);
        }
        return '';
    }

    export function getNodeChildByName(node: cc.Node, childPath: string, component?: any): any {
        let childArr = childPath.split('/');
        while(childArr.length > 0) {
            node = node.getChildByName(childArr.shift());
            if (childArr.length == 0) {
                if (node != null && component != null) {
                    return node.getComponent(component);
                } else {
                    return node;
                }
            }
        }
        return null;
    }
}
