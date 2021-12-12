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
    import { XMapLayerModel } from './XMapLayerModel';
    
//------------------------------------------------------------------------------------------		
	export class XMapItemModel extends XModelBase {
		
		private m_layerModel:XMapLayerModel;
		private m_logicClassIndex:number;
		private m_hasLogic:boolean;
		private m_name:string;
		private m_id:number;
		private m_imageClassIndex:number;
		private m_frame:number;
		private m_XMapItem:string;
		private m_x:number;
		private m_y:number;
		private m_rotation:number;
		private m_scale:number;
		private m_depth:number;
		private m_collisionRect:XRect;
		private m_boundingRect:XRect;
		private m_params:string;

//------------------------------------------------------------------------------------------	
		public constructor () {
			super ();
			
			this.m_id = -1;
		}	

//------------------------------------------------------------------------------------------	
		public setup (
			__layerModel:XMapLayerModel,
			__logicClassName:string,
			__hasLogic:boolean,
			__name:string, __id:number,
			__imageClassName:string, __frame:number,
			__XMapItem:string,
			__x:number, __y:number,
			__scale:number, __rotation:number, __depth:number,
			__collisionRect:XRect,
			__boundingRect:XRect,
			__params:string,
			args:Array<any>
			):void {
				
			this.m_layerModel = __layerModel;
			this.m_logicClassIndex = this.m_layerModel.getIndexFromClassName (__logicClassName);
			this.m_hasLogic = __hasLogic;
			this.m_name = __name;
			this.m_id = __id;
			this.m_imageClassIndex = this.m_layerModel.getIndexFromClassName (__imageClassName);
			this.m_frame = __frame;
			this.m_XMapItem = __XMapItem;
			this.m_x = __x;
			this.m_y = __y;
			this.m_scale = __scale;
			this.m_rotation = __rotation;
			this.m_depth = __depth;
			this.m_collisionRect = __collisionRect;
			this.m_boundingRect = __boundingRect;
			this.m_params = __params;
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}
		
//------------------------------------------------------------------------------------------
		public kill ():void {
			this.m_layerModel.removeIndexFromClassNames (this.logicClassIndex);
			this.m_layerModel.removeIndexFromClassNames (this.imageClassIndex);
		}

//------------------------------------------------------------------------------------------
		public copy2 (__dst:XMapItemModel):void {
			__dst.layerModel = this.layerModel;
			__dst.hasLogic = this.hasLogic;
			__dst.name = this.name;
			__dst.id = this.id;
			__dst.imageClassIndex = this.imageClassIndex;
			__dst.frame = this.frame;
			__dst.XMapItem = this.XMapItem;
			__dst.scale = this.scale;
			__dst.rotation = this.rotation;
			__dst.depth = this.depth;
			this.collisionRect.copy2 (__dst.collisionRect);
			this.boundingRect.copy2 (__dst.boundingRect);
			__dst.params = this.params;
		}
		
//------------------------------------------------------------------------------------------
		public clone (__newLayerModel:XMapLayerModel = null):XMapItemModel {
			var __item:XMapItemModel = new XMapItemModel ();

			if (__newLayerModel == null) {
				__newLayerModel = this.layerModel;
			}
			
			__item.setup (
				__newLayerModel,
// __logicClassName
				this.layerModel.getClassNameFromIndex (this.m_logicClassIndex),
// __hasLogic
				this.hasLogic,
// __name, __id
				"", __newLayerModel.generateID (),
// __imageClassName, __frame
				this.layerModel.getClassNameFromIndex (this.m_imageClassIndex), this.frame,
// XMapItem
				this.XMapItem,
// __x, __y,
				this.x, this.y,
// __scale, __rotation, __depth
				this.scale, this.rotation, this.depth,
// __collisionRect,
				this.collisionRect.cloneX (),
// __boundingRect,
				this.boundingRect.cloneX (),
// __params
				this.params,
// args
				[]
			);
			
			return __item;
		}
	
//------------------------------------------------------------------------------------------
		public getID ():number {
			return this.m_id;
		}
		
//------------------------------------------------------------------------------------------
		public setID (__id:number):void {
			this.m_id = __id;
		}

//------------------------------------------------------------------------------------------
		public get layerModel ():XMapLayerModel {
			return this.m_layerModel;
		}
		
		public set layerModel (__layerModel:XMapLayerModel) {
			this.m_layerModel = __layerModel;			
		}
		
//------------------------------------------------------------------------------------------
		public get inuse ():number {
			return this.m_layerModel.getItemInuse (this.id);
		}
		
		public set inuse (__inuse:number) {
			this.m_layerModel.setItemInuse (this.id, __inuse);		
		}
		
//------------------------------------------------------------------------------------------
		public get id ():number {
			return this.m_id;
		}
		
		public set id (__id:number) {
			this.m_id = __id;			
		}

//------------------------------------------------------------------------------------------
		public get name ():string {
			return this.m_name;
		}
		
		public set name (__name:string) {
			this.m_name = __name;		
		}
				
//------------------------------------------------------------------------------------------
		public get logicClassIndex ():number {
			return this.m_logicClassIndex;
		}
		
		public set logicClassIndex (__val:number) {
			this.m_logicClassIndex = __val;		
		}
		
//------------------------------------------------------------------------------------------
		public get logicClassName ():string {
			return this.m_layerModel.getClassNameFromIndex (this.logicClassIndex);
		}

		public set logicClassName (__val:string) {	
		}
		
//------------------------------------------------------------------------------------------
		public get hasLogic ():boolean {
			return this.m_hasLogic;
		}
		
		public set hasLogic (__val:boolean) {
			this.m_hasLogic = __val;			
		}
		
//------------------------------------------------------------------------------------------
		public get XMapItem ():string {
			return this.m_XMapItem;
		}
		
		public set XMapItem (__val:string) {
			this.m_XMapItem = __val;		
		}
		
//------------------------------------------------------------------------------------------
		public get imageClassIndex ():number {
			return this.m_imageClassIndex;
		}

		public set imageClassIndex (__val:number) {
			this.m_imageClassIndex = __val;		
		}
		
//------------------------------------------------------------------------------------------
		public get imageClassName ():string {
			return this.m_layerModel.getClassNameFromIndex (this.imageClassIndex);
		}

		public set imageClassName (__val:string) {	
		}
			
//------------------------------------------------------------------------------------------	
		public get frame ():number {
			return this.m_frame;
		}

		public set frame (__frame:number) {
			this.m_frame = __frame;		
		}
								
//------------------------------------------------------------------------------------------
		public get x ():number {
			return this.m_x;
		}

		public set x (__x:number) {
			this.m_x = __x;		
		}
				
//------------------------------------------------------------------------------------------
		public get y ():number {
			return this.m_y;
		}

		public set y (__y:number) {
			this.m_y = __y;		
		}

//------------------------------------------------------------------------------------------
		public get rotation ():number {
			return this.m_rotation;
		}
	
		public set rotation (__rotation:number) {
			this.m_rotation = __rotation;			
		}
			
//------------------------------------------------------------------------------------------
		public get scale ():number {
			return this.m_scale;
		}
		
		public set scale (__scale:number) {
			this.m_scale = __scale;			
		}
		
//------------------------------------------------------------------------------------------
		public get depth ():number {
			return this.m_depth;
		}

		public set depth (__depth:number) {
			this.m_depth = __depth;		
		}
		
//------------------------------------------------------------------------------------------
		public get boundingRect ():XRect {
			return this.m_boundingRect;
		}

		public set boundingRect (__rect:XRect) {
			this.m_boundingRect = __rect;		
		}
		
//------------------------------------------------------------------------------------------
		public get collisionRect ():XRect {
			return this.m_collisionRect;
		}

		public set collisionRect (__rect:XRect) {
			this.m_collisionRect = __rect;			
		}

//------------------------------------------------------------------------------------------
		public get params ():string {
			return this.m_params;
		}
		
		public set params (__params:string) {
			this.m_params = __params;			
		}

//------------------------------------------------------------------------------------------
		public serialize ():XSimpleXMLNode {
			var xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			var __attribs:Array<any> = [
				"logicClassIndex",	this.logicClassIndex,
				"hasLogic",			this.hasLogic ? "true" : "false",
				"name",				this.name,
				"id",				this.id,
				"imageClassIndex",	this.imageClassIndex,
				"frame",			this.frame,
				"XMapItem",			this.XMapItem,
				"x",				this.x,
				"y",				this.y,
				"rotation",			this.rotation,
				"scale",			this.scale,
				"depth",			this.depth,
				"cx",				this.collisionRect.x,
				"cy",				this.collisionRect.y,
				"cw",				this.collisionRect.width,
				"ch",				this.collisionRect.height,
				"bx",				this.boundingRect.x,
				"by",				this.boundingRect.y,
				"bw",				this.boundingRect.width,
				"bh",				this.boundingRect.height
			];
			
			xml.setupWithParams ("XMapItem", "", __attribs);
			
			xml.addChildWithXMLString (this.params);
			
			return xml;
		}

//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
