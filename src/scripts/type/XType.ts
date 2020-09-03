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
	public static  Number_MAX_VALUE ():number {
        return 179 * Math.pow(10, 306);
    }
  
	//------------------------------------------------------------------------------------------
	public static clearArray (__array:Array<any>):void {
		__array.length = 0;
    }
        
    //------------------------------------------------------------------------------------------
	public static forEach (__map:Map<any, any>, __callback:any):void {
        var __key:any;

		for (__key of __map.keys ()) {
			__callback (__key);
		}
	}
		
	//------------------------------------------------------------------------------------------
	public static doWhile (__map:Map<any, any>, __callback:any):void {
        var __key:any;
        
		for (__key of __map.keys ()) {
			if (!__callback (__key)) {
				return;
			}
		}
    }
        
//------------------------------------------------------------------------------------------
}