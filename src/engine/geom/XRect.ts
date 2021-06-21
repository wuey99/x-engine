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
import * as PIXI from 'pixi.js-legacy'
import { XPoint } from './XPoint';

//------------------------------------------------------------------------------------------
	export class XRect extends PIXI.Rectangle {
		
//------------------------------------------------------------------------------------------
		constructor (__x:number = 0, __y:number = 0, __width:number = 0, __height:number = 0) {
			super (__x, __y, __width, __height);
		}	

//------------------------------------------------------------------------------------------
		public setRect (__x:number, __y:number, __width:number, __height:number):void {
			this.x = __x;
			this.y = __y;
			this.width = __width;
			this.height = __height;
		}
		
//------------------------------------------------------------------------------------------
		public cloneX ():XRect {
			var __rect:PIXI.Rectangle = this.clone ();
			
			return new XRect (__rect.x, __rect.y, __rect.width, __rect.height);
		}

//------------------------------------------------------------------------------------------
		public copy2 (__rect:XRect):void {
			__rect.x = this.x;
			__rect.y = this.y;
			__rect.width = this.width;
			__rect.height = this.height;
		}

//------------------------------------------------------------------------------------------
        public intersects (__rect:XRect):boolean {
            if (this.right < __rect.left) {
                return false;
            }

            if (this.bottom < __rect.top) {
                return false;
            }

            if (this.left > __rect.right) {
                return false;
            }

            if (this.top > __rect.bottom) {
                return false;
            }
            
            return true;
        }

//------------------------------------------------------------------------------------------
        public offsetPoint (__point:XPoint):void {
            this.x += __point.x;
            this.y += __point.y;
        }

//------------------------------------------------------------------------------------------
		public getRectangle ():PIXI.Rectangle {
			return this as PIXI.Rectangle;
		}
		
//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
// }
