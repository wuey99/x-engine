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
		
		public m_renderTextureIndex:number;
		public m_renderTexture:PIXI.RenderTexture;
		public m_animatedSprite:PIXI.AnimatedSprite;
		public m_totalFrames:number;
		public m_realBounds:PIXI.Rectangle;
		
		public m_tileIds:Array<number>;
		public m_renderTextures:Array<PIXI.RenderTexture>;
		public m_renderTextureIndexes:Array<number>;
		public m_rects:Array<PIXI.Rectangle>;

		public m_tileIndex:number;
		
		//------------------------------------------------------------------------------------------
		public constructor () {
		}

		//------------------------------------------------------------------------------------------
		public setup (
			__renderTextureIndex:number,
			__renderTexture:PIXI.RenderTexture,
			__animatedSprite:PIXI.AnimatedSprite,
			__totalFrames:number,
			__realBounds:PIXI.Rectangle
		) {
			this.m_renderTextureIndex = __renderTextureIndex;
			this.m_renderTexture = __renderTexture;
			this.m_animatedSprite = __animatedSprite;
			this.m_totalFrames = __totalFrames;
			this.m_realBounds = __realBounds;
			
			this.m_tileIds = new Array<number> ();
			this.m_renderTextures = new Array<PIXI.RenderTexture> (); 
			this.m_renderTextureIndexes = new Array<number> ();
			this.m_rects = new Array<PIXI.Rectangle> (); 
			
			this.m_tileIndex = 0;
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup () {	
		}

		//------------------------------------------------------------------------------------------
		public getMasterRenderTexture ():PIXI.RenderTexture {
			return this.m_renderTexture;
		}
		
		//------------------------------------------------------------------------------------------
		public setMasterRenderTexture (__renderTexture:PIXI.RenderTexture):void {
			this.m_renderTexture = __renderTexture;
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
		public getMasterRenderTextureIndex ():number {
			return this.m_renderTextureIndex;
		}
		
		//------------------------------------------------------------------------------------------
		public getAnimatedSprite ():PIXI.AnimatedSprite{
			return this.m_animatedSprite;
		}
		
		//------------------------------------------------------------------------------------------
		public getTotalFrames ():number {
			return this.m_totalFrames;
		}
		
		//------------------------------------------------------------------------------------------
		public addTile (__tileId:number, __renderTextureIndex:number, __rect:PIXI.Rectangle):void {	
			this.m_tileIds[this.m_renderTextureIndex] = __tileId;
			this.m_renderTextureIndexes[this.m_tileIndex] = __renderTextureIndex;
			this.m_rects[this.m_tileIndex] = __rect;
			
			this.m_tileIndex++;
		}

		//------------------------------------------------------------------------------------------
		public setTileId (__tileIndex:number, __tileId:number):void {
			this.m_tileIds[__tileIndex] = __tileId;	
		}
		
		//------------------------------------------------------------------------------------------
		public getTileId (__tileIndex:number):number {
			return this.m_tileIds[__tileIndex];	
		}
	
		//------------------------------------------------------------------------------------------
		public setRenderTexture (__tileIndex:number, __renderTexture:PIXI.RenderTexture):void {
			this.m_renderTextures[__tileIndex] = __renderTexture;	
		}
		
		//------------------------------------------------------------------------------------------
		public getRenderTexture (__tileIndex:number):PIXI.RenderTexture {
			return this.m_renderTextures[__tileIndex];	
		}
		
		//------------------------------------------------------------------------------------------
		public setRenderTextureIndex (__tileIndex:number, __renderTextureIndex:number):void {
			this.m_renderTextureIndexes[__tileIndex] = __renderTextureIndex;	
		}
		
		//------------------------------------------------------------------------------------------
		public getRenderTextureIndex (__tileIndex:number):number {
			return this.m_renderTextureIndexes[__tileIndex];	
		}
		
		//------------------------------------------------------------------------------------------
		public getRect (__tileIndex:number):PIXI.Rectangle {
			return this.m_rects[__tileIndex];
		}
		
	//------------------------------------------------------------------------------------------
	}
	
	//------------------------------------------------------------------------------------------
// }