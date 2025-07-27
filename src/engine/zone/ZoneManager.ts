//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "GX-Engine"
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
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XMapItemModel } from '../xmap/XMapItemModel';
import { XMapLayerModel } from '../xmap/XMapLayerModel';
import { XRect } from '../geom/XRect';
import { XSubmapModel } from '../xmap/XSubmapModel';
import { XLevelGameInstance } from '../level/XLevelGameInstance';
import { StarterRingControllerX } from './StarterRingControllerX'
import { ZoneX } from './ZoneX';
import { GateX } from './GateX';
import { CurrentGateX } from './CurrentGateX';
import { DoorX } from './DoorX';
import { ZoneObjectCX } from './ZoneObjectCX';

	//------------------------------------------------------------------------------------------
	export class ZoneManager {
		private world:XWorld;
		private m_XApp:XApp;
		
		private m_starterRingItems:Map<number, XMapItemModel>; /* <Int, XMapItemModel> */
		private m_starterRingItemObjects:Map<number, StarterRingControllerX>; /* <Int, StarterRingControllerX> */
		
		private m_zoneItems:Map<number, XMapItemModel>; /* <Int, XMapItemModel> */
		private m_zoneItemObjects:Map<number, ZoneX>; /* <Int, ZoneX> */
		
		private m_gateItems:Map<number, XMapItemModel>; /* <Int, XMapItemModel> */
		private m_gateItemObjects:Map<number, GateX>; /* <Int, GateX> */
		
		private m_currentGateItems:Map<number, XMapItemModel>; /* <Int, XMapItemModel> */
		private m_currentGateItemObjects:Map<number, CurrentGateX>;	/* <Int, CurrentGateX> */
		
		private m_doorItems:Map<number, XMapItemModel>; /* <Int, XMapItemModel> */
		private m_doorItemObjects:Map<number, DoorX>; /* <Int, DoorX> */
		
		private m_zoneKillCount:number;
		
		private m_playFieldLayer:number;
		private m_zoneObjectsMap:any;
		private m_zoneObjectsMapNoKill:any;
		private m_Horz_GateX:any; // <Dynamic>
		private m_Vert_GateX:any; // <Dynamic>
		private m_Horz_DoorX:any; // <Dynamic>
		private m_Vert_DoorX:any; // <Dynamic>
		private m_GateArrowX:any; // <Dynamic>
		private m_WaterCurrentX:any; // <Dynamic>
		private m_StarterRingControllerX:any; // <Dynamic>
		private m_ZoneX:any; // <Dynamic>
		
        private m_gameInstance:XLevelGameInstance;

		//------------------------------------------------------------------------------------------
		public constructor () {
			// super ();
		}
		
		//------------------------------------------------------------------------------------------
		public setup (
			__world:XWorld,
			__XApp:XApp,
			__playfieldLayer:number,
			__zoneObjectsMap:any /* Object */,
			__zoneObjectsMapNoKill:any /* Object */,
			__Horz_GateX:any /* <Dynamic> */,
			__Vert_GateX:any /* <Dynamic> */,
			__Horz_DoorX:any /* <Dynamic> */,
			__Vert_DoorX:any /* <Dynamic> */,
			__GateArrowX:any /* <Dynamic> */,
			__WaterCurrentX:any /* <Dynamic> */,
			__StarterRingControllerX:any  /* <Dynamic> */,
			__ZoneX:any = null /* <Dynamic> */
		):void {
			this.world = __world;
			this.m_XApp = __XApp;
			
			this.m_playFieldLayer = __playfieldLayer;
			
			this.m_zoneObjectsMap = __zoneObjectsMap;
			this.m_zoneObjectsMapNoKill = __zoneObjectsMapNoKill;
			
			this.m_Horz_GateX = __Horz_GateX;
			this.m_Vert_GateX = __Vert_GateX;
			this.m_Horz_DoorX = __Horz_DoorX;
			this.m_Vert_DoorX = __Vert_DoorX;
			this.m_GateArrowX = __GateArrowX;
			this.m_WaterCurrentX = __WaterCurrentX;
			this.m_StarterRingControllerX = __StarterRingControllerX;
			if (__ZoneX == null) {
				this.m_ZoneX = ZoneX;
			} else {
				this.m_ZoneX = __ZoneX;
			}
		}
		
		//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}

		//------------------------------------------------------------------------------------------
        getGameInstance ():XLevelGameInstance {
            return this.m_gameInstance;
        }

		//------------------------------------------------------------------------------------------
		public setCurrentZone (__zone:number):void {
			this.getGameInstance ().m_currentZone = __zone;
			
			this.resetZoneKillCount ();
			
			var __layerModel:XMapLayerModel = this.world.getXMapModel ().getLayer (this.m_playFieldLayer + 0);
			var __currentZoneItemObject:ZoneX = this.getZoneItemObject (this.getCurrentZone ());
			var __itemRect:XRect = new XRect ();
			var __list:Map<number, XMapItemModel> /* <Int, XMapItemModel> */ = new Map<number, XMapItemModel> (); // <Int, XMapItemModel>
			
			//------------------------------------------------------------------------------------------
			console.log (": currentItemZoneObject: ", __currentZoneItemObject, __currentZoneItemObject.boundingRect);
			console.log (": itemRect: ", __itemRect);
			
			//------------------------------------------------------------------------------------------
			if (__currentZoneItemObject == null) {
				throw (XType.createError ("no zone item object found!"));	
			}
			
			//------------------------------------------------------------------------------------------
			// find all items that intersect zone's boundingRect
			//------------------------------------------------------------------------------------------
			console.log (": zoneRect: ", __currentZoneItemObject.boundingRect);
			
			__layerModel.iterateAllSubmaps (
				(__XSubmapModel:XSubmapModel, __row:number, __col:number) => {
					__XSubmapModel.iterateAllItems (
						(x:any) => {
							var __item:XMapItemModel = x as XMapItemModel;
							
							__item.boundingRect.copy2 (__itemRect);
							__itemRect.offset (__item.x, __item.y);
							
							if (
								__currentZoneItemObject.boundingRect.width != 0 && __currentZoneItemObject.boundingRect.height != 0 &&
								__currentZoneItemObject.boundingRect.intersects (__itemRect) &&
								this.isValidZoneObjectItem (__item.XMapItem)) {
								console.log (": itemRect: ", __item.logicClassName, __itemRect);
								
								__list.set (__item.id, __item);
							}
						}
					);
				}
			);
			
			//------------------------------------------------------------------------------------------
			// find killCount for the zone
			//------------------------------------------------------------------------------------------
			XType.forEach (__list, 
				(__id:any) => {
					var __item:XMapItemModel = __list.get (__id) as XMapItemModel;
					// objects are double instantiated here.  normal XMapLayerView instantiates it first sometimes.
					
					var __logicObject:ZoneObjectCX;
					
					if (__item.inuse == 0) {
						__logicObject = this.getGameInstance ().getLevelObject ().addXMapItem (__item, 0) as ZoneObjectCX;
					}
					else
					{
						__logicObject = this.getGameInstance ().getLevelObject ().getXLogicObject (__item) as ZoneObjectCX;
					}
					
					console.log (": setCurrentZone: item: ", __item.logicClassName, __logicObject);
					
					if (__logicObject != null) {
						__logicObject.setAsPersistedObject (true);
						
						if (!this.isZoneObjectItemNoKill (__item.XMapItem)) {
							this.addToZoneKillCount ();
						}
					}
				}	
			);
			
			//----------------------------------------------------------------------------------------
			console.log (": zoneKillCount: ", this.m_zoneKillCount);
			
			this.m_XApp.getXTaskManager ().addTask ([
				XTask.WAIT, 0x0800,
				
				() => {
					if (this.m_zoneKillCount == 0) {
						this.getGameInstance ().fireZoneFinishedSignal ();
					}
				},
				
				XTask.RETN,
			]);
		}
				
		//------------------------------------------------------------------------------------------
		public getCurrentZone ():number {
			return this.getGameInstance ().m_currentZone;
		}
		
		//------------------------------------------------------------------------------------------
		// m_zoneItems: map of all zone items in the level
		// we iterate through all the zome items and instantiate XLogicObjects for each.
		//      m_zoneItemObjects: map of all the instantiated zoneItemObjects 
		//		
		// m_starterItems: map of all the start items in the level
		// we iterate through all the zone items and instantiate XLogicObjects for each.
		//      m_starterItemObjects: map of all the instantiated startItemObjects
		//
		// m_gateItems: map of all the gate items in the level (horz and vert)
		// we iterate through all the gate items and instantiate XLogicObjects for each.
		//     m_gateItemObjects: map of all the instantiated gateItemObjects
		//------------------------------------------------------------------------------------------
		public getAllGlobalItems ():void {
			var __layerModel:XMapLayerModel = this.world.getXMapModel ().getLayer (this.m_playFieldLayer + 0);
					
			//------------------------------------------------------------------------------------------
			this.m_zoneItems = __layerModel.lookForItem ("Zone_Item");
					
			this.m_zoneItemObjects = new Map<number, ZoneX> (); /* <Int, ZoneX> */
					
			XType.forEach (this.m_zoneItems, 
				(__id:any) => {
					var __item:XMapItemModel = this.m_zoneItems.get (__id);
							
					var __zoneItemObject:ZoneX = this.world.getXLogicManager ().initXLogicObject (
						// parent
						this.getGameInstance ().getLevelObject (),
						// logicObject
						XType.createInstance (this.m_ZoneX) as XGameObject,
						// item, layer, depth
						__item, this.m_playFieldLayer + 0, 10000,
						// x, y, z
						__item.x, __item.y, 0,
						// scale, rotation
						1.0, 0
					) as ZoneX;
							
					this.getGameInstance ().getLevelObject ().addXLogicObject(__zoneItemObject);
							
					__item.inuse++;
							
					this.m_zoneItemObjects.set (__zoneItemObject.getZone (), __zoneItemObject);
				}
			);
					
			//------------------------------------------------------------------------------------------
			this.m_starterRingItems = __layerModel.lookForItem ("StarterRing_Item");
					
			this.m_starterRingItemObjects = new Map<number, StarterRingControllerX> (); /* <Int, StarterRingControllerX> */
					
			XType.forEach (this.m_starterRingItems, 
				(__id:any) => {
					var __item:XMapItemModel = this.m_starterRingItems.get (__id);
							
					var __starterRingItemObject:StarterRingControllerX = this.world.getXLogicManager ().initXLogicObject (
						// parent
						this.getGameInstance ().getLevelObject (),
						// logicObject
						XType.createInstance (this.m_StarterRingControllerX) as XGameObject,
						// item, layer, depth
						__item, this.m_playFieldLayer + 0, 10000,
						// x, y, z
						__item.x, __item.y, 0,
						// scale, rotation
						1.0, 0
					) as StarterRingControllerX;
							
					this.getGameInstance ().getLevelObject ().addXLogicObject (__starterRingItemObject);
							
					__item.inuse++;
							
					this.m_starterRingItemObjects.set (__starterRingItemObject.getZone (), __starterRingItemObject);
				}
			);
					
			//------------------------------------------------------------------------------------------
			this.m_gateItems = __layerModel.lookForItem ("Horz_Gate_Item");
			this.m_gateItems = __layerModel.lookForItem ("Vert_Gate_Item", this.m_gateItems);
					
			this.m_gateItemObjects = new Map<number, GateX> ();
					
			if (this.m_Horz_GateX != null && this.m_Vert_GateX != null)
				XType.forEach (this.m_gateItems, 
					(__id:any) => {
						var __item:XMapItemModel = this.m_gateItems.get (__id);
								
						var __gateItemObject:GateX;
								
						console.log (": gateItems: ", __item.id, __item.XMapItem);
								
						if (__item.XMapItem == "Horz_Gate_Item") {
							__gateItemObject = this.world.getXLogicManager ().initXLogicObject (
								// parent
								this.getGameInstance ().getLevelObject (),
								// logicObject
                                XType.createInstance (this.m_Horz_GateX) as XGameObject,
								// item, layer, depth
								__item, this.m_playFieldLayer + 0, 10000,
								// x, y, z
								__item.x, __item.y, 0,
								// scale, rotation
								1.0, 0,
								[
									this.m_GateArrowX
								]
							) as GateX;
						} else {
							__gateItemObject = this.world.getXLogicManager ().initXLogicObject (
								// parent
								this.getGameInstance ().getLevelObject (),
								// logicObject
								XType.createInstance (this.m_Vert_GateX) as XGameObject,
								// item, layer, depth
								__item, this.m_playFieldLayer + 0, 10000,
								// x, y, z
								__item.x, __item.y, 0,
								// scale, rotation
								1.0, 0,
								[
									this.m_GateArrowX
								]
							) as GateX;
						}
                    
                        this.getGameInstance ().getLevelObject ().addXLogicObject (__gateItemObject);
								
						__item.inuse++;
								
						__gateItemObject.setXMapModel (this.getGameInstance ().getMickeyObject ().getLayer () + 1, this.world.getXMapModel (), this.getGameInstance ().getLevelObject ());	
					}
				);
					
			//------------------------------------------------------------------------------------------
			this.m_doorItems = __layerModel.lookForItem ("Horz_Door_Item");
			this.m_doorItems = __layerModel.lookForItem ("Vert_Door_Item", this.m_doorItems);
					
			this.m_doorItemObjects = new Map<number, DoorX> (); /* <Int, DoorX> */
					
			if (this.m_Horz_DoorX != null && this.m_Vert_DoorX != null)
				XType.forEach (this.m_doorItems, 
					(__id:any) => {
						var __item:XMapItemModel = this.m_doorItems.get (__id);
								
						var __doorItemObject:DoorX;
								
						console.log (": doorItems: ", __item.id, __item.XMapItem);
								
						if (__item.XMapItem == "Horz_Door_Item") {
							__doorItemObject = this.world.getXLogicManager ().initXLogicObject (
								// parent
								this.getGameInstance ().getLevelObject (),
								// logicObject
								XType.createInstance (this.m_Horz_DoorX) as XGameObject,
								// item, layer, depth
								__item, this.m_playFieldLayer + 0, 10000,
								// x, y, z
								__item.x, __item.y, 0,
								// scale, rotation
								1.0, 0
							) as DoorX;
						} else {
							__doorItemObject = this.world.getXLogicManager ().initXLogicObject (
								// parent
								this.getGameInstance ().getLevelObject (),
								// logicObject
								XType.createInstance (this.m_Vert_DoorX) as XGameObject,
								// item, layer, depth
								__item, this.m_playFieldLayer + 0, 10000,
								// x, y, z
								__item.x, __item.y, 0,
								// scale, rotation
								1.0, 0
							) as DoorX;
						}
								
						this.getGameInstance ().getLevelObject ().addXLogicObject (__doorItemObject);
								
						__item.inuse++;
								
						__doorItemObject.setXMapModel (this.getGameInstance ().getMickeyObject ().getLayer () + 1, this.world.getXMapModel (), this.getGameInstance ().getLevelObject ());	
					}
				);
					
			//------------------------------------------------------------------------------------------
			this.m_currentGateItems = __layerModel.lookForItem ("Current_Gate_Item");
					
			this.m_currentGateItemObjects = new Map<number, CurrentGateX> ();
					
			XType.forEach (this.m_currentGateItems, 
				(__id:any ) => {
					var __item:XMapItemModel = this.m_currentGateItems.get (__id);
							
					var __currentGateItemObject:CurrentGateX;
							
					console.log (": currentGateItems: ", __item.id, __item.XMapItem);
							
					__currentGateItemObject = this.world.getXLogicManager ().initXLogicObject (
						// parent
						this.getGameInstance ().getLevelObject (),
						// logicObject
						new CurrentGateX () as XGameObject,
						// item, layer, depth
						__item, this.m_playFieldLayer + 0, 10000,
						// x, y, z
						__item.x, __item.y, 0,
						// scale, rotation
						1.0, 0,
						[
							this.m_WaterCurrentX
						]
					) as CurrentGateX;
							
					this.getGameInstance ().getLevelObject ().addXLogicObject (__currentGateItemObject);
							
					__item.inuse++;
							
					__currentGateItemObject.setXMapModel (this.getGameInstance ().getMickeyObject ().getLayer () + 1, this.world.getXMapModel (), this.getGameInstance ().getLevelObject ());	
				}
			);
		}
				
		//------------------------------------------------------------------------------------------
		public isValidZoneObjectItem (__itemName:string):boolean {
			return XType.hasField (this.m_zoneObjectsMap, __itemName);
		}
				
		//------------------------------------------------------------------------------------------
		public isZoneObjectItemNoKill (__itemName:string):boolean {
			return XType.hasField (this.m_zoneObjectsMapNoKill, __itemName);
		}
				
		//------------------------------------------------------------------------------------------
		public getZoneItems ():Map<number, XMapItemModel> {
			return this.m_zoneItems;
		}
				
		//------------------------------------------------------------------------------------------
		public getZoneItemObject (__zone:number):ZoneX {
			if (this.m_zoneItemObjects.has (__zone)) {
				return this.m_zoneItemObjects.get (__zone);
			}
					
			return null;
		}
				
		//------------------------------------------------------------------------------------------
		public getStarterRingItems ():Map<number, XMapItemModel> {
			return this.m_starterRingItems;
		}
			
		//------------------------------------------------------------------------------------------
		public getStarterRingItemObjects ():Map<number, StarterRingControllerX> {
			return this.m_starterRingItemObjects;
		}
		
		//------------------------------------------------------------------------------------------
		public setMickeyToStartPosition (__zone:number):void {	
			var __logicObject:StarterRingControllerX = this.m_starterRingItemObjects.get (__zone);
					
			if (__logicObject.getZone () == __zone) {
				this.getGameInstance ().getMickeyObject ().oX = __logicObject.oX;
				this.getGameInstance ().getMickeyObject ().oY = __logicObject.oY;
				this.getGameInstance ().getMickeyObject ().oRotation = 0;
			}
		}
				
		//------------------------------------------------------------------------------------------
		public resetZoneKillCount ():void {
			this.m_zoneKillCount = 0;
		}
				
		//------------------------------------------------------------------------------------------
		public addToZoneKillCount ():void {
			this.m_zoneKillCount++;
					
			console.log (": addToZoneKillCount: ", this.m_zoneKillCount);
		}
				
		//------------------------------------------------------------------------------------------
		public removeFromZoneKillCount ():void {
			this.m_zoneKillCount--;
					
			console.log (": removeFromZoneKillCount: ", this.m_zoneKillCount);
					
			this.m_XApp.getXTaskManager ().addTask ([
				XTask.WAIT, 0x1000,
						
				() => {
					if (this.m_zoneKillCount == 0) {
						this.getGameInstance ().fireZoneFinishedSignal ();
					}
				},
						
				XTask.RETN,
			]);
		}
						
		//------------------------------------------------------------------------------------------
		public getZoneKillCount ():number {
			return this.m_zoneKillCount;
		}
					
	//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
