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

//------------------------------------------------------------------------------------------
// XMapModel:
//      consists of 1-n layers (XMapLayerModel).  Each layer is sub-divided
//		into a grid of submaps (XSubmapModel) submapCols wide and submapRows high.
//		each submap is submapWidth pixels wide and submapHeight pixels high.
//------------------------------------------------------------------------------------------
	export class XMapModel extends XModelBase {
		private m_numLayers:number;
		private m_layers:Array<XMapLayerModel>;
		private m_allClassNames:Array<string>;
		private m_currLayer:number;
		private m_useArrayItems:boolean;
		private m_XSubXMapItemModelPoolManager:XSubObjectPoolManager;
		private m_XSubXRectPoolManager:XSubObjectPoolManager;
		private m_XApp:XApp;
		public static g_XApp:XApp;
		
//------------------------------------------------------------------------------------------	
		public constructor () {
			super ();
			
			this.m_allClassNames = new Array<string> ();
			this.m_useArrayItems = false;
			
			this.m_XApp = XMapModel.g_XApp;
		}	

//------------------------------------------------------------------------------------------
		public setup (
			__layers:Array<XMapLayerModel> = null,
			__useArrayItems:boolean = false
			):void {
				
			if (__layers == null) {
				return;
			}

            var i:number;

			this.m_numLayers = __layers.length;	
			this.m_layers = new Array<XMapLayerModel> (); 

			for (i = 0; i < this.m_numLayers; i++) {
				this.m_layers.push (null);
			}
			this.m_currLayer = 0;
			this.m_useArrayItems = __useArrayItems;
			this.m_XSubXMapItemModelPoolManager = new XSubObjectPoolManager (this.m_XApp.getXMapItemModelPoolManager ());
			this.m_XSubXRectPoolManager = new XSubObjectPoolManager (this.m_XApp.getXRectPoolManager ());
			
			for (i = 0; i < this.m_numLayers; i++) {
				this.m_layers[i] = __layers[i];
				this.m_layers[i].setParent (this);
			}
		}				

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			var i:number;
			
			for (i = 0; i < this.m_numLayers; i++) {
				this.m_layers[i].cleanup ();
				
				this.m_layers[i] = null;
			}
			
			this.m_XSubXMapItemModelPoolManager.returnAllObjects ();
			this.m_XSubXRectPoolManager.returnAllObjects ();
		}
		
//------------------------------------------------------------------------------------------
		public static setXApp (__XApp:XApp):void {
			XMapModel.g_XApp = __XApp;
		}

//------------------------------------------------------------------------------------------
		public getXMapItemModelPoolManager ():XSubObjectPoolManager {
			return this.m_XSubXMapItemModelPoolManager;
		}
		
//------------------------------------------------------------------------------------------
		public getXRectPoolManager ():XSubObjectPoolManager {
			return this.m_XSubXRectPoolManager;
		}
		
//------------------------------------------------------------------------------------------
		public get useArrayItems ():boolean {
			return this.m_useArrayItems;
		}
		
		public set useArrayItems (__val:boolean) {			
		}
			
//------------------------------------------------------------------------------------------
		public getNumLayers ():number {
			return this.m_numLayers;
		}
		
//------------------------------------------------------------------------------------------
		public setCurrLayer (__layer:number):void {
			this.m_currLayer = __layer;
		}
		
//------------------------------------------------------------------------------------------
		public getCurrLayer ():number {
			return this.m_currLayer;
		}
		
//------------------------------------------------------------------------------------------
		public getAllClassNames ():Array<string> {
			var i:number, j:number;
			
			if (this.m_allClassNames.length == 0) {
				for (i = 0; i < this.m_numLayers; i++) {
					var __classNames:Array<string> = this.m_layers[i].getAllClassNames ();
				
					for (j = 0; j < __classNames.length; j++) {
						if (__classNames[j] != null && this.m_allClassNames.indexOf (__classNames[j]) == -1) {
							this.m_allClassNames.push (__classNames[j]);
						}
					}
				}
			}
			
			return this.m_allClassNames;
		}

//------------------------------------------------------------------------------------------
		public getLayers ():Array<XMapLayerModel> {
			return this.m_layers;
		}	
				
//------------------------------------------------------------------------------------------
		public getLayer (__layer:number):XMapLayerModel {
			return this.m_layers[__layer];
		}		
		
//------------------------------------------------------------------------------------------
		public addItem (__layer:number, __item:XMapItemModel):void {
			this.m_layers[__layer].addItem (__item);
		}

