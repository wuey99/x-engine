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
    import { XRect } from '../geom/XRect';
    import { XMapModel } from './XMapModel';
    import { XType } from '../type/XType';
    import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
    import { XModelBase } from '../model/XModelBase';
    import { XMapItemModel } from './XMapItemModel';
    import { XSubmapModel } from './XSubmapModel';
    import { XReferenceNameToIndex } from '../utils/XReferenceNameToIndex';

//------------------------------------------------------------------------------------------	
	export class XMapLayerModel extends XModelBase {
		private m_XMap:XMapModel;
		
		private m_layer:number;
		
		private m_XSubmaps:Array<Array<XSubmapModel>>;
		
		private m_submapRows:number = 0;
		private m_submapCols:number = 0;
		private m_submapWidth:number;
		private m_submapHeight:number;
		
		private m_currID:number;

		private m_items:Map<XMapItemModel, number>;
		private m_ids:Map<number, XMapItemModel>;

		private m_classNames:XReferenceNameToIndex;
		private m_imageClassNames:Map<string, number>; 
		
		private m_viewPort:XRect;
		private m_startingViewPort:XRect;
		
		private m_visible:boolean;
		private m_scale:number;
		private m_regX:number;
		private m_regY:number;
		private m_name:string;
		private m_grid:boolean;
		
		private m_itemInuse:Map<number, number>;
		
		private m_persistentStorage:Map<number, any>;

		private m_retrievedSubmaps:Array<XSubmapModel>;
		private m_retrievedItems:Array<XMapItemModel>;
		
//------------------------------------------------------------------------------------------	
		public constructor (
			__submapCols:number = 32, __submapRows:number = 32,
			__submapWidth:number = 512, __submapHeight:number = 512
		) {
			super ();
			
			this.m_submapCols = __submapCols;
			this.m_submapRows = __submapRows;
			this.m_submapWidth = __submapWidth;
			this.m_submapHeight = __submapHeight;
		}	

//------------------------------------------------------------------------------------------
		public setup (
			__layer:number,
			__submapCols:number, __submapRows:number,
			__submapWidth:number, __submapHeight:number
			):void {

			var i:number;
			
			var __row:number;
			var __col:number;

			this.m_submapRows = __submapRows;
			this.m_submapCols = __submapCols;
			this.m_submapWidth = __submapWidth;
			this.m_submapHeight = __submapHeight;

			this.m_currID = 0;
			this.m_items = new Map<XMapItemModel, number> (); 
			this.m_ids = new Map<number, XMapItemModel> ();
			this.m_layer = __layer;
			this.m_XSubmaps = new Array<Array<XSubmapModel>> ();
			for (i = 0; i < __submapRows; i++) {
				this.m_XSubmaps.push (null);
			}
			this.m_visible = true;
			this.m_scale = 1.0;
			this.m_regX = 0.0;
			this.m_regY = 0.0;
			this.m_name = "layer" + __layer;
			this.m_grid = false;
			this.m_retrievedSubmaps = new Array<XSubmapModel> ();
			this.m_retrievedItems = new Array<XMapItemModel> ();
	
			for (__row = 0; __row < __submapRows; __row++) {
				this.m_XSubmaps[__row] = new Array<XSubmapModel> ();
				for (i = 0; i < __submapCols; i++) {
					this.m_XSubmaps[__row].push (null);
				}
				
				for (__col = 0; __col < __submapCols; __col++) {
					this.m_XSubmaps[__row][__col] = new XSubmapModel (this, __col, __row, this.m_submapWidth, this.m_submapHeight);
				}
			}
			
			this.m_persistentStorage = new Map<number, any> ();
			
			this.m_classNames = new XReferenceNameToIndex ();
			this.m_imageClassNames = new Map<string, number> (); 
			
			this.m_itemInuse = new Map<number, number> (); 
			
			this.m_viewPort = new XRect ();
			this.m_startingViewPort = new XRect ();
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			var __row:number;
			var __col:number;
			
			for (__row = 0; __row < this.m_submapRows; __row++) {
				for (__col = 0; __col < this.m_submapCols; __col++) {
					var __submap:XSubmapModel = this.m_XSubmaps[__row][__col];
					
					if (__submap != null) {
						__submap.cleanup ();
						
						this.m_XSubmaps[__row][__col] = null;
					}
				}
			}
		}

//------------------------------------------------------------------------------------------
		public setParent (__XMap:XMapModel):void {
			this.m_XMap = __XMap;
		}

//------------------------------------------------------------------------------------------
		public getXMapModel ():XMapModel {
			return this.m_XMap;
		}

//------------------------------------------------------------------------------------------
		public get useArrayItems ():boolean {
			return this.m_XMap.useArrayItems;
		}
		
		public set_useArrayItems (__val:boolean): void {			
		}
			
//------------------------------------------------------------------------------------------
		public setViewPort (__viewPort:XRect):void {
			this.m_viewPort = __viewPort;
		}
		
//------------------------------------------------------------------------------------------
		public getStartingViewPort ():XRect {
			return this.m_startingViewPort;
		}
		
//------------------------------------------------------------------------------------------
		public get viewPort ():XRect {
			return this.m_viewPort;
		}
		
		public set viewPort (__val:XRect) {
			this.m_viewPort = __val;		
		}

//------------------------------------------------------------------------------------------
		public get visible ():boolean {
			return this.m_visible;
		}

		public set visible (__val:boolean) {
			this.m_visible = __val;			
		}
	
//------------------------------------------------------------------------------------------
		public get scale ():number {
			return this.m_scale;
		}
		
		public set scale (__val:number) {
			this.m_scale = __val;			
		}
		
//------------------------------------------------------------------------------------------
		public get regX ():number {
			return this.m_regX;
		}
		
		public set regX (__val:number) {
			this.m_regX = __val;		
		}
		
//------------------------------------------------------------------------------------------
		public get regY ():number {
			return this.m_regY;
		}
		
		public set regY (__val:number) {
			this.m_regY = __val;			
		}
		
//------------------------------------------------------------------------------------------
		public get name ():string {
			return this.m_name;
		}

		public set_name (__val:string) {
			this.m_name = __val;		
		}
	
//------------------------------------------------------------------------------------------
		public get grid ():boolean {
			return this.m_grid;
		}

		public set grid (__val:boolean) {
			this.m_grid = __val;			
		}

//------------------------------------------------------------------------------------------
		public getPersistentStorage ():Map<number, any> {
			return this.m_persistentStorage;
		}
		
//------------------------------------------------------------------------------------------
		public getSubmapRows ():number {
			return this.m_submapRows;
		}
		
//------------------------------------------------------------------------------------------
		public getSubmapCols ():number {
			return this.m_submapCols;
		}
		
//------------------------------------------------------------------------------------------
		public getSubmapWidth ():number {
			return this.m_submapWidth;
		}	
		
//------------------------------------------------------------------------------------------
		public getSubmapHeight ():number {
			return this.m_submapHeight;
		}
	
//------------------------------------------------------------------------------------------
		public getItemInuse (__id:number):number {
			/*
			if (m_itemInuse[__id] == null) {
				m_itemInuse[__id] = 0;
			}

			return m_itemInuse[__id];
			*/
			
			if (!this.m_itemInuse.has (__id)) {
				this.m_itemInuse.set (__id, 0);
			}
			
			return this.m_itemInuse.get (__id);
		}
		
//------------------------------------------------------------------------------------------
		public setItemInuse (__id:number, __inuse:number):void {
			/*
			if (m_itemInuse[__id] == null) {
				m_itemInuse[__id] = 0;
			}
			
			if (__inuse == 0) {
				delete m_itemInuse[__id];
			}
			else
			{
				m_itemInuse[__id] = __inuse;
			}
			*/
			
			if (!this.m_itemInuse.has (__id)) {
				this.m_itemInuse.set (__id, 0);
			}
			
			if (__inuse == 0) {
				this.m_itemInuse.delete (__id);
			}
			else
			{
				this.m_itemInuse.set (__id, __inuse);
			}
		}
		
//------------------------------------------------------------------------------------------
		public addItem (__item:XMapItemModel):XMapItemModel {
			var __c1:number, __r1:number, __c2:number, __r2:number;
			
			var __id:number = __item.getID ();
			
			if (__id == -1) {
// obtain unique ID for this item			
				__id = this.generateID ();
				
				__item.setID (__id);
			}
			
			var r:XRect = __item.boundingRect.cloneX ();
			r.offset (__item.x, __item.y);
			
// determine submaps that the item straddles
			__c1 = Math.floor (r.left/this.m_submapWidth);
			__r1 = Math.floor (r.top/this.m_submapHeight);
			
			__c2 = Math.floor (r.right/this.m_submapWidth);
			__r2 = Math.floor (r.bottom/this.m_submapHeight);

			console.log (": -----------------------: ");
			console.log (": XXMapLayerModel: addItem: ", __id);
			console.log (": x, y: ", __item.x, __item.y);
			console.log (": ", r.left, r.top, r.right, r.bottom);
			console.log (": ", __c1, __r1, __c2, __r2);
			
			__c1 = XType.max (__c1, 0);
			__c2 = XType.max (__c2, 0);
			__r1 = XType.max (__r1, 0);
			__r2 = XType.max (__r2, 0);
			
			__c1 = XType.min (__c1, this.m_submapCols-1);
			__c2 = XType.min (__c2, this.m_submapCols-1);
			__r1 = XType.min (__r1, this.m_submapRows-1);
			__r2 = XType.min (__r2, this.m_submapRows-1);
			
			/*
// ul
			m_XSubmaps[__r1][__c1].addItem (__item);
// ur
			m_XSubmaps[__r1][__c2].addItem (__item);
// ll
			m_XSubmaps[__r2][__c1].addItem (__item);
// lr
			m_XSubmaps[__r2][__c2].addItem (__item);
			*/
			
			var __r:number;
			var __c:number;
			
			for (__r = __r1; __r < __r2+1; __r++) {
				for (__c = __c1; __c < __c2+1; __c++) {
					this.m_XSubmaps[__r][__c].addItem (__item);
				}
			}
			
			this.trackItem (__item);
			
			return __item;
		}

//------------------------------------------------------------------------------------------
		public replaceItems (__item:XMapItemModel):Array<XMapItemModel> {
			var __c1:number, __r1:number, __c2:number, __r2:number;
			
			var __id:number = __item.getID ();
			
			if (__id == -1) {
				// obtain unique ID for this item			
				__id = this.generateID ();
				
				__item.setID (__id);
			}
			
			var __removedItems:Array<XMapItemModel> = new Array<XMapItemModel> ();
			
			var r:XRect = __item.boundingRect.cloneX ();
			r.offset (__item.x, __item.y);
			
			// determine submaps that the item straddles
			__c1 = Math.floor (r.left/this.m_submapWidth);
			__r1 = Math.floor (r.top/this.m_submapHeight);
			
			__c2 = Math.floor (r.right/this.m_submapWidth);
			__r2 = Math.floor (r.bottom/this.m_submapHeight);
			
			console.log (": -----------------------: ");
			console.log (": XXMapLayerModel: replaceItems: ", __id);
			console.log (": x, y: ", __item.x, __item.y);
			console.log (": ", r.left, r.top, r.right, r.bottom);
			console.log (": ", __c1, __r1, __c2, __r2);
			
			__c1 = XType.max (__c1, 0);
			__c2 = XType.max (__c2, 0);
			__r1 = XType.max (__r1, 0);
			__r2 = XType.max (__r2, 0);
			
			__c1 = XType.min (__c1, this.m_submapCols-1);
			__c2 = XType.min (__c2, this.m_submapCols-1);
			__r1 = XType.min (__r1, this.m_submapRows-1);
			__r2 = XType.min (__r2, this.m_submapRows-1);
			
			function __extend (__items:Array<XMapItemModel> /* <XMapItemModel> */):void {
				var __item:XMapItemModel;
				
				var i:number;
				
				//				for each (var __item:XMapItemModel in __items) {
				for (i = 0; i < __items.length; i++) {
					__item =__items[i] as XMapItemModel;
					
					if (__removedItems.indexOf (__item) == -1) {
						__removedItems.push (__item);
					}
				}
			}
			
			// ul
			__extend (this.m_XSubmaps[__r1][__c1].replaceItems (__item));
			// ur
			__extend (this.m_XSubmaps[__r1][__c2].replaceItems (__item));
			// ll
			__extend (this.m_XSubmaps[__r2][__c1].replaceItems (__item));
			// lr
			__extend (this.m_XSubmaps[__r2][__c2].replaceItems (__item));
			
			this.trackItem (__item);
			
			return __removedItems;
		}
		
//------------------------------------------------------------------------------------------
		public removeItem (__item:XMapItemModel):void {		
//			if (!m_items.exists (__item)) {
//				return;
//			}
			
			var __c1:number, __r1:number, __c2:number, __r2:number;
		
			var r:XRect = __item.boundingRect.cloneX ();
			r.offset (__item.x, __item.y);
			
// determine submaps that the item straddles
			__c1 = Math.floor (r.left/this.m_submapWidth);
			__r1 = Math.floor (r.top/this.m_submapHeight);
			
			__c2 = Math.floor (r.right/this.m_submapWidth);
			__r2 = Math.floor (r.bottom/this.m_submapHeight);

			__c1 = XType.max (__c1, 0);
			__c2 = XType.max (__c2, 0);
			__r1 = XType.max (__r1, 0);
			__r2 = XType.max (__r2, 0);
			
			__c1 = XType.min (__c1, this.m_submapCols-1);
			__c2 = XType.min (__c2, this.m_submapCols-1);
			__r1 = XType.min (__r1, this.m_submapRows-1);
			__r2 = XType.min (__r2, this.m_submapRows-1);
			
			/*
// ul
			m_XSubmaps[__r1][__c1].removeItem (__item);
// ur
			m_XSubmaps[__r1][__c2].removeItem (__item);
// ll
			m_XSubmaps[__r2][__c1].removeItem (__item);
// lr
			m_XSubmaps[__r2][__c2].removeItem (__item);
			*/
	
			var __r:number;
			var __c:number;
			
			for (__r = __r1; __r < __r2+1; __r++) {
						for (__c = __c1; __c < __c2+1; __c++) {
					this.m_XSubmaps[__r][__c].removeItem (__item);
				}
			}
			
			this.untrackItem (__item);
		}
				
//------------------------------------------------------------------------------------------
		public addItemAsTile (__item:XMapItemModel):void {
			var __c:number = Math.floor (__item.x / this.m_submapWidth);
			var __r:number = Math.floor (__item.y / this.m_submapHeight);
			
			this.m_XSubmaps[__r][__c].addItemAsTile (__item);
		}
		
//------------------------------------------------------------------------------------------
		public getSubmapsAt (
				__x1:number, __y1:number,
				__x2:number, __y2:number
				):Array<XSubmapModel> {
					
			var __c1:number, __r1:number, __c2:number, __r2:number;
	
// determine submaps that the rect straddles
			__c1 = Math.floor (__x1/this.m_submapWidth);
			__r1 = Math.floor (__y1/this.m_submapHeight);
			
			__c2 = Math.floor (__x2/this.m_submapWidth);
			__r2 = Math.floor (__y2/this.m_submapHeight);

			var __row:number, __col:number;
						
//			var __submaps:Array = new Array ();
//			m_retrievedSubmaps.length = 0;
			XType.clearArray (this.m_retrievedSubmaps);
			
			__c1 = XType.max (__c1, 0);
			__c2 = XType.min (__c2, this.m_submapCols-1);
			__r1 = XType.max (__r1, 0);
			__r2 = XType.min (__r2, this.m_submapRows-1);
									
			var push:number = 0;
			
			for (__row = __r1; __row < __r2+1; __row++) {
				for (__col = __c1; __col < __c2+1; __col++) {
					this.m_retrievedSubmaps[push++] = ( this.m_XSubmaps[__row][__col] );
				}
			}
												
			return this.m_retrievedSubmaps;
		}	
		
//------------------------------------------------------------------------------------------
		public getItemsAt (
				__x1:number, __y1:number,
				__x2:number, __y2:number
				):Array<XMapItemModel> /* <XMapItemModel> */ {
			
			if (this.useArrayItems) {
				return this.getArrayItemsAt (__x1, __y1, __x2, __y2);
			}
			
			var submaps:Array<XSubmapModel> = this.getSubmapsAt (__x1, __y1, __x2, __y2);
			
			var i:number;
			var src_items:Map<XMapItemModel, number>;  // <XMapItemModel, Int>
//			var dst_items:Array = new Array ();
//			m_retrievedItems.length = 0;
			XType.clearArray (this.m_retrievedItems);
			var x:any;
			var item:XMapItemModel;
			
			var __x:number, __y:number;
			var b:XRect;
						
			var push:number = 0;
			
            var i:number;

			for (i = 0; i < this.submaps.length; i++) {
				src_items = submaps[i].items ();
											
				XType.forEach (src_items, 
					 (x:any) => {
						item = x as XMapItemModel;
						
						b = item.boundingRect; __x = item.x; __y = item.y;
						
						if (
							!(__x2 < b.left + __x || __x1 > b.right + __x ||
							  __y2 < b.top + __y || __y1 > b.bottom + __y)
							) {
								
//							if (!(item in dst_items)) {
								this.m_retrievedItems[push++] = (item);
//							}
						}
					}
				);
			}
			
			return this.m_retrievedItems;		
		}

//------------------------------------------------------------------------------------------
		public getArrayItemsAt (
			__x1:number, __y1:number,
			__x2:number, __y2:number
		):Array<XMapItemModel> /* <XMapItemModel> */ {
			
			var submaps:Array<XSubmapModel> /* <XSubmapModel> */ = this.getSubmapsAt (__x1, __y1, __x2, __y2);
			
			var i:number;
			var src_items:Array<XMapItemModel>;
//			var dst_items:Array = new Array ();
//			m_retrievedItems.length = 0;
			XType.clearArray (this.m_retrievedItems);
			var item:XMapItemModel;
			
			var __length:number;
			var __x:number, __y:number;
			var b:XRect;
			
			var push:number = 0;
			
			for (i = 0; i < this.submaps.length; i++) {
				src_items = submaps[i].arrayItems ();
				
				__length = src_items.length;
				
                var x:number;

				for (x = 0; x < __length; x++) {
					item = src_items[x];
						
					b = item.boundingRect; __x = item.x; __y = item.y;
						
					if (
						!(__x2 < b.left + __x || __x1 > b.right + __x ||
						__y2 < b.top + __y || __y1 > b.bottom + __y)
					) {
							
//						if (!(item in dst_items)) {
							this.m_retrievedItems[push++] = (item);
//						}
					}
				}
			}
			
			return this.m_retrievedItems;		
		}
		
//------------------------------------------------------------------------------------------
		public getItemsAtCX (
				__x1:number, __y1:number,
				__x2:number, __y2:number
				):Array<XMapItemModel> {
			
			if (this.useArrayItems) {
				return this.getArrayItemsAtCX (__x1, __y1, __x2, __y2);
			}
			
			__x2--; __y2--;
			
			var submaps:Array<XSubmapModel> = this.getSubmapsAt (__x1, __y1, __x2, __y2);
							
			var i:number;
			var src_items:Map<XMapItemModel, number>;
			var dst_items:Array<XMapItemModel> = new Array<XMapItemModel> ();
			var x:any;
			var item:XMapItemModel;

			console.log (": ---------------------: ");	
			console.log (": getItemsAt: submaps: ", submaps.length);
			console.log (": ---------------------: ");
				
			for (i = 0; i < submaps.length; i++) {
				src_items = submaps[i].items ();
								
				XType.forEach (src_items, 
					(x:any) => {
						item = x as XMapItemModel;
				
						var cx:XRect = item.collisionRect.cloneX ();
						cx.offset (item.x, item.y);
						
						if (
							!(__x2 < cx.left || __x1 > cx.right - 1 ||
							  __y2 < cx.top || __y1 > cx.bottom - 1)
							) {
								
							if (dst_items.indexOf (item) == -1) {
								dst_items.push (item);
							}
						}
					}
				);
			}
			
			return dst_items;		
		}

//------------------------------------------------------------------------------------------
		public getArrayItemsAtCX (
			__x1:number, __y1:number,
			__x2:number, __y2:number
		):Array<XMapItemModel> {
			
			__x2--; __y2--;
			
			var submaps:Array<XSubmapModel> = this.getSubmapsAt (__x1, __y1, __x2, __y2);
			
			var i:number;
			var src_items:Array<XMapItemModel>;
			var dst_items:Array<XMapItemModel> = new Array<XMapItemModel> ();
			var item:XMapItemModel;

			var __length:number;
			
			console.log (": ---------------------: ");	
			console.log (": getItemsAt: submaps: ", submaps.length);
			console.log (": ---------------------: ");
			
			for (i = 0; i < submaps.length; i++) {
				src_items = submaps[i].arrayItems ();
				
				__length = src_items.length;
				
                var x:number;

				for (x = 0; x < __length; x++) {
					item = src_items[x];
					
					var cx:XRect = item.collisionRect.cloneX ();
					cx.offset (item.x, item.y);
						
					if (
						!(__x2 < cx.left || __x1 > cx.right - 1 ||
						__y2 < cx.top || __y1 > cx.bottom - 1)
					) {
							
						if (dst_items.indexOf (item) == -1) {
							dst_items.push (item);
						}
					}
				}
			}
			
			return dst_items;		
		}
		
//------------------------------------------------------------------------------------------
		public getTiles (
			c1:number, r1:number,
			c2:number, r2:number
		):Array<Array<any>> {
			
			// tile array to return
			var tiles:Array<Array<any>>;
			
			// col, row divisor
			var row8:number = Math.floor (this.m_submapHeight/XSubmapModel.TX_TILE_HEIGHT);
			var col8:number = Math.floor (this.m_submapWidth/XSubmapModel.TX_TILE_WIDTH);
			
			// col, row mask for the submap
			var rowMask:number = Math.floor (row8-1);
			var colMask:number = Math.floor (col8-1);
			
			// total columns wide, rows high
			var cols:number = c2-c1+1;
			var rows:number = r2-r1+1;
			
			tiles = new Array<Array<any>> ();

            var i:number;

			for (i = 0; i < cols * rows; i++) {
				tiles.push ([-1, 0]);
			}
			
            var row:number, col:number;

			for (row = r1; row < r2+1; row++) {
				var submapRow:number = Math.floor (row/row8);
				
				if (submapRow >=  0 && submapRow < 64) 
				for (col = c1; col < c2+1; col++) {
					var dstCol:number = col-c1, dstRow:number = row-r1;
					
					var submapCol:number = Math.floor (col/col8);
					
					if (submapCol >= 0 && submapCol < 64)
					tiles[dstRow * cols + dstCol] =
						this.m_XSubmaps[submapRow][submapCol].getTile (col & colMask, row & rowMask);
				}
			}
			
			return tiles;
		}
		
//------------------------------------------------------------------------------------------
		public setTiles (
			tiles:Array<Array<any>>,
			c1:number, r1:number,
			c2:number, r2:number
		):void {
			// col, row divisor
			var row8:number = Math.floor (this.m_submapHeight/XSubmapModel.TX_TILE_HEIGHT);
			var col8:number = Math.floor (this.m_submapWidth/XSubmapModel.TX_TILE_WIDTH);
			
			// col, row mask for the submap
			var rowMask:number = Math.floor (row8-1);
			var colMask:number = Math.floor (col8-1);
			
			// total columns wide, rows high
			var cols:number = c2-c1+1;
			var rows:number = r2-r1+1;
			
            var row:number, col:number;

			for (row = r1; row < r2+1; row++) {
				var submapRow:number = Math.floor (row/row8);
				
				if (submapRow >=  0 && submapRow < 64) 
				for (col = c1; col < c2+1; col++) {
					var dstCol:number = col-c1, dstRow:number = row-r1;
					
					var submapCol:number = Math.floor (col/col8);
					
					if (submapCol >= 0 && submapCol < 64)
					this.m_XSubmaps[submapRow][submapCol].setTile (
						tiles[dstRow * cols + dstCol],
						col & colMask, row & rowMask
					);
				}
			}
		}
		
		//------------------------------------------------------------------------------------------
		public eraseWithTiles (
			tiles:Array<Array<any>>,
			c1:number, r1:number,
			c2:number, r2:number
		):void {
			// col, row divisor
			var row8:number = Math.floor (this.m_submapHeight/XSubmapModel.TX_TILE_HEIGHT);
			var col8:number = Math.floor (this.m_submapWidth/XSubmapModel.TX_TILE_WIDTH);
			
			// col, row mask for the submap
			var rowMask:number = Math.floor (row8-1);
			var colMask:number = Math.floor (col8-1);
			
			// total columns wide, rows high
			var cols:number = c2-c1+1;
			var rows:number = r2-r1+1;
			
            var row:number, col:number;

			for (row = r1; row < r2+1; row++) {
				var submapRow:number = Math.floor (row/row8);
				
				if (submapRow >=  0 && submapRow < 64) 
				for (col = c1; col < c2+1; col++) {
					var dstCol:number = col-c1, dstRow:number = row-r1;
					
					var submapCol:number = Math.floor (col/col8);
					
					if (submapCol >= 0 && submapCol < 64)
					this.m_XSubmaps[submapRow][submapCol].setTile (
						[-1, 0],
						col & colMask, row & rowMask
					);
				}
			}
		}
		
//------------------------------------------------------------------------------------------
		public getCXTiles (
			c1:number, r1:number,
			c2:number, r2:number
		):Array<number> {
			
// tile array to return
			var tiles:Array<number>; // <Int>

// col, row divisor
			var row32:number = Math.floor (this.m_submapHeight/XSubmapModel.CX_TILE_HEIGHT);
			var col32:number = Math.floor (this.m_submapWidth/XSubmapModel.CX_TILE_WIDTH);

// col, row mask for the submap
			var rowMask:number = Math.floor (row32-1);
			var colMask:number = Math.floor (col32-1);
			
// total columns wide, rows high
			var cols:number = c2-c1+1;
			var rows:number = r2-r1+1;

			tiles = new Array<number> ();

            var i:number;

			for (i = 0; i < cols * rows; i++ ) {
				tiles.push (0);
			}
			
            var row:number, col:number;
            
			for (row = r1; row < r2+1; row++) {
				var submapRow:number = Math.floor (row/row32);
			
				if (submapRow >=  0 && submapRow < 64) 
				for (col = c1; col < c2+1; col++) {
					var dstCol:number = col-c1, dstRow:number = row-r1;
					
					var submapCol:number = Math.floor (col/col32);
				
					if (submapCol >= 0 && submapCol < 64)
					tiles[dstRow * cols + dstCol] =
						this.m_XSubmaps[submapRow][submapCol].getCXTile (col & colMask, row & rowMask);
				}
			}
			
			return tiles;
		}

//------------------------------------------------------------------------------------------
		public setCXTiles (
			tiles:Array<number>,
			c1:number, r1:number,
			c2:number, r2:number
		):void {
// col, row divisor
			var row32:number = Math.floor (this.m_submapHeight/XSubmapModel.CX_TILE_HEIGHT);
			var col32:number = Math.floor (this.m_submapWidth/XSubmapModel.CX_TILE_WIDTH);

// col, row mask for the submap
			var rowMask:number = Math.floor (row32-1);
			var colMask:number = Math.floor (col32-1);
			
// total columns wide, rows high
			var cols:number = c2-c1+1;
			var rows:number = r2-r1+1;
	
            var row:number, col:number;
            
			for (row = r1; row < r2+1; row++) {
				var submapRow:number = Math.floor (row/row32);
				
				if (submapRow >=  0 && submapRow < 64) 
				for (col = c1; col < c2+1; col++) {
					var dstCol:number = col-c1, dstRow:number = row-r1;
					
					var submapCol:number = Math.floor (col/col32);
								
					if (submapCol >= 0 && submapCol < 64)				
					this.m_XSubmaps[submapRow][submapCol].setCXTile (
						tiles[dstRow * cols + dstCol],
						col & colMask, row & rowMask
					);
				}
			}
		}
		
//------------------------------------------------------------------------------------------
		public eraseWithCXTiles (
			tiles:Array<number>,
			c1:number, r1:number,
			c2:number, r2:number
		):void {
// col, row divisor
			var row32:number = Math.floor (this.m_submapHeight/XSubmapModel.CX_TILE_HEIGHT);
			var col32:number = Math.floor (this.m_submapWidth/XSubmapModel.CX_TILE_WIDTH);

// col, row mask for the submap
			var rowMask:number = Math.floor (row32-1);
			var colMask:number = Math.floor(col32-1);
					
// total columns wide, rows high
			var cols:number = c2-c1+1;
			var rows:number = r2-r1+1;
	
            var row:number, col:number;

			for (row = r1; row < r2+1; row++) {
				var submapRow:number = Math.floor (row/row32);
				
				if (submapRow >=  0 && submapRow < 64) 
				for (col = c1; col < c2+1; col++) {
					var dstCol:number = col-c1, dstRow:number = row-r1;
					
					var submapCol:number = Math.floor (col/col32);
								
					if (submapCol >= 0 && submapCol < 64)				
					this.m_XSubmaps[submapRow][submapCol].setCXTile (
						XSubmapModel.CX_EMPTY,
						col & colMask, row & rowMask
					);
				}
			}
		}
		
//------------------------------------------------------------------------------------------
		public updateItem (__item:XMapItemModel):void {
		}
		
//------------------------------------------------------------------------------------------
		public generateID ():number {
			this.m_currID += 1;
			
			return this.m_currID;
		}
				
//------------------------------------------------------------------------------------------
		public items0 ():Map<XMapItemModel, number> {
			return this.m_items;
		}
		
//------------------------------------------------------------------------------------------
		public ids ():Map<number, XMapItemModel>  {
			return this.m_ids;
		}
		
//------------------------------------------------------------------------------------------
		public submaps ():Array<Array<XSubmapModel>> {
			return this.m_XSubmaps;
		}
		
//------------------------------------------------------------------------------------------
		public ___getItemId___ (__item:XMapItemModel):number {
			return this.m_items.get (__item);
		}	
		
//------------------------------------------------------------------------------------------
		public ___getIdItem___ (__id:number):XMapItemModel {
			return this.m_ids.get (__id);
		}

//------------------------------------------------------------------------------------------
		public trackItem (__item:XMapItemModel):void {
			this.m_items.set (__item, __item.id);
			this.m_ids.set (__item.id, __item);
		}
		
//------------------------------------------------------------------------------------------
		public untrackItem (__item:XMapItemModel):void {
			this.m_items.delete (__item);
			this.m_ids.delete (__item.id);
		}
		
//------------------------------------------------------------------------------------------
		public getClassNameFromIndex (__index:number):string {
			return this.m_classNames.getReferenceNameFromIndex (__index);
		}

//------------------------------------------------------------------------------------------
		public getIndexFromClassName (__className:string):number {
			return this.m_classNames.getIndexFromReferenceName (__className);
		}

//------------------------------------------------------------------------------------------
		public removeIndexFromClassNames (__index:number):void {
			this.m_classNames.removeIndexFromReferenceNames (__index);
		}

//------------------------------------------------------------------------------------------
		public getAllClassNames ():Array<string> {
			return this.m_classNames.getAllReferenceNames ();
		}

//------------------------------------------------------------------------------------------
		public getClassNames ():XReferenceNameToIndex {
			return this.m_classNames;
		}

//------------------------------------------------------------------------------------------
		public getImageClassNames ():Map<string, number> {
			return this.m_imageClassNames;
		}

//------------------------------------------------------------------------------------------
		public lookForItem (__itemName:string, __list:Map<number, XMapItemModel>=null):Map<number, XMapItemModel>  {
			var __row:number, __col:number;
			
			if (__list == null) {
				__list = new Map<number, XMapItemModel> ();
			}
		
			for (__row = 0; __row < this.m_submapRows; __row++) {
				for (__col = 0; __col < this.m_submapCols; __col++) {
					this.m_XSubmaps[__row][__col].iterateAllItems (
						(x:any) => {
							var __item:XMapItemModel = x as XMapItemModel;
								
							if (__item.XMapItem == __itemName) {
								__list.set (__item.id, __item);
							}
						}
					);
				}
			}
			
			return __list;	
		}

//------------------------------------------------------------------------------------------
		public iterateAllSubmaps (__iterationCallback:any):void {
			var __row:number, __col:number;
			
			for (__row = 0; __row < this.m_submapRows; __row++) {
				for (__col = 0; __col < this.m_submapCols; __col++) {
					__iterationCallback (this.m_XSubmaps[__row][__col], __row, __col);
				}
			}				
		}
		
//------------------------------------------------------------------------------------------
		public serialize (__xml:XSimpleXMLNode):XSimpleXMLNode {
			var __attribs:Array<any> = [
				"vx",			this.viewPort.x,
				"vy",			this.viewPort.y,
				"vw",			this.viewPort.width,
				"vh",			this.viewPort.height,
				"layer",		this.m_layer,
				"submapRows",	this.m_submapRows,
				"submapCols",	this.m_submapCols,
				"submapWidth",	this.m_submapWidth,
				"submapHeight",	this.m_submapHeight,
				"currID",		this.m_currID,
				"visible", 		this.m_visible,
				"scale",		this.m_scale,
				"regX",			this.m_regX,
				"regY",			this.m_regY,
				"name",			this.m_name,
				"grid", 		this.m_grid,
			];

			__xml = __xml.addChildWithParams ("XLayer", "", __attribs);
	
			__xml.addChildWithXMLNode (this.serializeImageClassNames ());
			__xml.addChildWithXMLNode (this.m_classNames.serialize ());
			__xml.addChildWithXMLNode (this.serializeItems ());
			__xml.addChildWithXMLNode (this.serializeSubmaps ());

			return __xml;
		}

//------------------------------------------------------------------------------------------
		public serializeItems ():XSimpleXMLNode {
			var xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			xml.setupWithParams ("items", "", []);
		
			return xml;
		}
		
//------------------------------------------------------------------------------------------
		public serializeSubmaps ():XSimpleXMLNode {
			var xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			xml.setupWithParams ("XSubmaps", "", []);
			
			var __row:number, __col:number;
			var __x1:number, __y1:number, __x2:number, __y2:number;
			
			this.cullUnneededItems ();
			
			for (__row = 0; __row < this.m_submapRows; __row++) {
				__y1 = __row * this.m_submapHeight;
				__y2 = __y1 + this.m_submapHeight-1;
				
				for (__col = 0; __col < this.m_submapCols; __col++) {
					__x1 = __col * this.m_submapWidth;
					__x2 = __x1 + this.m_submapWidth-1;
					
					var submaps:Array<XSubmapModel> = this.getSubmapsAt (__x1, __y1, __x2, __y2);
					
					if (submaps.length == 1) {
						var submap:XSubmapModel = submaps[0] as XSubmapModel;
						
						if (this.submapIsNotEmpty (submap)) {
							xml.addChildWithXMLNode (submap.serializeRowCol (__row, __col));
						}
					}
				}
			}
			
			return xml;
		}

//------------------------------------------------------------------------------------------
		public serializeImageClassNames ():XSimpleXMLNode {
			var __imageClassNames:Map<string, number> = new Map<string, number> (); 
			
			var __submapRow:number, __submapCol:number;
			var __row:number, __col:number;

			if (this.m_grid) {
				for (__submapRow = 0; __submapRow < this.m_submapRows; __submapRow++) {
					for (__submapCol = 0; __submapCol < this.m_submapCols; __submapCol++) {
						var __XSubmapModel:XSubmapModel = this.m_XSubmaps[__submapRow][__submapCol];
						
						for (__row = 0; __row < __XSubmapModel.tileRows; __row++) {
							for (__col = 0; __col < __XSubmapModel.tileCols; __col++) {
								var __tile:Array<any> = __XSubmapModel.getTile (__col, __row);
								
								if (!(__tile[0] == -1 && __tile[1] == 0)) {
									var __imageClassIndex:number = __tile[0];
									var __imageClassName = this.getClassNameFromIndex (__imageClassIndex);
									if (!__imageClassNames.has (__imageClassName) && __imageClassName.substr (0, 1) != "$") {
										__imageClassNames.set (__imageClassName, 0);
									}
								}
							}
						}
					}
				}				
			} else {
				for (__submapRow = 0; __submapRow < this.m_submapRows; __submapRow++) {
					for (__submapCol = 0; __submapCol > this.m_submapCols; __submapCol++) {
						XType.forEach (this.m_XSubmaps[__submapRow][__submapCol].items (), 
							(__item:XMapItemModel) => {
								__imageClassNames.set (__item.imageClassName, 0);
							}
						);
					}
				}
			}
			
			var __xml:XSimpleXMLNode = new XSimpleXMLNode ();		
			__xml.setupWithParams ("imageClassNames", "", []);
					
			XType.forEach (__imageClassNames, 
			    (__imageClassName:any) => {
					var __attribs:Array<any> = [
						"name",	__imageClassName as string,					
					];
					
					var __className:XSimpleXMLNode = new XSimpleXMLNode ();				
					__className.setupWithParams ("imageClassName", "", __attribs);
					__xml.addChildWithXMLNode (__className);
				}
			);
			
			return __xml;
		}
		
//------------------------------------------------------------------------------------------
		public submapIsNotEmpty (submap:XSubmapModel):boolean {
			var count:number = 0;
					
			XType.forEach (submap.items (), 
				(x:any) => {	
					count++;
				}
			);
			
			return count > 0 || submap.hasTiles () || submap.hasCXTiles ();
		}

//------------------------------------------------------------------------------------------
		public deserialize (__xml:XSimpleXMLNode, __readOnly:boolean=false):void {
			console.log (": [XMapLayer]: deserialize: ", this.m_submapRows, this.m_submapCols);
			
			this.m_viewPort = this.m_startingViewPort = new XRect (
				__xml.getAttributeFloat ("vx"),
				__xml.getAttributeFloat ("vy"),
				__xml.getAttributeFloat ("vw"),
				__xml.getAttributeFloat ("vh")
			);
			
			this.m_layer = __xml.getAttributeInt ("layer");
			this.m_submapRows = XType.max (this.m_submapRows, __xml.getAttributeInt ("submapRows"));
			this.m_submapCols = XType.max (this.m_submapCols, __xml.getAttributeInt ("submapCols"));
			this.m_submapWidth = __xml.getAttributeInt ("submapWidth");
			this.m_submapHeight = __xml.getAttributeInt ("submapHeight");
			this.m_currID = __xml.getAttribute ("currID");
			if (__xml.hasAttribute ("visible")) {
				this.m_visible = __xml.getAttributeBoolean ("visible");
			} else {
				this.m_visible = true;
			}
			if (__xml.hasAttribute ("scale")) {
				this.m_scale = __xml.getAttributeFloat ("scale");
			}
			else
			{
				this.m_scale = 1.0;
			}
			if (__xml.hasAttribute ("regX")) {
				this.m_regX = __xml.getAttributeFloat ("regX");
			} else {
				this.m_regX = 0.0;
			}
			if (__xml.hasAttribute ("regY")) {
				this.m_regY = __xml.getAttributeFloat ("regY");
			} else {
				this.m_regY = 0.0;
			}
			if (__xml.hasAttribute ("name")) {
				this.m_name = __xml.getAttributeString ("name");
			} else {
				this.m_name = "";
			}
			if (__xml.hasAttribute ("grid")) {
				this.m_grid = __xml.getAttributeBoolean ("grid");
			} else {
				this.m_grid = false;
			}	
			
			this.m_persistentStorage = new Map<number, any> ();
			
			this.m_classNames = new XReferenceNameToIndex ();
			this.m_imageClassNames = new Map<string, number> ();

			this.m_itemInuse = new Map<number, number> ();
			
			this.m_items = new Map<XMapItemModel, number> ();
			this.m_ids = new Map<number, XMapItemModel> ();
			this.m_XSubmaps = new Array<Array<XSubmapModel>> ();

            var i:number;

			for (i = 0; i < this.m_submapRows; i++) {
				this.m_XSubmaps.push (null);
			}
			this.m_retrievedSubmaps = new Array<XSubmapModel> ();
			this.m_retrievedItems = new Array<XMapItemModel> ();
			
			this.deserializeImageClassNames (__xml);
			this.m_classNames.deserialize (__xml);
			this.deserializeItems (__xml);
			this.deserializeSubmaps (__xml, __readOnly);
			
			console.log (": --------------------->: XMapLayerModel: deserialize: ", this.m_submapRows, this.m_submapCols);
		}
	
//------------------------------------------------------------------------------------------
		public deserializeItems (__xml:XSimpleXMLNode):void {
		}
		
//------------------------------------------------------------------------------------------
		public deserializeSubmaps (__xml:XSimpleXMLNode, __readOnly:boolean):void {
			console.log (": [XMapLayer]: deserializeSubmaps: ");
			
//------------------------------------------------------------------------------------------
			console.log (": creating XSubmaps: ");
			
			var __row:number;
			var __col:number;
			
			if (__readOnly) {
				var __empty:XSubmapModel = new XSubmapModel (this, 0, 0, this.m_submapWidth, this.m_submapHeight);

				for (__row = 0; __row < this.m_submapRows; __row++) {
					this.m_XSubmaps[__row] = new Array<XSubmapModel> ();
					
					for (__col = 0; __col < this.m_submapCols; __col++) {
						this.m_XSubmaps[__row].push (__empty);
					}
				}
			} else {
				for (__row = 0; __row < this.m_submapRows; __row++) {
					this.m_XSubmaps[__row] = new Array<XSubmapModel> ();
	
					for (__col = 0; __col < this.m_submapCols; __col++) {
						this.m_XSubmaps[__row].push (new XSubmapModel (this, __col,__row, this.m_submapWidth, this.m_submapHeight));
					}
				}
			}
			
//------------------------------------------------------------------------------------------
			console.log (": deserializing XSubmaps: ");
			
			var __xmlList:Array<XSimpleXMLNode>;
			var i:number;
			
			__xmlList = __xml.child ("XSubmaps")[0].child ("XSubmap");
				
			for (i = 0; i < __xmlList.length; i++) {
				var __submapXML:XSimpleXMLNode = __xmlList[i];
				
				__row = __submapXML.getAttributeInt ("row");
				__col = __submapXML.getAttributeInt ("col");
					
				if (__readOnly) {
					this.m_XSubmaps[__row][__col] = new XSubmapModel (this, __col,__row, this.m_submapWidth, this.m_submapHeight);
				}
				
				this.m_XSubmaps[__row][__col].deserializeRowCol (__submapXML);
			}

//------------------------------------------------------------------------------------------
// we're going to assume that we won't need clean-up with using ArrayItems
//------------------------------------------------------------------------------------------
			if (this.useArrayItems) {
				return;
			}
			
//------------------------------------------------------------------------------------------	
// add items to the layer's dictionary
//------------------------------------------------------------------------------------------
			console.log (": adding items: ");
			
			if (this.useArrayItems) {
				var src_items:Array<XMapItemModel>;
				var __length:number;
				
				for (__row = 0; __row < this.m_submapRows; __row++) {
					for (__col = 0; __col < this.m_submapCols; __col++) {
						src_items = this.m_XSubmaps[__row][__col].arrayItems ();
						
						__length = src_items.length;
						
                        var x:number;

						for (x = 0; x < __length; x++) {
							this.trackItem (src_items[x]);
						}
					}
				}				
			} else {
				for (__row = 0; __row < this.m_submapRows; __row++) {
					for (__col = 0; __col < this.m_submapCols; __col++) {
						XType.forEach (this.m_XSubmaps[__row][__col].items (), 
							(__item:any) => {
								this.trackItem (__item);
							}
						);
					}
				}
			}
			
//------------------------------------------------------------------------------------------
			this.cullUnneededItems ();
		}

//------------------------------------------------------------------------------------------
		public deserializeImageClassNames (__xml:XSimpleXMLNode):void {
			if (__xml.child ("imageClassNames").length == 0) {
				return;
			}

			var __xmlList:Array<XSimpleXMLNode> = __xml.child ("imageClassNames")[0].child ("imageClassName");

			var __name:string;	
			var i:number;
		
			for (i = 0; i < __xmlList.length; i++) {
				__name = __xmlList[i].getAttributeString ("name");
				
				console.log (": deserializeImageClassName: ", __name);
				
				this.m_imageClassNames.set (__name, 0);
			}
		}
		
//------------------------------------------------------------------------------------------
		public cullUnneededItems ():void {
			var __row:number;
			var __col:number;
			var __submapRect:XRect; 
										
			for (__row = 0; __row < this.m_submapRows; __row++) {
				for (__col = 0; __col < this.m_submapCols; __col++) {
					__submapRect = new XRect (
						__col * this.m_submapWidth, __row * this.m_submapHeight,
						this.m_submapWidth, this.m_submapHeight
					);
							
					XType.forEach (this.m_XSubmaps[__row][__col].items (), 
						(__item:XMapItemModel) => {			
							var __itemRect:XRect = __item.boundingRect.cloneX ();
							__itemRect.offset (__item.x, __item.y);
							
							console.log (": submapRect, itemRect: ", __item.id, __submapRect, __itemRect, __submapRect.intersects (__itemRect));
							
							if (!__submapRect.intersects (__itemRect)) {
								this.m_XSubmaps[__row][__col].removeItem (__item);
							}
						}
					);
				}
			}		
		}
			
//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
