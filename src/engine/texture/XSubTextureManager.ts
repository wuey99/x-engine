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
	import { MovieClipMetadata } from './MovieClipMetaData';

	//------------------------------------------------------------------------------------------
	// this class takes one or more PIXI.AnimatedSprite's and dynamically creates texture/atlases
	//------------------------------------------------------------------------------------------
	export class XSubTextureManager {
		public m_XApp:XApp;
		
		public TEXTURE_WIDTH:number = 2048;
		public TEXTURE_HEIGHT:number = 2048;
			
		public m_queue:Map<string, Array<any>>;
		
		public m_count:number;
		
		public m_movieClips:Map<String, MovieClipMetadata>;
		
		public m_testers:Array<MaxRectPacker>;
		public m_packers:Array<MaxRectPacker>;
		public m_renderTextures:Array<PIXI.RenderTexture>;
		
		public m_currentTester:MaxRectPacker;
		public m_currentPacker:MaxRectPacker;

		public m_currentContainer:PIXI.Container;
		public m_currentContainerIndex:number;
		
		public wrapFlag:boolean;
		
		//------------------------------------------------------------------------------------------
		public constructor (__XApp:XApp, __width:number=2048, __height:number=2048) {
			this.m_XApp = __XApp;
			
			this.TEXTURE_WIDTH = __width;
			this.TEXTURE_HEIGHT = __height;
			
		    this.m_count = 0;
			
			this.m_queue = new Map<string, Array<any>> ();
			
			this.wrapFlag = true;

			this.m_XApp.getXTaskManager ().addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
				
					() => {
						XType.forEach (this.m_queue, 
							(x:any) => {
								var __className:string = x as string;
								var __queuedData:Array<any> = this.m_queue.get (x);

								var __type:string = __queuedData[0];
								var __srcData:PIXI.Spritesheet | Array<PIXI.Texture> = null;
								var __anchorPoint:PIXI.Point = __queuedData[2];
								var __animatedSprite:PIXI.AnimatedSprite = null;

								if (__queuedData != null) {
									this.createTexture (
										__className,		
										__type,
										__srcData,
										__anchorPoint
									);
								
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
		/*
		public parseAnchorPointFromSpritesheet (__spriteSheet:PIXI.Spritesheet):PIXI.Point {
			var __frames:any = __spriteSheet.data.frames;

			for (var __frame in __frames) {
				var __anchor:any = __frames[__frame].anchor;

				return new PIXI.Point (__anchor.x, __anchor.y);
			}

			return null;
		}
		*/

		//------------------------------------------------------------------------------------------
		public getTextureArray (__imageList:Array<string>):Array<PIXI.Texture> {
			var __textureArray:Array<PIXI.Texture> = new Array<PIXI.Texture> ();

			var i:number = 0;

			for (i = 0; i < __imageList.length; i++) {
				if (this.m_XApp.getClass (__imageList[i]) == null) {
					return __textureArray;
				}
			}

			for (i = 0; i < __imageList.length; i++) {
				__textureArray.push (this.m_XApp.getClass (__imageList[i]));
			}

			return __textureArray;
		}

		//------------------------------------------------------------------------------------------
		public reset ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public start ():void {
			this.reset ();
			
			this.m_movieClips = new Map<string, MovieClipMetadata> (); 
			this.m_testers = new Array<MaxRectPacker> ();
			this.m_packers = new Array<MaxRectPacker> ()
			this.m_renderTextures = new Array<PIXI.RenderTexture> ();
			
			this.__begin ();
		}
		 
		//------------------------------------------------------------------------------------------
		public finish ():void {
			if (!this.wrapFlag) {
				this.__finishFit ();
			} else {
				this.__finishWrap ();
			}
		}

		//------------------------------------------------------------------------------------------
		public __finishFit ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public __finishWrap ():void {
		}

		//------------------------------------------------------------------------------------------
		public addFromSpritesheet (__className:string):void {	
		}	

		//------------------------------------------------------------------------------------------
		public addFromImages (__className:string, __imageList:Array<string>, __anchorPoint:PIXI.Point):void {
		}

		//------------------------------------------------------------------------------------------		
		public isQueued (__className:string):boolean {
			return this.m_movieClips.has (__className);
		}
		
		//------------------------------------------------------------------------------------------
		public movieClipExists (__className:string):boolean {
			if (this.m_movieClips.has (__className)) {
				return true;
			} else {
				return false;
			}
		}

		//------------------------------------------------------------------------------------------
		public createTexture (
			__className:string,
			__type:string,
			__srcData:PIXI.Spritesheet | Array<PIXI.Texture>,
			__anchorPoint:PIXI.Point
			):void {

			if (!this.wrapFlag) {
				this.__createTextureFit (__className, __type, __srcData, __anchorPoint);	
			} else {
				this.__createTextureWrap (__className, __type, __srcData, __anchorPoint);
			}
		}

		//------------------------------------------------------------------------------------------
		public createAnimatedSprite (__className:string):PIXI.AnimatedSprite {
			if (!this.isQueued (__className)) {
				return null;
			}
			
			var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
			var __anchorPoint:PIXI.Point = __movieClipMetadata.getAnchorPoint ();

			var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (__movieClipMetadata.getFrameRenderTextures ());
			__animatedSprite.anchor.set (__anchorPoint.x, __anchorPoint.y);

			return __animatedSprite;
		}

		//------------------------------------------------------------------------------------------
		public findFreeTexture (__animatedSprite:PIXI.AnimatedSprite):number {
			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle = null;
			
			var __free:boolean;
			
			var __index:number;
			
			for (__index = 0; __index < this.m_count; __index++) {
				var __tester:MaxRectPacker = this.m_testers[__index] as MaxRectPacker;
				var __packer:MaxRectPacker = this.m_packers[__index] as MaxRectPacker;
				
				__tester.copyFrom (__packer.freeRectangles);
			
				__free = true;
				
				var i:number = 0;
				
				while (i < __animatedSprite.totalFrames && __free) {
					__animatedSprite.gotoAndStop (i);
					
					__realBounds = this.__getRealBounds (__animatedSprite);
					
					__rect = __tester.quickInsert (
						(__realBounds.width * __scaleX) + __padding * 2, (__realBounds.height * __scaleY) + __padding * 2
					);
					
					if (__rect == null) {
						__free = false;
					}
					
					i++;
				}
				
				if (__free) {
					return __index;
				}
			}
			
			this.__end (); this.__begin ();
			
			return this.m_count - 1;
		}

		//------------------------------------------------------------------------------------------
		public __createTextureFit (
			__className:string,
			__type:string,
			__srcData:PIXI.Spritesheet | Array<PIXI.Texture>,
			__anchorPoint:PIXI.Point
			):void {	
		}	
		
		//------------------------------------------------------------------------------------------
		public __createTextureWrap (
			__className:string,
			__type:string,
			__srcData:PIXI.Spritesheet | Array<PIXI.Texture>,
			__anchorPoint:PIXI.Point
			):void {	
		}

		//------------------------------------------------------------------------------------------
		public __begin ():void {
			var __tester:MaxRectPacker = new MaxRectPacker (this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);			
			var __packer:MaxRectPacker = new MaxRectPacker (this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);

			this.m_testers[this.m_count] = __tester;
			this.m_packers[this.m_count] = __packer;
			
			this.m_count++;
		}
		
		//------------------------------------------------------------------------------------------
		public __end ():void {	
		}
		
		//------------------------------------------------------------------------------------------
		public __getRealBounds (clip:PIXI.AnimatedSprite):PIXI.Rectangle {
            return clip.getBounds ();
		}
		
	//------------------------------------------------------------------------------------------
	}
				
//------------------------------------------------------------------------------------------
// }