//------------------------------------------------------------------------------------------
		public replaceItems (__layer:number, __item:XMapItemModel):Array<XMapItemModel> {
			return this.m_layers[__layer].replaceItems (__item);
		}
		
//------------------------------------------------------------------------------------------
		public removeItem (__layer:number, __item:XMapItemModel):void {
			this.m_layers[__layer].removeItem (__item);
		}
		
//------------------------------------------------------------------------------------------
		public addItemAsTile (__layer:number, __item:XMapItemModel):void {
			this.m_layers[__layer].addItemAsTile (__item);
		}
		
//------------------------------------------------------------------------------------------
		public getSubmapsAt (
			__layer:number,
			__x1:number, __y1:number,
			__x2:number, __y2:number
			):Array<XSubmapModel> {
				
			return this.m_layers[__layer].getSubmapsAt (__x1, __y1, __x2, __y2);
		}

//------------------------------------------------------------------------------------------
		public getItemsAt (
			__layer:number,
			__x1:number, __y1:number,
			__x2:number, __y2:number
			):Array<XMapItemModel> {
				
			return this.m_layers[__layer].getItemsAt (__x1, __y1, __x2, __y2);
		}

//------------------------------------------------------------------------------------------
		public getArrayItemsAt (
			__layer:number,
			__x1:number, __y1:number,
			__x2:number, __y2:number
			):Array<XMapItemModel> {
			
			return this.m_layers[__layer].getArrayItemsAt (__x1, __y1, __x2, __y2);
		}
		
//------------------------------------------------------------------------------------------
		public getItemsAtCX (
			__layer:number,
			__x1:number, __y1:number,
			__x2:number, __y2:number
			):Array<XMapItemModel> {
				
			return this.m_layers[__layer].getItemsAtCX (__x1, __y1, __x2, __y2);
		}

//------------------------------------------------------------------------------------------
		public serializeAll ():XSimpleXMLNode {
			return this.serialize ();
		}
		
//------------------------------------------------------------------------------------------
		public deserializeAll (__xml:XSimpleXMLNode):void {
			console.log (": [XMap] deserializeAll: ");
			
			this.deserialize (__xml, false);
		}
		
//------------------------------------------------------------------------------------------
		public deserializeAllNormal (__xml:XSimpleXMLNode, __useArrayItems:boolean=false):void {
			console.log (": [XMap] deserializeAll: ");
			
			this.deserialize (__xml, false, __useArrayItems);
		}
		
//------------------------------------------------------------------------------------------
		public deserializeAllReadOnly (__xml:XSimpleXMLNode, __useArrayItems:boolean=false):void {
			console.log (": [XMap] deserializeAll: ");
			
			this.deserialize (__xml, true, __useArrayItems);
		}
		
//------------------------------------------------------------------------------------------
		public serialize ():XSimpleXMLNode {
			var xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			xml.setupWithParams ("XMap", "", []);
			
			xml.addChildWithXMLNode (this.serializeLayers ());
							
			return xml;
		}

//------------------------------------------------------------------------------------------	
		private serializeLayers ():XSimpleXMLNode {
			var xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			xml.setupWithParams ("XLayers", "", []);
	
			var i:number;
			
			for (i = 0; i<  this.m_numLayers; i++) {
				this.m_layers[i].serialize (xml);
			}
			
			return xml;
		}

//------------------------------------------------------------------------------------------
		private deserialize (__xml:XSimpleXMLNode, __readOnly:boolean=false, __useArrayItems:boolean=false):void {
			console.log (": [XMap] deserialize: ");
			
			var i:number;
			
			var __xmlList:Array<XSimpleXMLNode> = __xml.child ("XLayers")[0].child ("XLayer");
			
			this.m_numLayers = __xmlList.length;
			this.m_layers = new Array<XMapLayerModel> (); 
			for (i = 0; i < this.m_numLayers; i++) {
				this.m_layers.push (null);
			}
			this.m_useArrayItems = __useArrayItems;
			this.m_XSubXMapItemModelPoolManager = new XSubObjectPoolManager (this.m_XApp.getXMapItemModelPoolManager ());
			this.m_XSubXRectPoolManager = new XSubObjectPoolManager (this.m_XApp.getXRectPoolManager ());
				
			for (i = 0; i < __xmlList.length; i++) {
				this.m_layers[i] = this.createXMapLayerModel ();
				this.m_layers[i].setParent (this);
				this.m_layers[i].deserialize (__xmlList[i], __readOnly);
			}
		}
		
//------------------------------------------------------------------------------------------
		public createXMapLayerModel ():XMapLayerModel {
			return new XMapLayerModel ();	
		}
		
//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
