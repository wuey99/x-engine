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
    import { XWorld } from '../sprite/XWorld';

//------------------------------------------------------------------------------------------	
	export class XMapView extends XGameObject {
		public m_XMapModel:XMapModel;
		public m_submapBitmapPoolManager:XObjectPoolManager;
		public m_subTextureManager:XSubTextureManager;
		public m_textureManagerName:String;
		public m_imageNamesCached:boolean;
				
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

            this.m_imageNamesCached = false;

            return this;
        }

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup ();
			
			this.uncacheImageClassNames ();
			
			if (this.m_subTextureManager != null) {
				this.m_XApp.getTextureManager ().removeSubManager (this.m_textureManagerName);
			}
			
			if (this.m_submapBitmapPoolManager != null) {
				this.m_submapBitmapPoolManager.cleanup ();
			}

			this.m_XMapModel.cleanup ();
		}
		
//------------------------------------------------------------------------------------------
		public cullObject ():void {
			/*
			XType.forEach (this.getWorldXGameObjects (), 
				(x:any) => {
					var __gameObject:XGameObject = x as XGameObject;
					
					__gameObject.cullObject ();
				}
			);
			*/
			
			super.cullObject ();
		}
		
//------------------------------------------------------------------------------------------
// all levels/XMaps contain a list of images used in the level.  We cache them all as
// bitmap's (in flash) and textures/movieclips (in starling).		
//------------------------------------------------------------------------------------------
		
//------------------------------------------------------------------------------------------
		public areImageClassNamesCached ():boolean {
			var __flags:boolean;
			var i:number;
			
			if (this.m_imageNamesCached) {
				return true;
			}
			
			__flags = true;
			
			for (i = 0; i < this.m_XMapModel.getLayers ().length; i++) {
				var __layer:XMapLayerModel = this.m_XMapModel.getLayers ()[i] as XMapLayerModel;
	
				XType.forEach (__layer.getImageClassNames (), 
					(__name:any) => {
						if (__name == "ErrorImages:undefinedClass") {
							return;	
						}

                        /* TODO
						if (xxx.useBGTilemaps ()) {
							if (xxx.getMovieClipCacheManager ().isQueued (cast __name)) {
								trace (": not cached: ", __name);
								
								__flags = false;
							}							
						}
						else
						{
							if (xxx.getBitmapCacheManager ().isQueued (cast __name)) {
								trace (": not cached: ", __name);
								
								__flags = false;
							}
						}
                        */
					}
				);
				
				if (!__flags) {
					return false;
				}
			}
			
			this.m_imageNamesCached = true;
			
			return true;	
		}

//------------------------------------------------------------------------------------------
		public cacheImageClassNames ():void {
			var i:number;
				
			for (i = 0; i < this.m_XMapModel.getLayers ().length; i++) {
					var __layer:XMapLayerModel = this.m_XMapModel.getLayers ()[i] as XMapLayerModel;
					
					XType.forEach (__layer.getImageClassNames (), 
						(__name:any) => {
							console.log (": cacheImageClassName: ", __name);
			
                            /* TODO
							if (xxx.useBGTilemaps ()) {
								xxx.getMovieClipCacheManager ().add (cast __name);
							}
							else
							{
								xxx.getBitmapCacheManager ().add (cast __name);
							}
                            */
						}
					);
			}			
		}	
		
//------------------------------------------------------------------------------------------
		public uncacheImageClassNames ():void {
			var i:number;
			
				for (i = 0; i < this.m_XMapModel.getLayers ().length; i++) {
					var __layer:XMapLayerModel = this.m_XMapModel.getLayers ()[i] as XMapLayerModel;
		
					XType.forEach (__layer.getImageClassNames (), 
					    (__name:any) => {
                            /* TODO
							if (xxx.useBGTilemaps ()) {
								xxx.getMovieClipCacheManager ());
							}
							else
							{
								xxx.getBitmapCacheManager ());
							}
                            */
						}
					);
				}
		}

//------------------------------------------------------------------------------------------
		public getSubTextureManager ():XSubTextureManager {
			return this.m_subTextureManager;
		}
		
//------------------------------------------------------------------------------------------
		public initSubmapPoolManager ():void {
			this.initSubmapBitmapPoolManager (512, 512);
		}
		
//------------------------------------------------------------------------------------------
		public initSubmapBitmapPoolManager (
			__width:number=512, __height:number=512,
			__alloc:number=64, __spill:number=16
			):void {
				
			{
				this.m_submapBitmapPoolManager = new XObjectPoolManager (
					() => {
                        /* TODO
						var __tilemap:XSubmapTilemap = new XSubmapTilemap (512, 512, null);
						__tilemap.setup ();					
						
						return __tilemap;
                        */

                        return null;
					},
					
					(__src:any, __dst:any):any => {
						return null;
					},
					
					__alloc, __spill,
					
					(x:any):void => {
                        /* TODO
						var __tilemap:XSubmapTilemap = cast x
						
						__tilemap.cleanup ();
                        */
					}
				);				
			}
		}
		
//------------------------------------------------------------------------------------------
		public getSubmapBitmapPoolManager ():XObjectPoolManager {
			return this.m_submapBitmapPoolManager;
		}
		
//------------------------------------------------------------------------------------------
		public createModelFromXML (__xml:XSimpleXMLNode, __useArrayItems:boolean=false, __layerRemapper:Array<number> = null):void {
			var __model:XMapModel = new XMapModel ();
			
			__model.deserializeAllNormal (__xml, __useArrayItems, __layerRemapper);	
			
			this.setModel (__model);		
		}

//------------------------------------------------------------------------------------------
		public createModelFromXMLReadOnly (__xml:XSimpleXMLNode, __useArrayItems:boolean=false, __layerRemapper:Array<number> = null):void {
			var __model:XMapModel = new XMapModel ();
			
			__model.deserializeAllReadOnly (__xml, __useArrayItems, __layerRemapper);	
			
			this.setModel (__model);		
		}
		
//------------------------------------------------------------------------------------------
		public getModel ():XMapModel {
			return this.m_XMapModel;
		}
		
//------------------------------------------------------------------------------------------
		public setModel (__model:XMapModel):void {
			this.m_XMapModel = __model;
			
			this.cacheImageClassNames ();
		}
		
//------------------------------------------------------------------------------------------
		public addAdjustableGameObject (__gameObject:XGameObject, __callback:any = null):void {
		}

//------------------------------------------------------------------------------------------
		public scrollTo (__layer:number, __x:number, __y:number):void {
		}

//------------------------------------------------------------------------------------------
		public updateScroll ():void {
		}
		
//------------------------------------------------------------------------------------------
		public updateFromXMapModel ():void {
		}

//------------------------------------------------------------------------------------------
		public prepareUpdateScroll ():void {	
		}

//------------------------------------------------------------------------------------------
		public finishUpdateScroll ():void {	
		}
						
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
