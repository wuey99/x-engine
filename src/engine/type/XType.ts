//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014-2021 Jimmy Huey (wuey99@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// <$end$/>
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
export interface Class<T> extends Function {
    new (...args: any[]): T;
}

//------------------------------------------------------------------------------------------
export class XType {
  
	//------------------------------------------------------------------------------------------
	public static createInstance (__class:Class<any>, ...args:any):any {
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
	public static min (__value1:number, __value2:number):number {
		if (__value1 < __value2) {
			return __value1;
		} else {
			return __value2;
		}
	}
		
	//------------------------------------------------------------------------------------------
	public static max (__value1:number, __value2:number):number {
		if (__value1 > __value2) {
			return __value1;
		} else {
			return __value2;
		}
	}
		
	//------------------------------------------------------------------------------------------
	public static removeAllKeys (__map:Map<any, any>):void {
        __map.clear ();
    }
     
	//------------------------------------------------------------------------------------------
	public static parseInt (__val:string):number {
        var __result:number = parseFloat (__val);

        __result = Math.floor (__result);

        return __result;
	}
		
	//------------------------------------------------------------------------------------------
	public static parseFloat (__val:string):number {
		return parseFloat (__val);
    }
        
	//------------------------------------------------------------------------------------------
	public static trim (__string:string):string {
        return __string.trim ();
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
	public static copyArray (__array:Array<any>):Array<any> {
		return Object.assign ({}, __array);
	}
	
    //------------------------------------------------------------------------------------------
	public static ofEach (__array:Array<any>, __callback:any):void {
        var __key:any;

        for (__key of __array) {
            __callback (__key);
        }
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