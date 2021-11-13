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
    import { XGameObjectCX } from '../gameobject/XGameObjectCX';
    import { XWorld } from '../sprite/XWorld';
    import { XMapView } from './XMapView';
    import { XRect } from '../geom/XRect';
    import { XPoint } from '../geom/XPoint';
    import { XMapLayerView } from './XMapLayerView';
	import { XDepthSprite } from '../sprite/XDepthSprite';

//------------------------------------------------------------------------------------------	
// instead of maintaining an XLogicObject for an XMapItemModel (for the view), maintain a 
// bitmap/view-cache for eash Submap.  On initialization, all XMapItemModel's that flagged
// for caching are drawing directly into the Submap's bitmap/view-cache.
//
// pros:
//
// 1) performance gains because all cached XMapItem's are now baked into a single bitmap.
//
// cons:
//
// 1) lack of fine-grained control of z-ordering
//
// 2) since the image is baked into the bitmap, there is no ability to animate (or change image's appearance)
//    without having to recache the image.
//
// 3) possibly large set-up times (each Submap is 512 x 512 pixels by default)
//------------------------------------------------------------------------------------------
	export class XSubmapViewCache extends XGameObject {
		private m_poolManager:XObjectPoolManager;
		private m_submapModel:XSubmapModel;
		
		private x_sprite:XDepthSprite;
	
		private tempRect:XRect;
		private tempPoint:XPoint;

		private m_delay:number;
		
		private m_scaleFactor:number;
		
//------------------------------------------------------------------------------------------	
		public constructor () {
			super ();
			
			this.m_submapModel = null;
		}

//------------------------------------------------------------------------------------------
        public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
            super.setup (__world, __layer, __depth);

            return this;
        }

//------------------------------------------------------------------------------------------
        public afterSetup (__params:Array<any> = null):XGameObject {
            super.afterSetup (__params);

			this.m_poolManager = __params[0];
	
			this.m_scaleFactor = __params[1];
			
			// TODO this.createSprites ();
			
			this.tempRect = this.world.getXRectPoolManager ().borrowObject () as XRect;
			this.tempPoint = this.world.getXPointPoolManager ().borrowObject () as XPoint;

			this.m_delay = 4;

            return this;
        }

//------------------------------------------------------------------------------------------
        public cleanup ():void {
            // super.cleanup ();

			this.returnBorrowedObjects ();
			
			this.world.getXRectPoolManager ().returnObject (this.tempRect);
		    this.world.getXPointPoolManager ().returnObject (this.tempPoint);
			
			if (this.m_submapModel != null) {
				this.fireKillSignal (this.m_submapModel);
							
				this.m_submapModel.inuse--;
				
				this.m_submapModel = null;
			}
			
			this.removeAll ();
			
			if (this.m_poolClass != null) {
				this.world.getXLogicObjectPoolManager ().returnObject (this.m_poolClass, this);
			}
			
			this.isDead = true;
			this.cleanedUp = true;
        }

//x------------------------------------------------------------------------------------------
		public setModel (__model:XSubmapModel):void {
			this.m_submapModel = __model;
			
			this.m_boundingRect = this.m_submapModel.boundingRect.cloneX ();
			
			this.refresh ();
		}

//------------------------------------------------------------------------------------------
		public refresh ():void {
			if (this.m_submapModel.useArrayItems) {
// for now only support tileRefresh.  In the future, we might support optional array or tile refresh
//				arrayRefresh ();
				
				this.tileRefresh ();
			} else {
				this.dictRefresh ();
			}
		}
		
//------------------------------------------------------------------------------------------
		public dictRefresh ():void {
		}
		
//------------------------------------------------------------------------------------------
		public arrayRefresh ():void {
		}
		
//------------------------------------------------------------------------------------------
		public tileRefresh ():void {
		}
		
		//------------------------------------------------------------------------------------------
		public tileRefreshScaled ():void {
		}
		
//------------------------------------------------------------------------------------------
// cull this object if it strays outside the current viewPort
//------------------------------------------------------------------------------------------	
		public cullObject ():void {
			if (this.m_delay > 0) {
				this.m_delay--;
				
				return;
			}

// determine whether this object is outside the current viewPort
			var v:XRect = this.world.getViewRect ();
						
			this.world.getXWorldLayer (this.m_layer).viewPort (v.width, v.height).copy2 (this.m_viewPortRect);
			this.m_viewPortRect.inflate (256, 256);
			
			this.m_boundingRect.copy2 (this.m_selfRect);
			this.m_selfRect.offsetPoint (this.getPos ());
			
			if (this.m_viewPortRect.intersects (this.m_selfRect)) {
				return;
			}

// yep, kill it
//			trace (": ---------------------------------------: ");
//			trace (": cull: ", this);
	
			this.killLater ();
		}

//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
