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
    import { XRect } from '../geom/XRect';
    import { XMapModel } from './XMapModel';
    import { XType } from '../type/XType';
    import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
    import { XModelBase } from '../model/XModelBase';
    import { XMapItemModel } from './XMapItemModel';
    import { XMapLayerModel } from './XMapLayerModel';
    import { XSubObjectPoolManager } from '../pool/XSubObjectPoolManager';
    import { XReferenceNameToIndex } from '../utils/XReferenceNameToIndex';

//------------------------------------------------------------------------------------------	
	export class XSubmapModel extends XModelBase {
		private m_XMapLayer:XMapLayerModel;
			
		private m_submapWidth:number;
		private m_cols:number;
		
		private m_submapHeight:number;
		private m_rows:number;
		
		private m_col:number;
		private m_row:number;
		
		private m_cmap:Array<number>;
		private m_inuse:number;
		
		private m_tileCols:number;
		private m_tileRows:number;
		
		private m_submapWidthMask:number;
		private m_submapHeightMask:number;
		
		private m_tmap:Array<Array<any>>;
		
		private m_boundingRect:XRect;
		
		private m_src:XRect;
		private m_dst:XRect;

		private m_items:Map<XMapItemModel, number>;
		private m_arrayItems:Array<XMapItemModel>;
		private m_arrayItemIndex:number;
		
		private m_XMapItemModelPoolManager:XSubObjectPoolManager;
		private m_XRectPoolManager:XSubObjectPoolManager;
			
		// empty
		public static CX_EMPTY:number = 0;
		
		// solid solid
		public static CX_SOLID:number = 1;
		
		// soft
		public static CX_SOFT:number = 2;	
		
		// jump thru
		public static CX_JUMP_THRU:number = 3;
		
		// 45 degree diagonals
		public static CX_UL45:number = 4;
		public static CX_UR45:number = 5;
		public static CX_LL45:number = 6;
		public static CX_LR45:number = 7;
		
		// 22.5 degree diagonals
		public static CX_UL225A:number = 8;
		public static CX_UL225B:number = 9;
		public static CX_UR225A:number = 10;
		public static CX_UR225B:number = 11;
		public static CX_LL225A:number = 12;
		public static CX_LL225B:number = 13;
		public static CX_LR225A:number = 14;
		public static CX_LR225B:number = 15;
		
		// 67.5 degree diagonals
		public static CX_UL675A:number = 16;
		public static CX_UL675B:number = 17;
		public static CX_UR675A:number = 18;
		public static CX_UR675B:number = 19;
		public static CX_LL675A:number = 20;
		public static CX_LL675B:number = 21;
		public static CX_LR675A:number = 22;
		public static CX_LR675B:number = 23;
		
		// soft tiles
		public static CX_SOFTLF:number = 24;
		public static CX_SOFTRT:number = 25;
		public static CX_SOFTUP:number = 26;
		public static CX_SOFTDN:number = 27;
		
		// special solids
		public static CX_SOLIDX001:number = 28;
		
		// death
		public static CX_DEATH:number = 29;
		
		// ice
		public static CX_ICE:number = 30;
		
		// max
		public static CX_MAX:number = 31;
		
		// collision tile width, height
		public static CX_TILE_WIDTH:number = 16;
		public static CX_TILE_HEIGHT:number = 16;
		
		public static CX_TILE_WIDTH_MASK:number = 15;
		public static CX_TILE_HEIGHT_MASK:number = 15;
		
		public static CX_TILE_WIDTH_UNMASK:number = 0xfffffff0;
		public static CX_TILE_HEIGHT_UNMASK:number = 0xfffffff0;
		
		// alternate tile width, height
		public static TX_TILE_WIDTH:number = 64;
		public static TX_TILE_HEIGHT:number = 64;
		
		public static TX_TILE_WIDTH_MASK:number = 63;
		public static TX_TILE_HEIGHT_MASK:number = 63;
		
		public static TX_TILE_WIDTH_UNMASK:number = 0xffffffc0;
		public static TX_TILE_HEIGHT_UNMASK:number = 0xffffffc0;
		
		// (tikiedit) tile width, height
		public static CX_BOTH_WIDTH:number = 64;
		public static CX_BOTH_HEIGHT:number = 64;
		
		public static CX_BOTH_WIDTH_MASK:number = 63;
		public static CX_BOTH_HEIGHT_MASK:number = 63;
		
		public static CX_BOTH_WIDTH_UNMASK:number = 0xffffffc0;
		public static CX_BOTH_HEIGHT_UNMASK:number = 0xffffffc0;
		
		private static CXToChar:string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		
		private static g_empty_cmap:Array<number>;
		private static g_empty_tmap:Array<Array<any>>;
		
//------------------------------------------------------------------------------------------	
		public constructor (
			__XMapLayer:XMapLayerModel,
			__col:number, __row:number,
			__width:number, __height:number
			) {
				
			super ();
			
			var i:number;
			
			this.m_XMapLayer = __XMapLayer;
				
			this.m_submapWidth = __width;
			this.m_submapHeight = __height;
		
			this.m_submapWidthMask = this.m_submapWidth - 1;
			this.m_submapHeightMask = this.m_submapHeight - 1;
			
			this.m_col = __col;
			this.m_row = __row;
		
			this.m_cols = Math.floor (this.m_submapWidth/XSubmapModel.CX_TILE_WIDTH);
			this.m_rows = Math.floor (this.m_submapHeight/XSubmapModel.CX_TILE_HEIGHT);

			this.m_boundingRect = new XRect (0, 0, this.m_submapWidth, this.m_submapHeight);
			
			this.m_tileCols = Math.floor (this.m_submapWidth/XSubmapModel.TX_TILE_WIDTH);
			this.m_tileRows = Math.floor (this.m_submapHeight/XSubmapModel.TX_TILE_HEIGHT);
				
			// create_cmap ();
			// create_tmap ();
			
			if (XSubmapModel.g_empty_cmap == null) {
				XSubmapModel.g_empty_cmap = new Array<number> ();
				
				for (i = 0; i < this.m_cols * this.m_rows; i++) {
					XSubmapModel.g_empty_cmap.push (0);
				}
				
				for (i = 0; i < XSubmapModel.g_empty_cmap.length; i++) {
					XSubmapModel.g_empty_cmap[i] = XSubmapModel.CX_EMPTY;
				}
			}
			
			if (XSubmapModel.g_empty_tmap == null) {
				XSubmapModel.g_empty_tmap = new Array<Array<any>> (); 
				
				for (i = 0; i < this.m_tileCols * this.m_tileRows; i++) {
					XSubmapModel.g_empty_tmap.push([-1, 0]);
				}
			}
			
			this.m_inuse = 0;

			this.m_items = new Map<XMapItemModel, number> (); 
			this.m_arrayItems = new Array<XMapItemModel> ();
			this.m_arrayItemIndex = 0;

			this.m_src = new XRect ();
			this.m_dst = new XRect ();
			
			this.m_XMapItemModelPoolManager = this.m_XMapLayer.getXMapModel ().getXMapItemModelPoolManager ();
			this.m_XRectPoolManager = this.m_XMapLayer.getXMapModel ().getXRectPoolManager ();
		}	

//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}
		
//------------------------------------------------------------------------------------------
		public getLayerModel ():XMapLayerModel {
			return this.m_XMapLayer;
		}
		
//------------------------------------------------------------------------------------------
		public get useArrayItems ():boolean {
			return this.m_XMapLayer.getXMapModel ().useArrayItems;
		}
	
		public set useArrayItems (__val:boolean) {			
		}

//------------------------------------------------------------------------------------------
		private create_cmap ():Array<number> {
			var i:number;
			
			if (this.m_cmap == null) {
				this.m_cmap = new Array<number> ();
				
				for (i = 0; i < this.m_cols * this.m_rows; i++) {
					this.m_cmap.push (0);
				}
				
				for (i = 0; i< this.m_cmap.length; i++) {
					this.m_cmap[i] = XSubmapModel.CX_EMPTY;
				}
			}
			
			return this.m_cmap;
		}
		
//------------------------------------------------------------------------------------------
		public get cmap ():Array<number> {
			if (this.m_cmap == null) {
				return XSubmapModel.g_empty_cmap;
			}
			
			return this.m_cmap;
		}
		
		public set cmap (__val:Array<number>) {	
		}
			
//------------------------------------------------------------------------------------------
		private create_tmap ():Array<Array<any>> {
			var i:number;
				
			if (this.m_tmap == null) {
				this.m_tmap = new Array<Array<any>> (); 
				
				for (i = 0; i < this.m_tileCols * this.m_tileRows; i++) {
					this.m_tmap.push([-1, 0]);
				}
			}
			
			return this.m_tmap;
		}
		
//------------------------------------------------------------------------------------------
		public get tmap ():Array<Array<any>> {
			if (this.m_tmap == null) {
				return XSubmapModel.g_empty_tmap;
			}
			
			return this.m_tmap;
		}
		
		public set tmap (__val:Array<Array<any>>) {		
		}
		
//------------------------------------------------------------------------------------------
		public setTile (__tile:Array<any>, __col:number, __row:number):void {
			this.create_tmap ();
			
			this.m_tmap[__row * this.m_tileCols + __col] = __tile;
		}
		
//------------------------------------------------------------------------------------------
		public getTile (__col:number, __row:number):Array<any> {
			if (this.m_tmap == null) {
				return [-1, 0];
			}
			
			return this.m_tmap[__row * this.m_tileCols + __col];
		}
		
//------------------------------------------------------------------------------------------
		public hasTiles ():boolean {
			var __row:number, __col:number;
			
			if (this.m_tmap != null) {
				for (__row = 0; __row < this.m_tileRows; __row) {
					for (__col = 0; __col < this.m_tileCols; __col++) {
						var __tile:any = this.m_tmap[__row * this.m_tileCols + __col];
						
						if (!(__tile[0] == -1 && __tile[1] == 0)) {
							return true;
						}
					}
				}
			}
			
			return false;
		}
		
//------------------------------------------------------------------------------------------
		public get tileCols ():number {
			return this.m_tileCols;
		}
		
		public set tileCols (__val:number) {		
		}
		
//------------------------------------------------------------------------------------------
		public get tileRows ():number {
			return this.m_tileRows;
		}
		
		public set tileRows (__val:number) {		
		}
		
//------------------------------------------------------------------------------------------
		public setCXTile (__type:number, __col:number, __row:number):void {
			this.create_cmap ();
			
			this.m_cmap[__row * this.m_cols + __col] = __type;
		}
		
//------------------------------------------------------------------------------------------
		public getCXTile (__col:number, __row:number):number {
			if (this.m_cmap == null) {
				return XSubmapModel.CX_EMPTY;
			}
			
			return this.m_cmap[__row * this.m_cols + __col];
		}

//------------------------------------------------------------------------------------------
		public hasCXTiles ():boolean {
			var __row:number, __col:number;
			
			if (this.m_cmap != null) {
				for (__row = 0; __row < this.m_rows; __row++) {
					for (__col = 0; __col < this.m_cols; __col++) {
						if (this.m_cmap[__row * this.m_cols + __col] != XSubmapModel.CX_EMPTY) {
							return true;
						}
					}
				}
			}
			
			return false;
		}	
		
//------------------------------------------------------------------------------------------
		public get cols ():number {
			return this.m_cols;
		}
		
		public set cols (__val:number) {		
		}
			
//------------------------------------------------------------------------------------------
		public get rows ():number {
			return this.m_rows;
		}
		
		public set rows (__val:number) {		
		}
					
//------------------------------------------------------------------------------------------
		public get inuse ():number {
			return this.m_inuse;
		}
		
		public set inuse (__inuse:number) {
			this.m_inuse = __inuse;		
		}

//------------------------------------------------------------------------------------------
		public get boundingRect ():XRect {
			return this.m_boundingRect;
		}
		
		public set boundingRect (__val:XRect) {
			this.m_boundingRect = __val;			
		}
			
//------------------------------------------------------------------------------------------	
		public get x ():number {
			return this.m_col * this.m_submapWidth;
		}		
		
		public set x (__val:number) {		
		}
		
//------------------------------------------------------------------------------------------
		public get y ():number {
			return this.m_row * this.m_submapHeight;
		}

		public set y (__val:number) {	
		}
		
//------------------------------------------------------------------------------------------	
		public get width ():number {
			return this.m_submapWidth;
		}
		
		public set width (__val:number) {			
		}
		
//------------------------------------------------------------------------------------------
		public get height ():number {
			return this.m_submapHeight;
		}
		
		public set height (__val:number) {		
		}
		
//------------------------------------------------------------------------------------------
		public get XMapLayer ():XMapLayerModel {
			return this.m_XMapLayer;
		}
		
		public set XMapLayer (__val:XMapLayerModel) {
			this.m_XMapLayer = __val;		
		}
		
//------------------------------------------------------------------------------------------
		public addItem (
			__item:XMapItemModel
			):XMapItemModel {
							
			// console.log (": XSubmapModel: additem: ",  this.m_col, this.m_row, __item.getID (), this.m_items.has (__item));
			
			if (!this.useArrayItems) {
				if (!this.m_items.has (__item)) {
					this.m_items.set (__item, __item.id);
				}
			} else {
				this.m_arrayItems[this.m_arrayItemIndex++] = __item;
			}
					
			return __item;
		}
		
//------------------------------------------------------------------------------------------
		public addArrayItem (
			__item:XMapItemModel
		):XMapItemModel {
			
//			trace (": XSubmapModel: additemarray: ",  m_col, m_row, __item.getID (), m_items.exists (__item));
			
//			if (!(__item in m_arrayItems)) {
				this.m_arrayItems[this.m_arrayItemIndex++] = __item;
//			}
			
			return __item;
		}		

//------------------------------------------------------------------------------------------
		public replaceItems (
			__item:XMapItemModel
			):Array<XMapItemModel> /* <XMapItemModel> */ {
	
			console.log (": XSubmapModel: replaceitem: ",  this.m_col, this.m_row, __item.getID (), this.m_items.has (__item));
			
			var __removedItems:Array<XMapItemModel> = new Array<XMapItemModel> ();
			
			__item.boundingRect.copy2 (this.m_src);
			this.m_src.offset (__item.x, __item.y);
			
			XType.forEach (this.m_items, 
				(x:any) => {
					var __dstItem:XMapItemModel = x as XMapItemModel;
					
					__dstItem.boundingRect.copy2 (this.m_dst);
					this.m_dst.offset (__dstItem.x, __dstItem.y);
					
					if (this.m_src.intersects (this.m_dst)) {
						this.removeItem (__dstItem);
						
						__removedItems.push (__dstItem);
					}
				}
			);
			
			this.addItem (__item);
			
			console.log (": XSubmapModel: replaceItems: ", __removedItems);
			
			return __removedItems;
		}
		
//------------------------------------------------------------------------------------------
		public removeItem (
			__item:XMapItemModel
			):void {

			console.log (": XSubmapModel: removeItem: ",  this.m_col, this.m_row, __item.getID (), this.m_items.has (__item));
						
			if (this.m_items.has (__item)) {
				this.m_items.delete (__item);
			}
		}
				
		//------------------------------------------------------------------------------------------
		public addItemAsTile (
			__item:XMapItemModel
		):void {
			var __imageClassIndex:number = __item.imageClassIndex;
			var __frame:number = __item.frame;
			var __x:number = Math.floor (__item.x);
			var __y:number = Math.floor (__item.y);
		
			if (__y >= this.m_row * this.m_submapHeight && __y < this.m_row * this.m_submapHeight + 512) {
				var __col:number = Math.floor ((__x & this.m_submapWidthMask) / XSubmapModel.TX_TILE_WIDTH);
				var __row:number = Math.floor ((__y & this.m_submapHeightMask) / XSubmapModel.TX_TILE_HEIGHT);
		
				this.create_tmap ();
				
				this.m_tmap[__row * this.m_tileCols + __col] = [__imageClassIndex, __frame];
			}
		}
		
//------------------------------------------------------------------------------------------
		public items ():Map<XMapItemModel, number> {
			return this.m_items;
		}

//------------------------------------------------------------------------------------------
		public arrayItems ():Array<XMapItemModel> {
			return this.m_arrayItems;
		}

//------------------------------------------------------------------------------------------
		public iterateAllItems (__iterationCallback:any):void {
			if (this.useArrayItems) {
				var __items:Array<XMapItemModel>;
				var __length:number;
				
				__items = this.arrayItems ();
				
				__length = __items.length;
				
                var i:number;

				for (i = 0; i < __length; i++) {
					__iterationCallback (__items[i]);
				}
			} else {
				XType.forEach (this.items (), 
					(x:any) => {
						__iterationCallback (x);
					}
				);		
			}
		}

//------------------------------------------------------------------------------------------
		public serializeRowCol (__row:number, __col:number):XSimpleXMLNode {	
			var xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			var __attribs:Array<any>  = [
				"row",	__row,
				"col",	__col
			];
			
			xml.setupWithParams ("XSubmap", "", __attribs);
			
			if (this.hasCXTiles ()) {
				xml.addChildWithXMLNode (this.serializeCXTiles ());
			}
			
			if (this.m_XMapLayer.grid) {
				if (this.hasTiles ()) {
					xml = this.serializeRowCol_TileArray (xml);
				}
			} else {				
				xml = this.serializeRowCol_XMapItem (xml);
			}
			
			return xml;
		}
		
//------------------------------------------------------------------------------------------
		public serializeRowCol_XMapItem (xml:XSimpleXMLNode):XSimpleXMLNode {						
			var item:XMapItemModel;
	
			XType.forEach (this.items (), 
			    (x:any) => {
					item = x as XMapItemModel;
					
					xml.addChildWithXMLNode (item.serialize ());
				}
			);
			
			return xml;
		}

		//------------------------------------------------------------------------------------------
		public serializeRowCol_TileArray (xml:XSimpleXMLNode):XSimpleXMLNode {	
			var __tmap:Array<Array<any>> = this.m_tmap;
			
			var __tmapString:string = "";
			
            var __row:number, __col:number;

			for (__row = 0; __row < this.m_tileRows; __row++) {
				for (__col = 0; __col < this.m_tileCols; __col++) {
					var __tile:any = __tmap[__row * this.m_tileCols + __col];
					
					if (__tile[0] == -1 && __tile[1] == 0) {
						__tmapString += "XXXX";	
					} else {
						__tmapString += this.formatImageClassIndex (__tile[0]) + this.formatFrame (__tile[1]);			
					}
				}
			}

			var __xmlTiles:XSimpleXMLNode = new XSimpleXMLNode ();			
			__xmlTiles.setupWithParams ("Tiles", __tmapString, []);
			
			xml.addChildWithXMLNode (__xmlTiles);
			
			return xml;
		}

//------------------------------------------------------------------------------------------
		private formatImageClassIndex(__imageClassIndex:number):string {
			return XSubmapModel.CXToChar.charAt(__imageClassIndex);
		}
		
//------------------------------------------------------------------------------------------
		private formatFrame(__frame:number):string {
			var digit100:number = Math.floor ((__frame%1000) / 100);
			var digit10:number = Math.floor ((__frame%100) / 10);
			var digit1:number = Math.floor ((__frame%10) / 1);
			
			return "" + digit100 + digit10 + digit1;
		}
		
//------------------------------------------------------------------------------------------
		public serializeCXTiles ():XSimpleXMLNode {
			var __xmlCX:XSimpleXMLNode = new XSimpleXMLNode ();			
			__xmlCX.setupWithParams ("CX", "", []);
			
			var __row:number, __col:number;
				
			for (__row = 0; __row < this.m_rows; __row++) {
				var __xmlRow:XSimpleXMLNode = new XSimpleXMLNode ();
		
				var __rowString:string = "";
				
				for (__col = 0; __col < this.m_cols; __col++) {
					__rowString += XSubmapModel.CXToChar.charAt (this.m_cmap[__row * this.m_cols + __col]);
				}
				
				__xmlRow.setupWithParams ("row", __rowString, []);
				
				__xmlCX.addChildWithXMLNode (__xmlRow);
			}

			return __xmlCX;
		}
	
//------------------------------------------------------------------------------------------
		public deserializeRowCol (__xml:XSimpleXMLNode):void {
			var __xmlList:Array<XSimpleXMLNode>;
			__xmlList = __xml.child ("CX");
			
			if (__xmlList.length > 0) {
				this.deserializeCXTiles (__xmlList[0]);
			}
			
			//------------------------------------------------------------------------------------------
			var __xmlList:Array<XSimpleXMLNode>; // <XSimpleXMLNode>
			__xmlList = __xml.child ("Tiles");
			
			var __hasTiles:boolean = __xmlList.length > 0;
			
			//------------------------------------------------------------------------------------------
			console.log ("//------------------------------------------------------------------------------------------");
			console.log (": deserializeRowCol: ", this.m_XMapLayer.grid);
			
			//------------------------------------------------------------------------------------------
			// even layers numbers are always encoded as XMapItems and decoded as XMapItems
			//------------------------------------------------------------------------------------------
			if (!this.m_XMapLayer.grid) {
				console.log (": 0: ");
				this.deserializeRowCol_XMapItemXML_To_Items (__xml);
			}
			
			//------------------------------------------------------------------------------------------
			// encoded as XMapItemXML
			//------------------------------------------------------------------------------------------
			else if (!__hasTiles) {
				if (this.useArrayItems == false) { // TikiEdit
					console.log(": 1: ");
//					deserializeRowCol_XMapItemXML_To_Items (__xml); 
					this.deserializeRowCol_XMapItemXML_To_TileArray (__xml);
				} else {
					console.log(": 2: ");
					this.deserializeRowCol_XMapItemXML_To_TileArray (__xml);
				}
			}
			
			//------------------------------------------------------------------------------------------
			// encoded as TilesXML
			//------------------------------------------------------------------------------------------
			else {
				if (this.useArrayItems == false) { // TikiEdit
					console.log(": 3: ");
//					deserializeRowCol_TilesXML_To_Items (__xml);
					this.deserializeRowCol_TilesXML_To_TileArray (__xml);
				} else {
					console.log(": 4: ");
					this.deserializeRowCol_TilesXML_To_TileArray (__xml);
				}
			}
		}
	
//------------------------------------------------------------------------------------------
		public deserializeRowCol_TilesXML_To_TileArray (__xml:XSimpleXMLNode):void {
			console.log (": TilesXML to TileArray: ");
			
			var __xmlList:Array<XSimpleXMLNode>; 
			__xmlList = __xml.child ("Tiles");
			
			if (__xmlList.length > 0) {
				var __xml:XSimpleXMLNode = __xmlList[0];
			
				var __tilesString:string = __xml.getTextTrim();
				var __imageClassIndex:number;
				var	__frame:number;
				
				console.log (": <Tiles/>: ", __tilesString, __tilesString.length);
			
				var i:number;
				
				this.create_tmap ();
				
                var __row:number, __col:number;

				for (__row = 0; __row < this.m_tileRows; __row++) {
					for (__col = 0; __col < this.m_tileCols; __col++) {
						i = __row * this.m_tileCols + __col;
						
						if (__tilesString.substr (i * 4, 4) != "XXXX") {
							__imageClassIndex = XSubmapModel.CXToChar.indexOf (__tilesString.charAt (i * 4));
							__frame = XType.parseInt (__tilesString.substr (i * 4 + 1, 3));
	
							this.m_tmap[__row * this.m_tileCols + __col] = [__imageClassIndex, __frame != 0 ? __frame : 1];
						} else {
							this.m_tmap[__row * this.m_tileCols + __col] = [-1, 0];
						}
					}
				}
			}
		}
	
//------------------------------------------------------------------------------------------
		public deserializeRowCol_TilesXML_To_Items (__xml:XSimpleXMLNode):void {
			console.log (": TilesXML to Items: ");
			
			var __xmlList:Array<XSimpleXMLNode>;
			__xmlList = __xml.child ("Tiles");
			
			if (__xmlList.length > 0) {
				var __xml:XSimpleXMLNode = __xmlList[0];
				
				var __tilesString:string = __xml.getTextTrim();
				var __imageClassIndex:number;
				var	__frame:number;
				
				console.log (": <Tiles/>: ", __tilesString, __tilesString.length);
				
				var __item:XMapItemModel;
				
				var i:number;
				
				if (this.useArrayItems) {
					this.m_arrayItems = new Array<XMapItemModel> (/* __xmlList.length */);	
					for (i = 0; i < __xmlList.length; i++) {
						this.m_arrayItems.push (null);
					}
				}
				
				var __collisionRect:XRect = this.m_XRectPoolManager.borrowObject () as XRect;
				var __boundingRect:XRect = this.m_XRectPoolManager.borrowObject () as XRect;
				
				__collisionRect.setRect (
					0,
					0,
					XSubmapModel.TX_TILE_WIDTH,
					XSubmapModel.TX_TILE_HEIGHT
				);
				
				__boundingRect.setRect (
					0,
					0,
					XSubmapModel.TX_TILE_WIDTH,
					XSubmapModel.TX_TILE_HEIGHT
				);
				
				var __x:number = this.m_col * this.m_submapWidth;
				var __y:number = this.m_row * this.m_submapHeight;
				
                var __row:number, __col:number;

				for (__row = 0; __row < this.m_tileRows; __row++) {
					for (__col = 0; __col < this.m_tileCols; __col++) {
						i = __row * this.m_tileCols + __col;
						
						if (__tilesString.substr (i * 4, 4) != "XXXX") {
							__imageClassIndex = XSubmapModel.CXToChar.indexOf (__tilesString.charAt (i * 4));
							__frame = XType.parseInt (__tilesString.substr (i * 4 + 1, 3));
							
							/*
							__layerModel:XMapLayerModel,
							__logicClassName:string,
							__hasLogic:boolean,
							__name:string, __id:number,
							__imageClassName:string, __frame:number,
							__XMapItem:string,
							__x:Float, __y:Float,
							__scale:Float, __rotation:Float, __depth:Float,
							__collisionRect:XRect,
							__boundingRect:XRect,
							__params:string,
							args:Array<Dynamic>
							*/
						
							__item = this.m_XMapItemModelPoolManager.borrowObject () as XMapItemModel;
						
							var __id:number = this.m_XMapLayer.generateID ();
								
							console.log (":      --->: ", __tilesString.substr (i*4, 4), __imageClassIndex, this.m_XMapLayer.getClassNameFromIndex (__imageClassIndex));
							
							__item.setup (
								this.m_XMapLayer,
								// __logicClassName
								"XLogicObjectXMap:XLogicObjectXMap",
								// m_XMapLayer.getClassNameFromIndex (__logicClassIndex),
								// __hasLogic
								false,
								// __xml.hasAttribute ("hasLogic") && __xml.getAttribute ("hasLogic") == "true" ? true : false,
								// __name, __id
								"", __id,
								// __xml.getAttributeString ("name"), __id,
								this.m_XMapLayer.getClassNameFromIndex (__imageClassIndex), __frame,
								// m_XMapLayer.getClassNameFromIndex (__imageClassIndex), __xml.getAttributeInt ("frame"),
								// XMapItem
								"",
								// __xml.hasAttribute ("XMapItem") ? __xml.getAttribute ("XMapItem") : "",
								__x + __col * XSubmapModel.TX_TILE_WIDTH, __y + __row * XSubmapModel.TX_TILE_HEIGHT,
								// __xml.getAttributeFloat ("x"), __xml.getAttributeFloat ("y"),
								// __scale, __rotation, __depth
								1.0, 0.0, 0.0,
								// __xml.getAttributeFloat ("scale"), __xml.getAttributeFloat ("rotation"), __xml.getAttributeFloat ("depth"),
								// __collisionRect,
								__collisionRect,
								// __boundingRect,
								__boundingRect,
								// __params
								"<params/>",
								// __xml.child ("params")[0].toXMLString (),
								// args
								[]
							);
							
							if (this.useArrayItems) {
								this.m_arrayItems[this.m_arrayItemIndex++] = __item;
							} else {
								this.addItem (__item);
							}
							
							this.m_XMapLayer.trackItem (__item);
						}
					}
				}
			}
		}

//------------------------------------------------------------------------------------------
		public deserializeRowCol_XMapItemXML_To_TileArray (__xml:XSimpleXMLNode):void {
			console.log (": XMapItemXML to TileArray: ");
			
			var __xmlList:Array<XSimpleXMLNode>;
			__xmlList = __xml.child ("XMapItem");
			
			var i:number;
			
			this.create_tmap ();
			
			for (i = 0; i< __xmlList.length; i++) {
				var __xml:XSimpleXMLNode = __xmlList[i];
				
				var __imageClassIndex:number = __xml.getAttributeInt ("imageClassIndex");
				var __imageClassName:string = this.m_XMapLayer.getClassNameFromIndex (__imageClassIndex);
				var __frame:number = __xml.getAttributeInt ("frame");
				var __x:number = Math.floor (__xml.getAttributeFloat ("x"));
				var __y:number = Math.floor (__xml.getAttributeFloat ("y"));
				
				if (__y >= this.m_row * this.m_submapHeight && __y < this.m_row * this.m_submapHeight + 512) {
					var __col:number = Math.floor ((__x & this.m_submapWidthMask) / XSubmapModel.TX_TILE_WIDTH);
					var __row:number = Math.floor ((__y & this.m_submapHeightMask) / XSubmapModel.TX_TILE_HEIGHT);
					
					this.m_tmap[__row * this.m_tileCols + __col] = [__imageClassIndex, __frame];
				}
			}			
		}
		
//------------------------------------------------------------------------------------------
		public deserializeRowCol_XMapItemXML_To_Items (__xml:XSimpleXMLNode):void {
			var __xmlList:Array<XSimpleXMLNode>;
			__xmlList = __xml.child ("XMapItem");

			var i:number;
			
			if (this.useArrayItems) {
				this.m_arrayItems = new Array<XMapItemModel> (/* __xmlList.length */);	
				for (i = 0; i < __xmlList.length; i++) {
					this.m_arrayItems.push (null);
				}
			}
			
			for (i = 0; i < __xmlList.length; i++) {
				var __xml:XSimpleXMLNode = __xmlList[i];
				
//				trace (": deserializeRowCol: ", m_col, m_row);

				var __id:number = __xml.getAttributeInt ("id");
				var __item:XMapItemModel = this.m_XMapLayer.ids ().get (__id);
				
				if (__item != null) {
					console.log (": **** existing item found ****: ", __item, __item.id);
				} else {
					__item = this.m_XMapItemModelPoolManager.borrowObject () as XMapItemModel;
				}

				var __classNameToIndex:XReferenceNameToIndex = this.m_XMapLayer.getClassNames ();
				
				var __logicClassIndex:number = __xml.getAttributeInt ("logicClassIndex");
				var __imageClassIndex:number = __xml.getAttributeInt ("imageClassIndex");
				
//				trace (": logicClassName: ", m_XMapLayer.getClassNameFromIndex (__logicClassIndex), __classNameToIndex.getReferenceNameCount (__logicClassIndex));
//				trace (": imageClassName: ", m_XMapLayer.getClassNameFromIndex (__imageClassIndex),  __classNameToIndex.getReferenceNameCount (__imageClassIndex));
								
				var __collisionRect:XRect = this.m_XRectPoolManager.borrowObject () as XRect;
				var __boundingRect:XRect = this.m_XRectPoolManager.borrowObject () as XRect;
				
				__collisionRect.setRect (
					__xml.getAttributeFloat ("cx"),
					__xml.getAttributeFloat ("cy"),
					__xml.getAttributeFloat ("cw"),
					__xml.getAttributeFloat ("ch")
				);
				
				__boundingRect.setRect (
					__xml.getAttributeFloat ("bx"),
					__xml.getAttributeFloat ("by"),
					__xml.getAttributeFloat ("bw"),
					__xml.getAttributeFloat ("bh")
				);
					
				__item.setup (
					this.m_XMapLayer,
// __logicClassName
					this.m_XMapLayer.getClassNameFromIndex (__logicClassIndex),
// __hasLogic
					__xml.hasAttribute ("hasLogic") && __xml.getAttribute ("hasLogic") == "true" ? true : false,
// __name, __id
					__xml.getAttributeString ("name"), __id,
// __imageClassName, __frame
					this.m_XMapLayer.getClassNameFromIndex (__imageClassIndex), __xml.getAttributeInt ("frame"),
// XMapItem
					__xml.hasAttribute ("XMapItem") ? __xml.getAttribute ("XMapItem") : "",
// __x, __y,
					__xml.getAttributeFloat ("x"), __xml.getAttributeFloat ("y"),
// __scale, __rotation, __depth
					__xml.getAttributeFloat ("scale"), __xml.getAttributeFloat ("rotation"), __xml.getAttributeFloat ("depth"),
// __collisionRect,
					__collisionRect,
// __boundingRect,
					__boundingRect,
// __params
					__xml.child ("params")[0].toXMLString (),
// args
					[]
				);

				if (this.useArrayItems) {
					this.m_arrayItems[this.m_arrayItemIndex++] = __item;
				} else {
					this.addItem (__item);
				}
	
				this.m_XMapLayer.trackItem (__item);
			}
		}
		
//----------------------------------------------------------------------------------------
		public deserializeCXTiles (__cx:XSimpleXMLNode):void {
			var __xmlList:Array<XSimpleXMLNode> = __cx.child ("row");
			var __row:number, __col:number;
			var __xml:XSimpleXMLNode;
			var __rowString:string;
			
			this.create_cmap ();
			
			for (__row = 0; __row < __xmlList.length; __row++) {
				__xml = __xmlList[__row];
				__rowString = XType.trim (__xml.getText ());
				
				for (__col = 0; __col < __rowString.length; __col++) {
					this.m_cmap[__row * this.m_cols + __col] = XSubmapModel.CXToChar.indexOf (__rowString.charAt (__col));
				}
			}
		}
		
//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
