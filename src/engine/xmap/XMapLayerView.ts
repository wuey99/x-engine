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

//------------------------------------------------------------------------------------------
// represents the view for all Items in a XMap.
//
// using the layer's viewport, instantiates/spawns XMapItemModels as XLogicObjects
// that fall within the viewport's rect.
//
// the XLogicObject is responsible for culling.  This class monitor's the XLogicObject's
// life-cycle by listening to the XLogicObject's kill signal.  XMapItemModels are returned
// to the Submap on a cull/kill;  However, objects that have been nuked () are permanently
// removed from the XMapModel.
//------------------------------------------------------------------------------------------
	export class XMapLayerView extends XGameObject {
		public m_XMapView:XMapView;
		public m_XMapModel:XMapModel;
		public m_currLayer:number;
		
		private m_XMapItemToXLogicObject:Map<XMapItemModel, XGameObject>;
		private m_XMapLayerModel:XMapLayerModel;
		private m_logicClassNameToClass:any;
		
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

            this.m_XMapView = __params[0];
			this.m_XMapModel = __params[1];
			this.m_currLayer = __params[2];
			this.m_logicClassNameToClass = __params[3];
			
			this.m_XMapLayerModel = this.m_XMapModel.getLayer (this.m_currLayer);
			
			this.m_XMapItemToXLogicObject = new Map<XMapItemModel, XGameObject> (); 

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
			
//------------------------------------------------------------------------------------------		
			var __items:Array<XMapItemModel>;
			
			if (this.m_XMapModel.useArrayItems) {
				__items = this.m_XMapModel.getArrayItemsAt (
					this.m_currLayer,
					__view.left, __view.top,
					__view.right, __view.bottom
				);
			} else {
				__items = this.m_XMapModel.getItemsAt (
					this.m_currLayer,
					__view.left, __view.top,
					__view.right, __view.bottom
				);				
			}
			
//------------------------------------------------------------------------------------------
			var __item:XMapItemModel;
			var i:number, __length:number = __items.length;
									
			for (i = 0; i < __length; i++) {
				__item = __items[i] as XMapItemModel;
						
				this.updateXMapItemModel (__item);
			}
		}
		
//------------------------------------------------------------------------------------------
		public updateXMapItemModel (__item:XMapItemModel):void {
			if (__item.inuse == 0) {
				this.addXMapItem (
					// item
					__item,
					// depth
					__item.depth
				);
			} else {
				if (this.m_XMapItemToXLogicObject.has (__item)) {
					var gameObject:XGameObject = this.m_XMapItemToXLogicObject.get (__item);
					
					var __point:XPoint = gameObject.getPos ();
				}
			}
		}	
		
//------------------------------------------------------------------------------------------
		public addXMapItem (__item:XMapItemModel, __depth:number):XGameObject {
			var __logicObject:XGameObjectCX;
			
			var __object:any = this.m_logicClassNameToClass (__item.logicClassName);
				
			if (XType.isFunction (__object)) {
				__logicObject = __object () as XGameObjectCX;
			}
			else if (__item.logicClassName.charAt (0) == "$") {
				if (__object == null) {
					console.log (": (error) logicClassName: ", __item.logicClassName);
					
					__logicObject = null;
				} else {
                    __logicObject = this.m_XMapView.addPooledGameObjectAsChild (
                        __object,
                        this.m_currLayer,
                        __depth,
                        false
                    ) as XGameObjectCX;

                    __logicObject.afterSetup ([
                        // TODO
                        // __item.imageClassName
                        // __item.frame
                    ]);

                    __logicObject.x = __item.x;
                    __logicObject.y = __item.y;
                    __logicObject.scale.x = __logicObject.scale.y = __item.scale;
                    __logicObject.angle = __item.rotation;
				}
			} else {
				if (__item.logicClassName == "XLogicObjectXMap:XLogicObjectXMap") {
					__logicObject = null;
				} else {
                    var __class:any = this.m_XApp.getClass (__item.logicClassName);

                    __logicObject = this.m_XMapView.addGameObjectAsChild (
                        __class, 
                        this.m_currLayer,
                        __depth,
                        false
                    ) as XGameObjectCX;
                    
                    __logicObject.afterSetup ([
                        // TODO
                        // __item.imageClassName
                        // __item.frame
                    ]);

                    __logicObject.x = __item.x;
                    __logicObject.y = __item.y;
                    __logicObject.scale.x = __logicObject.scale.y = __item.scale;
                    __logicObject.angle = __item.rotation;
				}
			}

			__item.inuse++;

			if (__logicObject == null) {
				return null;
			}
			
			this.m_XMapItemToXLogicObject.set (__item, __logicObject);

			__logicObject.setXMapModel (this.m_currLayer + 1, this.m_XMapModel, this.m_XMapView);
			
			__logicObject.addKillListener (this.removeXMapItem);

			return __logicObject;
		}

//------------------------------------------------------------------------------------------
		public getXGameObject (__item:XMapItemModel):XGameObject {
			return this.m_XMapItemToXLogicObject.get (__item);
		}
		
//------------------------------------------------------------------------------------------
		public removeXMapItem (__item:XMapItemModel):void {
			if (this.m_XMapItemToXLogicObject.has (__item)) {		
				this.m_XMapItemToXLogicObject.delete (__item);
			}
		}

//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
// }
