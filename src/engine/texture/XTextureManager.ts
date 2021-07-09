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
	import { XSubTextureManager } from './XSubTextureManager';
    import { XRenderSubTextureManager } from './XRenderSubTextureManager';

	//------------------------------------------------------------------------------------------
	// this class manages XSubMovieClipCacheManagers
	//------------------------------------------------------------------------------------------
	export class XTextureManager {
		private m_XApp:XApp;
		
		private m_subManagers:Map<String, XSubTextureManager>;
			
		//------------------------------------------------------------------------------------------
		public constructor (__XApp:XApp) {
			this.m_XApp = __XApp;
			
			this.m_subManagers = new Map<String, XSubTextureManager> ();
		}

		//------------------------------------------------------------------------------------------
		public setup ():void {	
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}

		//------------------------------------------------------------------------------------------
		public createSubManager (__name:String, __width:number=2048, __height:number=2048):XSubTextureManager {
			var __subManager:XSubTextureManager = new XRenderSubTextureManager (this.m_XApp, __width, __height);
			this.m_subManagers.set (__name, __subManager);
			
			return __subManager;
		}
		
		//------------------------------------------------------------------------------------------
		public removeSubManager (__name:String):void {	
			if (this.m_subManagers.has (__name)) {
				var __subManager:XSubTextureManager = this.m_subManagers.get (__name);
				__subManager.cleanup ();
			
				this.m_subManagers.delete (__name);
			}
		}

		//------------------------------------------------------------------------------------------
		public getSubManager (__name:string):XSubTextureManager {
			return this.m_subManagers.get (__name);
		}
		
		//------------------------------------------------------------------------------------------
		// TODO: figure out a better way of deciding which dynamic texture manager to use
		// to create the MovieClip to.  Currently, it'll always use the first one.  It might
		// make sense to only support one dynamic texture manager?
		//------------------------------------------------------------------------------------------
		public createAnimatedSprite (__className:string):PIXI.AnimatedSprite {
			var __animatedSprite:PIXI.AnimatedSprite = null;
	
			XType.forEach (this.m_subManagers,
                (__key__:any) => {
					if (__animatedSprite == null) {
						var __subManager:XSubTextureManager = this.m_subManagers.get (__key__);
						
						__animatedSprite = __subManager.createAnimatedSprite (__className);
					}
                }
			);
		
			return __animatedSprite;
		}
		
	//------------------------------------------------------------------------------------------
	}
				
//------------------------------------------------------------------------------------------
// }
