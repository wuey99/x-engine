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
    import { XApp } from "../app/XApp";
    import { Resource} from '../resource/Resource';
    import { XTask } from '../task/XTask';
    import { XType } from '../type/XType';
    import { MaxRectPacker } from './MaxRectPacker';
	import { XTextureManager } from './XTextureManager';
	
	//------------------------------------------------------------------------------------------
	// MovieClipMetadata
	//------------------------------------------------------------------------------------------
	export class MovieClipMetadata {
		
		public m_type:string;
		public m_srcRenderTextureIndex:number;
		public m_srcRenderTexture:PIXI.RenderTexture;
		public m_srcData:PIXI.Spritesheet | Array<PIXI.Texture>;
		public m_totalFrames:number;
		public m_realBounds:PIXI.Rectangle;
		public m_anchorPoint:PIXI.Point;
		public m_animatedSprite:PIXI.AnimatedSprite;

		public m_frameRenderTextures:Array<PIXI.RenderTexture>;
		public m_srcRenderTextures:Array<PIXI.RenderTexture>;
		public m_srcRenderTextureIndexes:Array<number>;
		public m_srcRects:Array<PIXI.Rectangle>;

		public m_frameIndex:number;
		
		public static g_XApp:XApp;

		//------------------------------------------------------------------------------------------
		public constructor () {
		}

		//------------------------------------------------------------------------------------------
		public setup (
			__srcRenderTextureIndex:number,
			__srcRenderTexture:PIXI.RenderTexture,
			__type:string,
			__srcData:PIXI.Spritesheet | Array<PIXI.Texture>,
			__realBounds:PIXI.Rectangle,
			__anchorPoint:PIXI.Point
		) {
			this.m_srcRenderTextureIndex = __srcRenderTextureIndex;
			this.m_srcRenderTexture = __srcRenderTexture;
			this.m_type = __type;
			this.m_srcData = __srcData;
			this.m_realBounds = __realBounds;
			this.m_anchorPoint = __anchorPoint;
			
			this.m_frameRenderTextures = new Array<PIXI.RenderTexture> ();
			this.m_srcRenderTextures = new Array<PIXI.RenderTexture> (); 
			this.m_srcRenderTextureIndexes = new Array<number> ();
			this.m_srcRects = new Array<PIXI.Rectangle> (); 
			
			this.m_frameIndex = 0;

			this.createAnimatedSprite ();

			this.m_totalFrames = this.m_animatedSprite.totalFrames;
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup () {	
		}

		//------------------------------------------------------------------------------------------
		public static setXApp (__XApp:XApp):void {
			MovieClipMetadata.g_XApp = __XApp;
		}

		//------------------------------------------------------------------------------------------
		public static getXApp ():XApp {
			return MovieClipMetadata.g_XApp;
		}

		//------------------------------------------------------------------------------------------
		public getMasterRenderTexture ():PIXI.RenderTexture {
			return this.m_srcRenderTexture;
		}
		
		//------------------------------------------------------------------------------------------
		public setMasterRenderTexture (__srcRenderTexture:PIXI.RenderTexture):void {
			this.m_srcRenderTexture = __srcRenderTexture;
		}

		//------------------------------------------------------------------------------------------
		public setRealBounds (__realBounds:PIXI.Rectangle):void {
			this.m_realBounds = __realBounds;
		}
		
		//------------------------------------------------------------------------------------------
		public getRealBounds ():PIXI.Rectangle {
			return this.m_realBounds;
		}
		
		//------------------------------------------------------------------------------------------
		public getAnchorPoint ():PIXI.Point {
			return this.m_anchorPoint;
		}

		//------------------------------------------------------------------------------------------
		public getMasterRenderTextureIndex ():number {
			return this.m_srcRenderTextureIndex;
		}
		
		//------------------------------------------------------------------------------------------
		public getType ():string {
			return this.m_type;
		}

		//------------------------------------------------------------------------------------------
		public getSrcData ():PIXI.Spritesheet | Array<PIXI.Texture> {
			return this.m_srcData;
		}

		//------------------------------------------------------------------------------------------
		public parseAnchorPointFromSpritesheet (__spriteSheet:PIXI.Spritesheet):PIXI.Point {
			var __frames:any = __spriteSheet.data.frames;

			for (var __frame in __frames) {
				var __anchor:any = __frames[__frame].anchor;

				return new PIXI.Point (__anchor.x, __anchor.y);
			}

			return null;
		}
		
		//------------------------------------------------------------------------------------------
		public createAnimatedSprite ():PIXI.AnimatedSprite {
			switch (this.m_type) {
				case XTextureManager.SPRITESHEET:
					var __spriteSheet:PIXI.Spritesheet = this.getSrcData () as PIXI.Spritesheet;

					this.m_animatedSprite = new PIXI.AnimatedSprite (__spriteSheet.animations["root"]);

					this.m_anchorPoint = this.parseAnchorPointFromSpritesheet (__spriteSheet);

					break;

				case XTextureManager.TEXTURELIST:
					var __textureArray:Array<PIXI.Texture> = this.getSrcData () as Array<PIXI.Texture>;

					this.m_animatedSprite = new PIXI.AnimatedSprite (__textureArray);

					break;
			}

			return this.m_animatedSprite;
		}

		//------------------------------------------------------------------------------------------
		public getAnimatedSprite ():PIXI.AnimatedSprite {
			return this.m_animatedSprite;
		}

		//------------------------------------------------------------------------------------------
		public destroyAnimatedSprite ():void {
			if (this.m_animatedSprite != null) {
				this.m_animatedSprite.destroy ();

				this.m_animatedSprite = null;
			}
		}

		//------------------------------------------------------------------------------------------
		public getTotalFrames ():number {
			return this.m_totalFrames;
		}
		
		//------------------------------------------------------------------------------------------
		public addFrameTexture (__frameTexture:PIXI.RenderTexture, __srcRenderTextureIndex:number, __rect:PIXI.Rectangle):void {	
			this.m_frameRenderTextures[this.m_frameIndex] = __frameTexture;
			this.m_srcRenderTextureIndexes[this.m_frameIndex] = __srcRenderTextureIndex;
			this.m_srcRects[this.m_frameIndex] = __rect;
			
			this.m_frameIndex++;
		}

		//------------------------------------------------------------------------------------------
		public setFrameTexture (__frameIndex:number, __frameTexture:PIXI.RenderTexture):void {
			this.m_frameRenderTextures[__frameIndex] = __frameTexture;	
		}
		
		//------------------------------------------------------------------------------------------
		public getFrameTexture (__frameIndex:number):PIXI.RenderTexture {
			return this.m_frameRenderTextures[__frameIndex];	
		}
	
		//------------------------------------------------------------------------------------------
		public getFrameRenderTextures ():Array<PIXI.RenderTexture> {
			return this.m_frameRenderTextures;
		}
	
		//------------------------------------------------------------------------------------------
		public setRenderTexture (__frameIndex:number, __srcRenderTexture:PIXI.RenderTexture):void {
			this.m_srcRenderTextures[__frameIndex] = __srcRenderTexture;	
		}
		
		//------------------------------------------------------------------------------------------
		public getRenderTexture (__frameIndex:number):PIXI.RenderTexture {
			return this.m_srcRenderTextures[__frameIndex];	
		}
		
		//------------------------------------------------------------------------------------------
		public setRenderTextureIndex (__frameIndex:number, __srcRenderTextureIndex:number):void {
			this.m_srcRenderTextureIndexes[__frameIndex] = __srcRenderTextureIndex;	
		}
		
		//------------------------------------------------------------------------------------------
		public getRenderTextureIndex (__frameIndex:number):number {
			return this.m_srcRenderTextureIndexes[__frameIndex];	
		}
		
		//------------------------------------------------------------------------------------------
		public getRect (__frameIndex:number):PIXI.Rectangle {
			return this.m_srcRects[__frameIndex];
		}
		
	//------------------------------------------------------------------------------------------
	}
	
	//------------------------------------------------------------------------------------------
// }