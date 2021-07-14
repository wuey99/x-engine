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
	import { MovieClipMetadata } from './MovieClipMetaData';

	//------------------------------------------------------------------------------------------
	// this class takes one or more PIXI.AnimatedSprite's and dynamically creates combined RenderTextures
	//------------------------------------------------------------------------------------------
	export class XAnimatedSpriteSubTextureManager extends XSubTextureManager {
		private m_movieClips:Map<String, MovieClipMetadata>;
		
		private m_testers:Array<MaxRectPacker>;
		private m_packers:Array<MaxRectPacker>;
		private m_renderTextures:Array<PIXI.RenderTexture>;
		
		private m_currentTester:MaxRectPacker;
		private m_currentPacker:MaxRectPacker;

		private m_currentContainer:PIXI.Container;
		private m_currentContainerIndex:number;
		
		private wrapFlag:boolean;
		
		//------------------------------------------------------------------------------------------
		public constructor (__XApp:XApp, __width:number=2048, __height:number=2048) {
			super (__XApp, __width, __height);
			
			this.wrapFlag = true;
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
		private __destroyAnimatedSprites (__animatedSprites:Array<PIXI.AnimatedSprite>):void {
			var __animatedSprite:PIXI.AnimatedSprite;

			for (__animatedSprite of __animatedSprites) {
				__animatedSprite.destroy ();
			}
		}

		//------------------------------------------------------------------------------------------
		private __finishFit ():void {
			this.__end ();
			
			var i:number;
			
			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle;
			
			var __index:number;
			var __spriteSheet:PIXI.Spritesheet;
			var __animatedSprite:PIXI.AnimatedSprite;
			
			//------------------------------------------------------------------------------------------
			for (this.m_currentContainerIndex = 0; this.m_currentContainerIndex < this.m_count; this.m_currentContainerIndex++) {
				__rect = new PIXI.Rectangle (0, 0, this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);
				
				this.m_currentContainer = new PIXI.Container ();

				var __animatedSprites:Array<PIXI.AnimatedSprite> = [];

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:string = x as string;
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__spriteSheet = __movieClipMetadata.getSpritesheet ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						if (__index == this.m_currentContainerIndex) {
							for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++) {
								__animatedSprite = new PIXI.AnimatedSprite (__spriteSheet.animations["root"]);
								__animatedSprites.push (__animatedSprite);
								__animatedSprite.gotoAndStop (i);
								__rect = __movieClipMetadata.getRect (i);
								this.m_currentContainer.addChild (__animatedSprite);
								__animatedSprite.x = __rect.x - __realBounds.x;
								__animatedSprite.y = __rect.y - __realBounds.y;
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
				var __tileset:PIXI.RenderTexture = PIXI.RenderTexture.create ({width: this.TEXTURE_WIDTH, height: this.TEXTURE_HEIGHT});
				this.m_XApp.getRenderer ().render (this.m_currentContainer, __tileset);
				this.m_renderTextures.push (__tileset);

				this.__destroyAnimatedSprites (__animatedSprites);

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:string = x as string;
						
						// trace (": ===================================================: ");
						// trace (": finishing: ", __className);
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						if (__index == this.m_currentContainerIndex) {
							__movieClipMetadata.setMasterRenderTexture(__tileset);
							
							for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++) {
								__rect = __movieClipMetadata.getRect (i);

								var __renderTexture:PIXI.RenderTexture = new PIXI.RenderTexture (
									__tileset.baseTexture as PIXI.BaseRenderTexture,
									__rect
								);

								__movieClipMetadata.setFrameTexture (i, __renderTexture);
								__movieClipMetadata.setRenderTexture (i, __tileset);
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
//				m_currentContainer.dispose ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		private __finishWrap ():void {
			this.__end ();
			
			var i:number;
			
			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle;
			
			var __index:number;
			var __spriteSheet:PIXI.Spritesheet;
			var __animatedSprite:PIXI.AnimatedSprite;
			
			//------------------------------------------------------------------------------------------
			for (this.m_currentContainerIndex = 0; this.m_currentContainerIndex < this.m_count; this.m_currentContainerIndex++) {
				__rect = new PIXI.Rectangle (0, 0, this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);

				this.m_currentContainer = new PIXI.Container ();

				var __animatedSprites:Array<PIXI.AnimatedSprite> = [];

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:string = x as string;

						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__spriteSheet = __movieClipMetadata.getSpritesheet ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++) {
							__index = __movieClipMetadata.getRenderTextureIndex (i);

							if (__index == this.m_currentContainerIndex) {
								__animatedSprite = new PIXI.AnimatedSprite (__spriteSheet.animations["root"]);
								__animatedSprites.push (__animatedSprite);
								__animatedSprite.gotoAndStop (i);
								__rect = __movieClipMetadata.getRect (i);
								this.m_currentContainer.addChild (__animatedSprite);
								__animatedSprite.x = __rect.x - __realBounds.x;
								__animatedSprite.y = __rect.y - __realBounds.y;
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
				var __tileset:PIXI.RenderTexture = PIXI.RenderTexture.create ({width: this.TEXTURE_WIDTH, height: this.TEXTURE_HEIGHT});
				this.m_XApp.getRenderer ().render (this.m_currentContainer, __tileset);
				this.m_renderTextures.push (__tileset);

				this.__destroyAnimatedSprites (__animatedSprites);

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:string = x as string;
						
						// trace (": ===================================================: ");
						// trace (": finishing: ", __className);
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++ ) {
							__index = __movieClipMetadata.getRenderTextureIndex (i);
							
							if (__index == this.m_currentContainerIndex) {
								__rect = __movieClipMetadata.getRect (i);

								var __renderTexture:PIXI.RenderTexture = new PIXI.RenderTexture (
									__tileset.baseTexture as PIXI.BaseRenderTexture,
									__rect
								);

								__movieClipMetadata.setFrameTexture (i, __renderTexture);
								__movieClipMetadata.setRenderTexture (i, __tileset);
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
				// m_currentContainer.dispose ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		public isDynamic ():boolean {
			return false;	
		}
		
		//------------------------------------------------------------------------------------------
		public add (__className:string):void {
			var __class:any = this.m_XApp.getClass (__className);
			
			this.m_movieClips.set (__className, null);
			
			if (__class != null) {
				this.createTexture (__className, __class);
				
				// this.m_XApp.unloadClass (__className);
			}
			else
			{
				this.m_queue.set (__className, 0);
			}
		}
		
		//------------------------------------------------------------------------------------------		
		public isQueued (__className:string):boolean {
			return this.m_movieClips.has (__className);
		}
		
		//------------------------------------------------------------------------------------------
		public movieClipExists (__className:string):boolean {
			if (this.m_movieClips.has (__className)) {
				return true;
			}
			else
			{
				return false;
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
		private findFreeTexture (__animatedSprite:PIXI.AnimatedSprite):number {
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
		public createTexture (__className:string, __class:any):void {	
			if (!this.wrapFlag) {
				this.__createTextureFit (__className, __class);	
			} else {
				this.__createTextureWrap (__className, __class);
			}
		}

		//------------------------------------------------------------------------------------------
		private __parseAnchorPoint (__spriteSheet:PIXI.Spritesheet):PIXI.Point {
			var __frames:any = __spriteSheet.data.frames;

			for (var __frame in __frames) {
				console.log (": frame: ", __frames[__frame].anchor);

				var __anchor:any = __frames[__frame].anchor;

				return new PIXI.Point (__anchor.x, __anchor.y);
			}

			return null;
		}
		
		//------------------------------------------------------------------------------------------
		private __createTextureFit (__className:string, __class:any):void {	
			var __spriteSheet:PIXI.Spritesheet = __class as PIXI.Spritesheet;
			var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (__spriteSheet.animations["root"]);

			var __anchorPoint:PIXI.Point = this.__parseAnchorPoint (__spriteSheet);

			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle = null;

			var i:number;
			
			// trace (": XTileSubTextureManager: totalFrames: ", __className, __movieClip.totalFrames);
			
			var __index:number = this.findFreeTexture (__animatedSprite);
			
			this.m_currentPacker = this.m_packers[__index] as MaxRectPacker;
			
			var __movieClipMetadata:MovieClipMetadata = new MovieClipMetadata ();
			__movieClipMetadata.setup (
				__index,					// TilesetIndex
				null,						// Tileset
				__spriteSheet,				// Spritesheet
				__animatedSprite.totalFrames,	// totalFrames
				__realBounds,				// realBounds
				__anchorPoint				// anchorPoint
				);
			
			for (var i = 0; i < __animatedSprite.totalFrames; i++) {
				__animatedSprite.gotoAndStop (i);
				
				// trace (": getBounds: ", __className, __getRealBounds (__movieClip));
				
				__realBounds = this.__getRealBounds (__animatedSprite);
				
				__rect = this.m_currentPacker.quickInsert (
					(__realBounds.width * __scaleX) + __padding * 2, (__realBounds.height * __scaleY) + __padding * 2
				);
				
				__rect.x += __padding;
				__rect.y += __padding;
				__rect.width -= __padding * 2;
				__rect.height -= __padding * 2;
				
				// trace (": rect: ", __rect);
				
				__movieClipMetadata.addFrameTexture (null, __index, __rect);
			}
			
			__movieClipMetadata.setRealBounds (__realBounds);
			
			this.m_movieClips.set (__className, __movieClipMetadata);

			__animatedSprite.destroy ();
		}	
		
		//------------------------------------------------------------------------------------------
		private __createTextureWrap (__className:string, __class:any):void {	
			var __spriteSheet:PIXI.Spritesheet = __class as PIXI.Spritesheet;
			var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (__spriteSheet.animations["root"]);

			var __anchorPoint:PIXI.Point = this.__parseAnchorPoint (__spriteSheet);
			
			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle = null;
			
			var i:number;
			
			// trace (": XTileSubTextureManager: totalFrames: ", __className, __movieClip.totalFrames);
			
			var __index:number = this.m_count - 1;
			
			this.m_currentPacker = this.m_packers[__index] as MaxRectPacker;
			
			var __movieClipMetadata:MovieClipMetadata = new MovieClipMetadata ();
			__movieClipMetadata.setup (
				__index,					// TilesetIndex
				null,						// Tileset
				__spriteSheet,				// Spritesheet
				__animatedSprite.totalFrames,	// totalFrames
				__realBounds,				// realBounds
				__anchorPoint				// anchorPoint
			);
			
			for (var i = 0; i < __animatedSprite.totalFrames; i++) {
				__animatedSprite.gotoAndStop (i);
				
				// trace (": getBounds: ", __className, __getRealBounds (__movieClip));
				
				__realBounds = this.__getRealBounds (__animatedSprite);
				
				__rect = this.m_currentPacker.quickInsert (
					(__realBounds.width * __scaleX) + __padding * 2, (__realBounds.height * __scaleY) + __padding * 2
				);
				
				if (__rect == null) {
					// trace (": split @: ", m_count, __className, i);
					
					this.__end (); this.__begin ();
					
					__index = this.m_count - 1;
					
					this.m_currentPacker = this.m_packers[__index] as MaxRectPacker;
					
					__rect = this.m_currentPacker.quickInsert (
						(__realBounds.width * __scaleX) + __padding * 2, (__realBounds.height * __scaleY) + __padding * 2
					);
				}
				
				__rect.x += __padding;
				__rect.y += __padding;
				__rect.width -= __padding * 2;
				__rect.height -= __padding * 2;
				
				// trace (": rect: ", __rect);
				
				__movieClipMetadata.addFrameTexture (null, __index, __rect);
			}
			
			__movieClipMetadata.setRealBounds (__realBounds);
			
			this.m_movieClips.set (__className, __movieClipMetadata);

			__animatedSprite.destroy ();
		}	
		
		//------------------------------------------------------------------------------------------
		public __begin ():void {
			var __tester:MaxRectPacker = new MaxRectPacker (this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);			
			var __packer:MaxRectPacker = new MaxRectPacker (this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);

			this.m_testers[this.m_count] = __tester;
			this.m_packers[this.m_count] = __packer;
			
			this.m_count++;
			
			// trace (": XTileSubTextureManager: count: ", m_count);
		}
		
		//------------------------------------------------------------------------------------------
		public __end ():void {	
		}
		
	//------------------------------------------------------------------------------------------
	}
				
//------------------------------------------------------------------------------------------
// }
