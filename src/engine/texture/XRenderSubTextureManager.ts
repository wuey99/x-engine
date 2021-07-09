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
	// this class takes one or more PIXI.AnimatedSprite's and dynamically creates HaXe/OpenFl texture/atlases
	//------------------------------------------------------------------------------------------
	export class XRenderSubTextureManager extends XSubTextureManager {
		private m_movieClips:Map<String, MovieClipMetadata>;
		
		private m_testers:Array<MaxRectPacker>;
		private m_packers:Array<MaxRectPacker>;
		private m_renderTextures:Array<PIXI.RenderTexture>;
		
		private m_currentTester:MaxRectPacker;
		private m_currentPacker:MaxRectPacker;
		private m_currentBitmap:PIXI.Container;
		private m_currentBitmapIndex:number;
		
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
			}
			else
			{
				this.__finishWrap ();
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
			var __movieClip:PIXI.AnimatedSprite;
			
			//------------------------------------------------------------------------------------------
			for (this.m_currentBitmapIndex = 0; this.m_currentBitmapIndex < this.m_count; this.m_currentBitmapIndex++) {
				__rect = new PIXI.Rectangle (0, 0, this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);

				/* TODO
				m_currentBitmap = new BitmapData (TEXTURE_WIDTH, TEXTURE_HEIGHT);
				m_currentBitmap.fillRect (__rect, 0x00000000);
				*/

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:String = x as string;
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__movieClip = __movieClipMetadata.getAnimatedSprite ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						if (__index == this.m_currentBitmapIndex) {
							for (var i = 0; i < __movieClip.totalFrames; i++) {
								__movieClip.gotoAndStop (i+1);
								__rect = __movieClipMetadata.getRect (i);
								/* TODO
								var __matrix:Matrix = new Matrix ();
								__matrix.scale (__scaleX, __scaleY);
								__matrix.translate (__rect.x - __realBounds.x, __rect.y - __realBounds.y);
								m_currentBitmap.draw (__movieClip, __matrix);
								*/
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
				/* TODO
				var __tileset:Tileset = new Tileset (m_currentBitmap);
				var __tileId:Int;

				this.m_renderTextures.push (__tileset);
				*/

				var __tileSet:PIXI.RenderTexture = null;

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:String = x as string;
						
						// trace (": ===================================================: ");
						// trace (": finishing: ", __className);
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__movieClip = __movieClipMetadata.getAnimatedSprite ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						// trace (": index: ", __index);
						// trace (": tileset: ", __tileset);
						// trace (": movieClip: ", __movieClip);
						// trace (": realBounds: ", __realBounds);
						
						if (__index == this.m_currentBitmapIndex) {
							__movieClipMetadata.setMasterRenderTexture(__tileset);
							
							for (var i = 0; i < __movieClip.totalFrames; i++) {
								__rect = __movieClipMetadata.getRect (i);
								/* TODO
								__tileId = __tileset.addRect (__rect);
								__movieClipMetadata.setTileId (i, __tileId);
								__movieClipMetadata.setTileset (i, __tileset);
								*/
								
								// trace (":    frame: ", i);
								// trace (":    tileId: ", __tileId);
								// trace (":    rect: ", __rect);
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
//				m_currentBitmap.dispose ();
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
			var __movieClip:PIXI.AnimatedSprite;
			
			//------------------------------------------------------------------------------------------
			for (this.m_currentBitmapIndex = 0; this.m_currentBitmapIndex < this.m_count; this.m_currentBitmapIndex++) {
				__rect = new PIXI.Rectangle (0, 0, this.TEXTURE_WIDTH, this.TEXTURE_HEIGHT);
				/* TODO
				m_currentBitmap = new BitmapData (TEXTURE_WIDTH, TEXTURE_HEIGHT);
				m_currentBitmap.fillRect (__rect, 0x00000000);
				*/

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:String = x as string;
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__movieClip = __movieClipMetadata.getAnimatedSprite ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						for (var i = 0; i < __movieClip.totalFrames; i++) {
							__index = __movieClipMetadata.getRenderTextureIndex (i);
							
							if (__index == this.m_currentBitmapIndex) {
								__movieClip.gotoAndStop (i+1);
								__rect = __movieClipMetadata.getRect (i);
								/* TODO
								var __matrix:Matrix = new Matrix ();
								__matrix.scale (__scaleX, __scaleY);
								__matrix.translate (__rect.x - __realBounds.x, __rect.y - __realBounds.y);
								m_currentBitmap.draw (__movieClip, __matrix);
								*/
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
				/* TODO
				var __tileset:Tileset = new Tileset (m_currentBitmap);
				var __tileId:Int;
				
				m_tilesets.push (__tileset);
				*/

				var __tileset:PIXI.RenderTexture;

				//------------------------------------------------------------------------------------------
				XType.forEach (this.m_movieClips, 
					(x:any) => {
						var __className:String = x as string;
						
						// trace (": ===================================================: ");
						// trace (": finishing: ", __className);
						
						var __movieClipMetadata:MovieClipMetadata = this.m_movieClips.get (__className);
						
						__index = __movieClipMetadata.getMasterRenderTextureIndex ();
						__movieClip = __movieClipMetadata.getAnimatedSprite ();
						__realBounds = __movieClipMetadata.getRealBounds ();
						
						// trace (": index: ", __index);
						// trace (": tileset: ", __tileset);
						// trace (": movieClip: ", __movieClip);
						// trace (": realBounds: ", __realBounds);
						
						for (var i = 0; i < __movieClip.totalFrames; i++ ) {
							__index = __movieClipMetadata.getRenderTextureIndex (i);
							
							if (__index == this.m_currentBitmapIndex) {
								__rect = __movieClipMetadata.getRect (i);
								/* TODO
								__tileId = __tileset.addRect (__rect);
								__movieClipMetadata.setTileId (i, __tileId);
								__movieClipMetadata.setTileset (i, __tileset);
								*/

								// trace (":    frame: ", i);
								// trace (":    tileId: ", __tileId);
								// trace (":    rect: ", __rect);
							}
						}
					}
				);	
				
				//------------------------------------------------------------------------------------------
				// m_currentBitmap.dispose ();
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
				
				this.m_XApp.unloadClass (__className);
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
			
			/* TODO
			var __tileset:Tileset = __movieClipMetadata.getMasterTileset ();
			*/
			var __tileSet:PIXI.RenderTexture = __movieClipMetadata.getMasterRenderTexture ();
			var __frames:number = __movieClipMetadata.getTotalFrames ();
			var __realBounds:PIXI.Rectangle = __movieClipMetadata.getRealBounds ();
			
			/* TODO
			var __tilemap:Tilemap = new Tilemap (Std.int (__realBounds.width), Std.int (__realBounds.height));
			if (!wrapFlag) {
				__tilemap.tileset = __tileset;
			}
			
			var i:Int;
			
			var __tileId:Int;
			var __tile:Tile;
			var __rect:Rectangle;
			
			for (i in 0 ... __frames) {
				__tileset = __movieClipMetadata.getTileset (i);
				__rect = __movieClipMetadata.getRect (i);
				__tileId = __movieClipMetadata.getTileId (i);
				
//				__tile = new Tile (0, 0, 0, 1.0, 1.0, 0.0);				
				__tile = cast m_XApp.getTilePoolManager ().borrowObject ();
				__tile.id = __tileId;
				
				__tile.x = 0;
				__tile.y = 0;
				
				if (wrapFlag) {
					__tile.tileset = __tileset;
				}
				
				__tilemap.addTileAt (__tile, i);
			}
			
			__tilemap.x = __realBounds.x;
			__tilemap.y = __realBounds.y;
			
			return __tilemap;
			*/

			return null;
		}

		//------------------------------------------------------------------------------------------
		private findFreeTexture (__movieClip:PIXI.AnimatedSprite):number {
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
				
				while (i < __movieClip.totalFrames && __free) {
					__movieClip.gotoAndStop (i+1);
					
					__realBounds = this.__getRealBounds (__movieClip);
					
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
		public createTexture (__className:String, __class:any):void {	
			if (!this.wrapFlag) {
				this.__createTextureFit (__className, __class);	
			}
			else
			{
				this.__createTextureWrap (__className, __class);
			}
		}
		
		//------------------------------------------------------------------------------------------
		private __createTextureFit (__className:String, __class:any):void {	
			// TODO
			var __movieClip:PIXI.AnimatedSprite = XType.createInstance (__class);
			
			var __scaleX:number = 1.0;
			var __scaleY:number = 1.0;
			var __padding:number = 2.0;
			var __rect:PIXI.Rectangle = null;
			var __realBounds:PIXI.Rectangle = null;

			var i:number;
			
			// trace (": XTileSubTextureManager: totalFrames: ", __className, __movieClip.totalFrames);
			
			var __index:number = this.findFreeTexture (__movieClip);
			
			this.m_currentPacker = this.m_packers[__index] as MaxRectPacker;
			
			var __movieClipMetadata:MovieClipMetadata = new MovieClipMetadata ();
			__movieClipMetadata.setup (
				__index,					// TilesetIndex
				null,						// Tileset
				__movieClip,				// MovieClip
				__movieClip.totalFrames,	// totalFrames
				__realBounds				// realBounds
				);
			
			for (var i = 0; i < __movieClip.totalFrames; i++) {
				__movieClip.gotoAndStop (i+1);
				
				// trace (": getBounds: ", __className, __getRealBounds (__movieClip));
				
				__realBounds = this.__getRealBounds (__movieClip);
				
				__rect = this.m_currentPacker.quickInsert (
					(__realBounds.width * __scaleX) + __padding * 2, (__realBounds.height * __scaleY) + __padding * 2
				);
				
				__rect.x += __padding;
				__rect.y += __padding;
				__rect.width -= __padding * 2;
				__rect.height -= __padding * 2;
				
				// trace (": rect: ", __rect);
				
				__movieClipMetadata.addTile (0, __index, __rect);
			}
			
			__movieClipMetadata.setRealBounds (__realBounds);
			
			this.m_movieClips.set (__className, __movieClipMetadata);
		}	
		
		//------------------------------------------------------------------------------------------
		private __createTextureWrap (__className:String, __class:any):void {	
			// TODO
			var __movieClip:PIXI.AnimatedSprite = XType.createInstance (__class);
			
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
				__movieClip,				// MovieClip
				__movieClip.totalFrames,	// totalFrames
				__realBounds				// realBounds
			);
			
			for (var i = 0; i < __movieClip.totalFrames; i++) {
				__movieClip.gotoAndStop (i+1);
				
				// trace (": getBounds: ", __className, __getRealBounds (__movieClip));
				
				__realBounds = this.__getRealBounds (__movieClip);
				
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
				
				__movieClipMetadata.addTile (0, __index, __rect);
			}
			
			__movieClipMetadata.setRealBounds (__realBounds);
			
			this.m_movieClips.set (__className, __movieClipMetadata);
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
