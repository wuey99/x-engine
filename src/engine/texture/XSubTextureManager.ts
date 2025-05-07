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
    import * as PIXI from 'pixi.js'
    import { XApp } from "../app/XApp";
    import { Resource} from '../resource/Resource';
    import { XTask } from '../task/XTask';
    import { XType } from '../type/XType';
    import { MaxRectPacker } from './MaxRectPacker';
	import { MovieClipMetadata } from './MovieClipMetaData';
	import { XTextureManager } from './XTextureManager';

	//------------------------------------------------------------------------------------------
	// this class takes one or more PIXI.AnimatedSprite's and dynamically creates texture/atlases
	//------------------------------------------------------------------------------------------
	export class XSubTextureManager {
		public m_XApp:XApp;
		
		public TEXTURE_WIDTH:number = 4096;
		public TEXTURE_HEIGHT:number = 4096;
			
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
		public constructor (__XApp:XApp, __width:number=4096, __height:number=4096) {
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
		public getNumRenderTextures ():number {
			return this.m_renderTextures.length;
		}

		//------------------------------------------------------------------------------------------
		public reset ():void {
			var __renderTexture:PIXI.RenderTexture;

			if (this.m_renderTextures != null) {
				for (__renderTexture of this.m_renderTextures) {
					__renderTexture.destroy (true);
				}
			
				this.m_renderTextures.length = 0;
			}
		}
		
		//------------------------------------------------------------------------------------------
		public start ():void {
			this.reset ();
			
			this.m_movieClips = new Map<string, MovieClipMetadata> (); 
			this.m_testers = new Array<MaxRectPacker> ();
			this.m_packers = new Array<MaxRectPacker> ()
			this.m_renderTextures = new Array<PIXI.RenderTexture> ();
			
			this.begin ();
		}
		 
		//------------------------------------------------------------------------------------------
		public destroyAnimatedSprites (__animatedSprites:Array<PIXI.AnimatedSprite>):void {
			var __animatedSprite:PIXI.AnimatedSprite;

			for (__animatedSprite of __animatedSprites) {
				__animatedSprite.destroy ();
			}
		}

		//------------------------------------------------------------------------------------------
		public finish ():void {
			if (!this.wrapFlag) {
				this.finishFit ();
			} else {
				this.finishWrap ();
			}
		}

		//------------------------------------------------------------------------------------------
		public finishFit ():void {
			this.end ();
			
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
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						if (__index == this.m_currentContainerIndex) {
							for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++) {
								__animatedSprite = __movieClipMetadata.createAnimatedSprite ();
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
				this.m_XApp.getRenderer ().render (this.m_currentContainer, {renderTexture: __tileset});
				this.m_renderTextures.push (__tileset);

				this.destroyAnimatedSprites (__animatedSprites);

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
							__movieClipMetadata.setMasterRenderTexture (__tileset);
							
							for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++) {
								__rect = __movieClipMetadata.getRect (i);

								var __renderTexture:PIXI.RenderTexture = new PIXI.RenderTexture (
									{
										source: __tileset.baseTexture as PIXI.TextureSource,
										frame: __rect
									}
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
		public finishWrap ():void {
			this.end ();
			
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
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						for (var i = 0; i < __movieClipMetadata.getTotalFrames (); i++) {
							__index = __movieClipMetadata.getRenderTextureIndex (i);

							if (__index == this.m_currentContainerIndex) {
								__animatedSprite = __movieClipMetadata.createAnimatedSprite ();
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
				this.m_XApp.getRenderer ().render (this.m_currentContainer, {renderTexture: __tileset});
				this.m_renderTextures.push (__tileset);

				this.destroyAnimatedSprites (__animatedSprites);

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
									{
										source: __tileset.baseTexture as PIXI.TextureSource,
										frame: __rect
									}
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
		public addFromSpritesheet (__className:string):void {
			var __spriteSheet:PIXI.Spritesheet = this.m_XApp.getClass (__className);
			
			this.m_movieClips.set (__className, null);
			
			var __type:string = XTextureManager.SPRITESHEET;

			if (__spriteSheet != null) {
				this.createTexture (__className, __type, __spriteSheet, null);
				
				// this.m_XApp.unloadClass (__className);
			} else {
				this.m_queue.set (__className, [__type, __spriteSheet, null]);
			}
		}

		//------------------------------------------------------------------------------------------
		public addFromImageList (__className:string, __imageList:Array<string>, __anchorPoint:PIXI.Point):void {
			var __textureArray:Array<PIXI.Texture> = this.getTextureArray (__imageList);

			this.m_movieClips.set (__className, null);

			var __type:string = XTextureManager.TEXTURELIST;

			if (__textureArray.length > 0) {
				this.createTexture (__className, __type, __textureArray, __anchorPoint);
				
				// this.m_XApp.unloadClass (__className);
			} else {
				this.m_queue.set (__className, [__type, __imageList, __anchorPoint]);
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
				this.createTextureFit (__className, __type, __srcData, __anchorPoint);	
			} else {
				this.createTextureWrap (__className, __type, __srcData, __anchorPoint);
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
		public createParticleFromAnimatedSprite (__className:string, __frame: number):PIXI.Particle {
			if (!this.isQueued (__className)) {
				return null;
			}
			
			var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
			var __anchorPoint:PIXI.Point = __movieClipMetadata.getAnchorPoint ();

			var __particle:PIXI.Particle = new PIXI.Particle (__movieClipMetadata.getFrameRenderTextures ()[__frame - 1]);
            __particle.anchorX = __anchorPoint.x;
			__particle.anchorY = __anchorPoint.y;
			
			return __particle;
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
					
					__realBounds = this.getRealBounds (__animatedSprite);
					
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
			
			this.end (); this.begin ();
			
			return this.m_count - 1;
		}

		//------------------------------------------------------------------------------------------
		public createTextureFit (
			__className:string,
			__type:string,
			__srcData:PIXI.Spritesheet | Array<PIXI.Texture>,
			__anchorPoint:PIXI.Point
			):void {

			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle = null;

			var i:number;
			
			// trace (": XTileSubTextureManager: totalFrames: ", __className, __movieClip.totalFrames);
			
			var __index:number = this.findFreeTexture ( __movieClipMetadata.getAnimatedSprite ());
			
			this.m_currentPacker = this.m_packers[__index] as MaxRectPacker;
			
			var __movieClipMetadata:MovieClipMetadata = new MovieClipMetadata ();
			__movieClipMetadata.setup (
				__index,					// TilesetIndex
				null,						// Tileset
				__type,						// type
				__srcData,					// PIXI.Spritesheet | Array<PIXI.Texture>
				__realBounds,				// realBounds
				__anchorPoint				// anchorPoint
				);
			
			for (var i = 0; i <  __movieClipMetadata.getAnimatedSprite ().totalFrames; i++) {
				__movieClipMetadata.getAnimatedSprite ().gotoAndStop (i);
				
				// trace (": getBounds: ", __className, getRealBounds (__movieClip));
				
				__realBounds = this.getRealBounds (__movieClipMetadata.getAnimatedSprite ());
				
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

			__movieClipMetadata.destroyAnimatedSprite ();
		}	
		
		//------------------------------------------------------------------------------------------
		public createTextureWrap (
			__className:string,
			__type:string,
			__srcData:PIXI.Spritesheet | Array<PIXI.Texture>,
			__anchorPoint:PIXI.Point
			):void {

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
				__type,						// type
				__srcData,					// PIXI.Spritesheet | Array<PIXI.Texture>
				__realBounds,				// realBounds
				__anchorPoint				// anchorPoint
			);
			
			for (var i = 0; i < __movieClipMetadata.getAnimatedSprite ().totalFrames; i++) {
				__movieClipMetadata.getAnimatedSprite ().gotoAndStop (i);
				
				// trace (": getBounds: ", __className, getRealBounds (__movieClip));
				
				__realBounds = this.getRealBounds (__movieClipMetadata.getAnimatedSprite ());
				
				__rect = this.m_currentPacker.quickInsert (
					(__realBounds.width * __scaleX) + __padding * 2, (__realBounds.height * __scaleY) + __padding * 2
				);
				
				if (__rect == null) {
					// trace (": split @: ", m_count, __className, i);
					
					this.end (); this.begin ();
					
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

			__movieClipMetadata.destroyAnimatedSprite ();
		}	

		//------------------------------------------------------------------------------------------
		public begin ():void {
			var __tester:MaxRectPacker = new MaxRectPacker (this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);			
			var __packer:MaxRectPacker = new MaxRectPacker (this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);

			this.m_testers[this.m_count] = __tester;
			this.m_packers[this.m_count] = __packer;
			
			this.m_count++;
		}
		
		//------------------------------------------------------------------------------------------
		public end ():void {	
		}
		
		//------------------------------------------------------------------------------------------
		public getRealBounds (clip:PIXI.AnimatedSprite):PIXI.Rectangle {
            return clip.getBounds ().rectangle;
		}
		
	//------------------------------------------------------------------------------------------
	}
				
//------------------------------------------------------------------------------------------
// }
