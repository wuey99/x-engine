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
	// MovieClipMetadata
	//------------------------------------------------------------------------------------------
	export class MovieClipMetadata {
		
		public m_srcRenderTextureIndex:number;
		public m_srcRenderTexture:PIXI.RenderTexture;
		public m_spriteSheet:PIXI.Spritesheet;
		public m_totalFrames:number;
		public m_realBounds:PIXI.Rectangle;
		public m_anchorPoint:PIXI.Point;
		
		public m_frameRenderTextures:Array<PIXI.RenderTexture>;
		public m_srcRenderTextures:Array<PIXI.RenderTexture>;
		public m_srcRenderTextureIndexes:Array<number>;
		public m_srcRects:Array<PIXI.Rectangle>;

		public m_frameIndex:number;
		
		//------------------------------------------------------------------------------------------
		public constructor () {
		}

		//------------------------------------------------------------------------------------------
		public setup (
			__srcRenderTextureIndex:number,
			__srcRenderTexture:PIXI.RenderTexture,
			__spriteSheet:PIXI.Spritesheet,
			__totalFrames:number,
			__realBounds:PIXI.Rectangle,
			__anchorPoint:PIXI.Point
		) {
			this.m_srcRenderTextureIndex = __srcRenderTextureIndex;
			this.m_srcRenderTexture = __srcRenderTexture;
			this.m_spriteSheet = __spriteSheet;
			this.m_totalFrames = __totalFrames;
			this.m_realBounds = __realBounds;
			this.m_anchorPoint = __anchorPoint;
			
			this.m_frameRenderTextures = new Array<PIXI.RenderTexture> ();
			this.m_srcRenderTextures = new Array<PIXI.RenderTexture> (); 
			this.m_srcRenderTextureIndexes = new Array<number> ();
			this.m_srcRects = new Array<PIXI.Rectangle> (); 
			
			this.m_frameIndex = 0;
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup () {	
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
		public getSpritesheet ():PIXI.Spritesheet{
			return this.m_spriteSheet;
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