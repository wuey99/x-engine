//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014 Jimmy Huey (wuey99@gmail.com)
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
    import { XApp } from "../app/XApp";
    import { Resource} from '../resource/Resource';
    import { XTask } from '../task/XTask';
    import { XType } from '../type/XType';
    import { MaxRectPacker } from './MaxRectPacker';

	//------------------------------------------------------------------------------------------
	// this class takes one or more PIXI.AnimatedSprite's and dynamically creates texture/atlases
	//------------------------------------------------------------------------------------------
	export class XSubTextureManager {
		public m_XApp:XApp;
		
		public TEXTURE_WIDTH:number = 2048;
		public TEXTURE_HEIGHT:number = 2048;
			
		public m_queue:Map<string, number>;
		
		public m_count:number;
		
		//------------------------------------------------------------------------------------------
		public constructor (__XApp:XApp, __width:number=2048, __height:number=2048) {
			this.m_XApp = __XApp;
			
			this.TEXTURE_WIDTH = __width;
			this.TEXTURE_HEIGHT = __height;
			
		    this.m_count = 0;
			
			this.m_queue = new Map<string, number> ();
			
			this.m_XApp.getXTaskManager ().addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
				
					() => {
						XType.forEach (this.m_queue, 
							(x:any) => {
								var __className:string = x as string;
								var __class:any = this.m_XApp.getResourceByName (__className);
							
								if (__class != null) {
									this.createTexture (__className, __class);
								
									this.m_queue.delete (__className);
								
									// this.m_XApp.unloadClass (__className);
								}
							}
						);
					},
						
					XTask.GOTO, "loop",
						
				XTask.RETN,
			]);
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.reset ();
		}

		//------------------------------------------------------------------------------------------
		public reset ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public start ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public finish ():void {
		}

		//------------------------------------------------------------------------------------------
		public isDynamic ():boolean {
			return false;	
		}
		
		//------------------------------------------------------------------------------------------
		public add (__className:string):void {	
		}	

		//------------------------------------------------------------------------------------------
		public isQueued (__className:string):boolean {
			return false;
		}
		
		//------------------------------------------------------------------------------------------
		public movieClipExists (__className:string):boolean {
			return false;
		}
		
		//------------------------------------------------------------------------------------------
		public createTexture (__className:String, __class:any):void {	
		}
		
		//------------------------------------------------------------------------------------------
		public createAnimatedSprite (__className:string):any {
			return null;
		}

		//------------------------------------------------------------------------------------------
		public __begin ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public __end ():void {	
		}

		//------------------------------------------------------------------------------------------
		public __generateIndex (__index:number):string {
			var __indexString:string = "" + __index; // TODO
			
			switch (__indexString.length) {
				case 1:
					return "00" + __indexString;
					// break;
				case 2:
					return "0" + __indexString;
					// break;
				case 3:
					return __indexString;
					// break;
			}
			
			return __indexString;
		}
		
		//------------------------------------------------------------------------------------------
		public __getRealBounds(clip:PIXI.AnimatedSprite):PIXI.Rectangle {
            return clip.getBounds ();
		}
		
	//------------------------------------------------------------------------------------------
	}
				
//------------------------------------------------------------------------------------------
// }
