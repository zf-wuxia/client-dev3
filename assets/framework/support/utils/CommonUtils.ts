export module CommonUtils {
    export function isNull(obj: any): boolean {
        return obj === null;
    }

    export function isString(obj: any): boolean {
        return Object.prototype.toString.call(obj) === '[object String]';
    }

    export function isFunction(obj: any): boolean {
        if (typeof obj == 'function') {
            return true;
        }
        return false;
    }

    export function formatString(str: string, args: any[]): string {
        for (let i = 0; i < args.length; i++) {
            str = str.replace('{' + i + '}', args[i]);
        }
        return str;
    }
}
