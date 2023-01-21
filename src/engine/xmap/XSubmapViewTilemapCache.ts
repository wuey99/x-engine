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
import * as PIXI from 'pixi.js';
import { XApp } from '../app/XApp';
import { XMapLayerModel } from './XMapLayerModel';
import { XSubObjectPoolManager } from '../pool/XSubObjectPoolManager';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XType } from '../type/XType';
import { XModelBase } from '../model/XModelBase';
import { XMapItemModel } from './XMapItemModel';
import { XSubmapModel } from './XSubmapModel';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';
import { XSubTextureManager } from '../texture/XSubTextureManager';
import { XMapModel } from './XMapModel';
import { XGameObject } from '../gameobject/XGameObject';
import { XGameObjectCX } from '../gameobject/XGameObjectCX';
import { XWorld } from '../sprite/XWorld';
import { XMapView } from './XMapView';
import { XRect } from '../geom/XRect';
import { XPoint } from '../geom/XPoint';
import { XMapLayerView } from './XMapLayerView';
import { XDepthSprite } from '../sprite/XDepthSprite';
import { XSubmapViewCache } from "./XSubmapViewCache";	

//------------------------------------------------------------------------------------------
	export class XSubmapViewTilemapCache extends XSubmapViewCache {
		private m_XRectPoolManager:XObjectPoolManager;
		private m_tileScaleFactor:number;
		private m_sprite:PIXI.Sprite;
		private m_renderTexture:PIXI.RenderTexture;
		
//------------------------------------------------------------------------------------------	
		public constructor () {
			super ();
		}

//------------------------------------------------------------------------------------------
		public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
			super.setup (__world, __layer, __depth);

			return this;
		}

//------------------------------------------------------------------------------------------
		public afterSetup (__params:Array<any> = null):XGameObject {
			super.afterSetup (__params);

			this.m_tileScaleFactor = (XSubmapModel.TX_TILE_WIDTH + 2) / XSubmapModel.TX_TILE_WIDTH;
			
			this.m_XRectPoolManager = this.world.getXRectPoolManager ();

			return this;
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup();

			if (this.m_sprite != null) {
				this.m_sprite.destroy ();
			}

			if (this.m_renderTexture != null) {
				this.m_renderTexture.destroy ();
			}
		}

//------------------------------------------------------------------------------------------
		public setModel (__model:XSubmapModel):void {
			super.setModel (__model);
			
			this.m_sprite.scale.x = (this.m_submapModel.width + 2) / this.m_submapModel.width;
			this.m_sprite.scale.y = (this.m_submapModel.height + 2) / this.m_submapModel.height;
		}
		
//------------------------------------------------------------------------------------------
		public dictRefresh ():void {
		}
		
//------------------------------------------------------------------------------------------
		public arrayRefresh ():void {
		}
		
//------------------------------------------------------------------------------------------
		public tileRefresh ():void {
			var __tilemap:PIXI.Container = new PIXI.Container ();

			var __tmap:Array<Array<any>> = this.m_submapModel.tmap;
			var __tileCols:number = this.m_submapModel.tileCols;
			var __tileRows:number = this.m_submapModel.tileRows;
			
			var __row:number;
			var __col:number;

			var __animatedSprites:Array<PIXI.AnimatedSprite> = new Array<PIXI.AnimatedSprite> ();

			for (__row = 0; __row < __tileRows; __row++) {
				for (__col = 0; __col < __tileCols; __col++) {
					var __tile:Array<any> = __tmap[__row * __tileCols + __col];

					if (__tile[0] != -1) {
						var __className:string = this.m_submapModel.XMapLayer.getClassNameFromIndex (__tile[0]);
						__className = __className.split (":")[0];
						var sheet:PIXI.Spritesheet = this.m_XApp.getResourceByName (__className);
						var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);

						if (__tile[1] != 0) {
							__animatedSprite.gotoAndStop (__tile[1] - 1);
						}

						__animatedSprite.x = __col * XSubmapModel.TX_TILE_WIDTH;
						__animatedSprite.y = __row * XSubmapModel.TX_TILE_HEIGHT;
						__animatedSprite.scale.x = this.m_tileScaleFactor;
						__animatedSprite.scale.y = this.m_tileScaleFactor;

						__tilemap.addChild (__animatedSprite);

						__animatedSprites.push (__animatedSprite);
					}
				}
			}

			this.m_XApp.getRenderer ().render (__tilemap, {renderTexture: this.m_renderTexture});
			this.m_sprite = PIXI.Sprite.from (this.m_renderTexture);
			this.addSortableChild (this.m_sprite, this.getLayer (), this.getDepth (), false);

			__tilemap.removeChildren (0, __tilemap.children.length);
			
			var __animatedSprite:PIXI.AnimatedSprite;

			for (__animatedSprite of __animatedSprites) {
				__animatedSprite.destroy ();
			}
		}
		
//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
		public createSprites ():void {
			this.m_renderTexture = PIXI.RenderTexture.create ({width: 512, height: 512});

			this.show ();
		}

//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
