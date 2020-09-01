//------------------------------------------------------------------------------------------
export class XType {
  
	//------------------------------------------------------------------------------------------
	public static createInstance (__class:any, ...args:any):any {
        switch (args.length) {
            case 0:
                return new __class ();
            case 1:
                return new __class (args[0]);
            case 2:
                return new __class (args[0], args[1]);
            case 3:
                return new __class (args[0], args[1], args[2]);
            case 4:
                return new __class (args[0], args[1], args[2], args[3]);
        }
    }

    //------------------------------------------------------------------------------------------
    public static isFunction (__value:any):boolean {
        return __value instanceof Function;
    }

    //------------------------------------------------------------------------------------------
    public static createError (__message:string):Error {
        return new Error (__message)
    }

	//------------------------------------------------------------------------------------------
	public static removeAllKeys (__map:Map<any, any>):void {
        __map.clear ();
    }
     
	//------------------------------------------------------------------------------------------
	public static getNowDate ():Date {
        return new Date ();
    }
    
//------------------------------------------------------------------------------------------
}