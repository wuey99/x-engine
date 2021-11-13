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
    import { XSubmapViewCache } from './XSubmapViewCache';

//------------------------------------------------------------------------------------------
	export class XMapLayerCachedView extends XMapLayerView {
		private m_XSubmapToXLogicObject:Map<XSubmapModel, XGameObject>;
		private m_delay:number;
				
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

        /* TODO
        this.m_XMapView = __params[0];
        this.m_XMapModel = __params[1];
        this.m_currLayer = __params[2];
        */

        this.m_XSubmapToXLogicObject = new Map<XSubmapModel, XGameObject> ();
        
        this.m_delay = 1;

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
	public updateFromXMapModel ():void {		
		var __view:XRect = this.world.getXWorldLayer (this.m_currLayer).viewPort (
			this.world.getViewRect ().width, this.world.getViewRect ().height
		);

		this.updateFromXMapModelAtRect (__view);
	}
		
//------------------------------------------------------------------------------------------
	public updateFromXMapModelAtRect (__view:XRect):void {
		if (!this.m_XMapView.areImageClassNamesCached ()) {
			return;
		}
			
		if (this.m_delay > 0) {
			this.m_delay--;
				
			return;
		}

//------------------------------------------------------------------------------------------						
		var __submaps:Array<XSubmapModel>;
			
		__submaps = this.m_XMapModel.getSubmapsAt (
			this.m_currLayer,
			__view.left, __view.top,
			__view.right, __view.bottom
		);
			
//------------------------------------------------------------------------------------------
		var __submap:XSubmapModel;
			
		var i:number;
			
		for (i = 0; i < __submaps.length; i++) {
			__submap = __submaps[i] as XSubmapModel;
				
			this.updateXSubmapModel (__submap);
		}
	}
		
//------------------------------------------------------------------------------------------
	public updateXSubmapModel (__submap:XSubmapModel):void {
		if (__submap.inuse == 0) {
			this.addXSubmap (
				// submap
				__submap,
				// depth
				0
			);
		} else {
			if (this.m_XSubmapToXLogicObject.has (__submap)) {
				var logicObject:XGameObject = this.m_XSubmapToXLogicObject.get (__submap);
			}
		}
	}	
		
//------------------------------------------------------------------------------------------
	public addXSubmap (__submap:XSubmapModel, __depth:number):void {
//		trace (": addXSubmap: ", __submap.x, __submap.y);
			
		var __logicObject:XSubmapViewCache;
			
		if (true) {
                /*
				__logicObject =
					cast xxx.getXLogicManager ().initXLogicObjectFromPool (
						// parent
						m_XMapView,
						// class
						XSubmapViewTilemapCache,
						// item, layer, depth
						null, m_currLayer, __depth,
						// x, y, z
						__submap.x, __submap.y, 0,
						// scale, rotation
						1.0, 0,
						[
							// XMapView
							m_XMapView.getSubmapBitmapPoolManager ()
						]
					) */ /* as XSubmapViewCache */;

                __logicObject = this.addPooledGameObjectAsChild (
                    null, // TODO
                    this.m_currLayer,
                    __depth,
                    true
                ) as XSubmapViewCache;

                __logicObject.afterSetup ([
                    this.m_XMapView.getSubmapBitmapPoolManager () // TODO
                ]);

                __logicObject.x = __submap.x;
                __logicObject.y = __submap.y;
                __logicObject.scale.x = 1.0;
                __logicObject.angle = 0;
		}
			
		__submap.inuse++;
			
		// this.m_XMapView.addXLogicObject (__logicObject);
			
		this.m_XSubmapToXLogicObject.set (__submap, __logicObject);
			
		__logicObject.setModel (__submap);
			
		__logicObject.addKillListener (this.removeXSubmap);
			
		__logicObject.show ();
	}
				
//------------------------------------------------------------------------------------------
	public removeXSubmap (__submap:XSubmapModel):void {
		if (this.m_XSubmapToXLogicObject.has (__submap)) {		
			this.m_XSubmapToXLogicObject.delete (__submap);
		}
	}
		
//------------------------------------------------------------------------------------------
}
	
//------------------------------------------------------------------------------------------
// }
