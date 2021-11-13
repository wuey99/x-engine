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

//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
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
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/XType';
import { World, Body, Engine } from 'matter-js';
import * as Matter from 'matter-js';
import { XRect } from '../geom/XRect';
import { XPoint } from '../geom/XPoint';
import { G } from '../app/G';
import { XState } from '../state/XState';
import { PausableListener} from '../events/PausableListener';
import { XTextSprite } from '../sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';
import { XTextureManager } from '../../engine/texture/XTextureManager';
import { XSubTextureManager } from '../../engine/texture/XSubTextureManager';
import { XGameObject } from './XGameObject';
import { XSubmapModel } from '../xmap/XSubmapModel';
import { XMapModel } from '../xmap/XMapModel';
import { XMapItemModel } from '../xmap/XMapItemModel';
import { XMapLayerModel } from '../xmap/XMapLayerModel';
import { XMapView } from '../xmap/XMapView';

//------------------------------------------------------------------------------------------
export class XGameObjectCX extends XGameObject {

	public m_XMapModel:XMapModel;
	public m_XMapView:XMapView;
	public m_XMapLayerModel:XMapLayerModel;
	public m_XSubmaps:Array<Array<XSubmapModel>>;
	public m_submapWidth:number;
	public m_submapHeight:number;
	public m_submapWidthMask:number;
	public m_submapHeightMask:number;
	public m_cols:number;
	public m_rows:number;

	private m_CX_Collide_Flag:number;
	
	private m_objectCollisionList:Map<XGameObject, XRect>;

	public CX_COLLIDE_LF:number = 0x0001;
	public CX_COLLIDE_RT:number = 0x0002;
	public CX_COLLIDE_HORZ:number = 0x0001 | 0x0002; 
	public CX_COLLIDE_UP:number = 0x0004;
	public CX_COLLIDE_DN:number = 0x0008;
	public CX_COLLIDE_VERT:number = 0x0004 | 0x0008;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);
	
        this.m_XMapModel = null;
        this.m_XMapView = null;

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {
        var __vel:XPoint = this.world.getXPointPoolManager ().borrowObject () as XPoint;
        var __old:XPoint = this.world.getXPointPoolManager ().borrowObject () as XPoint;
            
        __vel.x = __vel.y = 0;
        __old.x = __old.y = 0;
        
        this.setVel (__vel);
        this.setOld (__old);

        this.m_objectCollisionList = null;

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();

        this.world.getXPointPoolManager ().returnObject (this.m_vel);
        this.world.getXPointPoolManager ().returnObject (this.m_oldPos);
	}
	
//------------------------------------------------------------------------------------------
    public setXMapModel (__layer:number, __XMapModel:XMapModel, __XMapView:XMapView=null):void {
        this.m_XMapModel = __XMapModel;
        this.m_XMapView = __XMapView;
        
        this.m_XMapLayerModel = this.m_XMapModel.getLayer (__layer);
        
        this.m_XSubmaps = this.m_XMapLayerModel.submaps ();
        
        this.m_submapWidth = this.m_XMapLayerModel.getSubmapWidth ();
        this.m_submapHeight = this.m_XMapLayerModel.getSubmapHeight ();
        
        this.m_submapWidthMask = this.m_submapWidth - 1;
        this.m_submapHeightMask = this.m_submapHeight - 1;
        
        this.m_cols = Math.floor (this.m_submapWidth / XSubmapModel.CX_TILE_WIDTH);
        this.m_rows = Math.floor (this.m_submapHeight / XSubmapModel.CX_TILE_HEIGHT);

        /*			
        console.log (": --------------------------------:");
        console.log (": submapWidth: ", m_submapWidth);
        console.log (": submapHeight: ", m_submapHeight);
        console.log (": submapWidthMask: ", m_submapWidthMask);
        console.log (": submapHeightMask: ", m_submapHeightMask);
        console.log (": m_cols: ", m_cols);
        console.log (": m_rows: ", m_rows);
        console.log (": tileWidth: ", XSubmapModel.CX_TILE_WIDTH);
        console.log (": tileWidthMask: ", XSubmapModel.CX_TILE_WIDTH_MASK);
        console.log (": tileWidthUnmask: ", XSubmapModel.CX_TILE_WIDTH_UNMASK);
        console.log (": tileHeight: ", XSubmapModel.CX_TILE_HEIGHT);
        console.log (": tileHeightMask: ", XSubmapModel.CX_TILE_HEIGHT_MASK);
        console.log (": tileHeightUnMask: ", XSubmapModel.CX_TILE_HEIGHT_UNMASK);
        */
    }

//------------------------------------------------------------------------------------------
    public getXMapModel ():XMapModel {
        return this.m_XMapModel;
    }

//------------------------------------------------------------------------------------------
    public getXMapLayerModel ():XMapLayerModel {
        return this.m_XMapLayerModel;
    }

//------------------------------------------------------------------------------------------
    public getXMapView ():XMapView {
        return this.m_XMapView;
    }

//------------------------------------------------------------------------------------------
    public hasItemStorage ():boolean {
        if (this.item == null) {
            return false;
        }
        
        return this.m_XMapLayerModel.getPersistentStorage ().has (this.item.id);
    }

//------------------------------------------------------------------------------------------
    public initItemStorage (__val:any):void {
        if (!this.hasItemStorage ()) {
            this.m_XMapLayerModel.getPersistentStorage ().set (this.item.id, __val);
        }
    }

//------------------------------------------------------------------------------------------
    public getItemStorage ():any {
        if (this.hasItemStorage ()) {		
            return this.m_XMapLayerModel.getPersistentStorage ().get (this.item.id);
        }
        else
        {
            return null;
        }
    }

//------------------------------------------------------------------------------------------
    public getVel ():XPoint {
        return this.m_vel;
    }
    
    public setVel (__vel:XPoint):void {
        this.m_vel = __vel;
    }

//------------------------------------------------------------------------------------------
    public get oDX ():number {
        return this.m_vel.x;
    }

    public set oDX (__val:number) {
        this.m_vel.x = __val;		
    }

//------------------------------------------------------------------------------------------
    public get oDY ():number {
        return this.m_vel.y;
    }

    public set oDY (__val:number) {
        this.m_vel.y = __val;		
    }

//------------------------------------------------------------------------------------------
    public getOld ():XPoint {
        return this.m_oldPos;
    }

    public setOld (__pos:XPoint):void {
        this.m_oldPos = __pos;
    }

//------------------------------------------------------------------------------------------
    public  get oldX ():number {
        return this.m_oldPos.x;
    }

    public set oldX (__val:number) {
        this.m_oldPos.x = __val;			
}

//------------------------------------------------------------------------------------------
    public get oldY ():number {
        return this.m_oldPos.y;
    }

    public set oldY (__val:number) {
        this.m_oldPos.y = __val;		
    }

//------------------------------------------------------------------------------------------
    public collidesWithNamedCX (__name:string, __rectDst:XRect):boolean {
        var __rectSrc:XRect = this.getAdjustedNamedCX (__name);
        
        return __rectSrc.intersects (__rectDst);
    }

//------------------------------------------------------------------------------------------
    public get CX_Collide_Flag ():number {
        return this.m_CX_Collide_Flag;
    }

    public set CX_Collide_Flag (__val:number) {
        this.m_CX_Collide_Flag = __val;		
    }

//------------------------------------------------------------------------------------------
    public handleCollision (__collider:XGameObject):void {
    }

//------------------------------------------------------------------------------------------
    public objectCollisionCallback (__logicObject:XGameObject):void {	
    }

//------------------------------------------------------------------------------------------
}