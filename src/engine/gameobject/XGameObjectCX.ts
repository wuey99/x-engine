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

	public static CX_COLLIDE_LF:number = 0x0001;
	public static CX_COLLIDE_RT:number = 0x0002;
	public static CX_COLLIDE_HORZ:number = 0x0001 | 0x0002; 
	public static CX_COLLIDE_UP:number = 0x0004;
	public static CX_COLLIDE_DN:number = 0x0008;
	public static CX_COLLIDE_VERT:number = 0x0004 | 0x0008;

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
        } else {
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
    public get allowLFCollisions ():boolean {
        return true;
    }

    public set allowLFCollisions (__val:boolean) {			
    }

//------------------------------------------------------------------------------------------
    public get allowRTCollisions ():boolean {
        return true;
    }

    public set allowRTCollisions (__val:boolean) {			
    }

//------------------------------------------------------------------------------------------
    public get allowUPCollisions ():boolean {
        return true;
    }

    public set allowUPCollisions (__val:boolean) {
    }

//------------------------------------------------------------------------------------------
    public get allowDNCollisions ():boolean {
        return true;
    }

    public set_allowDNCollisions (__val:boolean) {			
    }

//------------------------------------------------------------------------------------------
    public updatePhysics ():void {
        this.handleCX ();	
    }

//------------------------------------------------------------------------------------------
    public handleCX ():void {
        this.m_CX_Collide_Flag = 0;

//------------------------------------------------------------------------------------------			
        this.oX += this.oDX;
        
        // if (int (oX) != int (oldX)) {
        {
            if (this.oDX == 0) {
                
            }
            else if (this.oDX < 0) {
                this.Ck_Collide_LF ();
                this.Ck_Slope_LF ();
            } else {
                this.Ck_Collide_RT ();
                this.Ck_Slope_RT (); 
            }
        }
        
//------------------------------------------------------------------------------------------
        this.oY += this.oDY;
        
        // if (int (oY) != int (oldY)) {
        {
            if (this.oDY == 0) {
                
            }
            else if (this.oDY < 0) {
                this.Ck_Collide_UP ();
                this.Ck_Slope_UP ();
            } else {
                this.Ck_Collide_DN ();
                this.Ck_Slope_DN ();
            }
        }
    }

//------------------------------------------------------------------------------------------
    public Ck_Collide_UP ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var r:number, c:number;
        var submapRow:number, submapCol:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
                    
        y1 &= XSubmapModel.CX_TILE_HEIGHT_UNMASK;
        r = y1 >> 9;
        submapRow = ((y1 & 496) << 1);
        
        collided = false;
        
        __x = (x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK);
    //			for (__x = (x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK); __x <= (x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK); __x += XSubmapModel.CX_TILE_WIDTH) {
        while (__x <= (x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK)) {
    //				c = __x/m_submapWidth;
    //				r = y1/m_submapHeight;
    //				i = (int ((y1 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((__x & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
    //				switch (m_XSubmaps[r][c].cmap[i]) {
                
            switch (this.m_XSubmaps[r][__x >> 9].cmap[submapRow + ((__x & 511) >> 4)]) {
            // ([
                case XSubmapModel.CX_EMPTY:
                    break;
                case XSubmapModel.CX_SOLID:
                    // function ():void {
                    this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_UP;
                    
                    this.oY = (y1 + XSubmapModel.CX_TILE_HEIGHT - this.m_cx.top);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOLIDX001:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_UP;
            
                        this.oY = (y1 + XSubmapModel.CX_TILE_HEIGHT - this.m_cx.top);
        
                        collided = true;
                    break; // },
                case XSubmapModel.CX_SOFT:
                    break;
                case XSubmapModel.CX_JUMP_THRU:
                    break;
                    
                case XSubmapModel.CX_UL45:
                    break;
                case XSubmapModel.CX_UR45:
                    break;
                case XSubmapModel.CX_LL45:
                    break;
                case XSubmapModel.CX_LR45:
                    break;
                
                case XSubmapModel.CX_UL225A:
                    break;
                case XSubmapModel.CX_UL225B:
                    break;
                case XSubmapModel.CX_UR225A:
                    break;
                case XSubmapModel.CX_UR225B:
                    break;
                case XSubmapModel.CX_LL225A:
                    break;
                case XSubmapModel.CX_LL225B:
                    break;
                case XSubmapModel.CX_LR225A:
                    break;
                case XSubmapModel.CX_LR225B:
                    break;
                
                case XSubmapModel.CX_UL675A:
                    break;
                case XSubmapModel.CX_UL675B:
                    break;
                case XSubmapModel.CX_UR675A:
                    break;
                case XSubmapModel.CX_UR675B:
                    break;
                case XSubmapModel.CX_LL675A:
                    break;
                case XSubmapModel.CX_LL675B:
                    break;
                case XSubmapModel.CX_LR675A:
                    break;
                case XSubmapModel.CX_LR675B:
                    break;
                    
                case XSubmapModel.CX_SOFTLF:
                    break;
                case XSubmapModel.CX_SOFTRT:
                    break;
                case XSubmapModel.CX_SOFTUP:
                    break;
                case XSubmapModel.CX_SOFTDN:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_UP;
            
                        this.oY = (y1 + XSubmapModel.CX_TILE_HEIGHT - this.m_cx.top);
        
                        collided = true;
                    break;
                case XSubmapModel.CX_DEATH:
                    break;
                default:
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
            
            __x += XSubmapModel.CX_TILE_WIDTH;
        }
        
        return false;
    }

//------------------------------------------------------------------------------------------
    public Ck_Collide_DN ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var r:number, c:number;
        var submapRow:number, submapCol:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
                        
        y2 &= XSubmapModel.CX_TILE_HEIGHT_UNMASK;
        r = y2 >> 9;
        submapRow = ((y2 & 496) << 1);
        
        collided = false;
        
        __x = (x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK);
    //			for (__x = (x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK); __x <= (x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK); __x += XSubmapModel.CX_TILE_WIDTH) {
        while (__x <= (x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK)) {
    //				c = __x/m_submapWidth;
    //				r = y2/m_submapHeight;
    //				i = (int ((y2 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((__x & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
    //				switch (m_XSubmaps[r][c].cmap[i]) {
                
            if (r > 63) {
                return false;
            }
            
            switch (this.m_XSubmaps[r][__x >> 9].cmap[submapRow + ((__x & 511) >> 4)]) {
            // ([
                case XSubmapModel.CX_EMPTY:
                    break;
                case XSubmapModel.CX_SOLID:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_DN;
                    
                        this.oY = (y2 - (this.m_cx.bottom) - 1);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOLIDX001:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_DN;
                    
                        this.oY = (y2 - (this.m_cx.bottom) - 1);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_DN;
            
                        this.oY = (y2 - (this.m_cx.bottom) - 1);
                                    
                        collided = true;
                    break; // },
                case XSubmapModel.CX_SOFT:
                    break;
    //					case XSubmapModel.CX_JUMP_THRU:
    //						break;
                    
                case XSubmapModel.CX_UL45:
                    break;
                case XSubmapModel.CX_UR45:
                    break;
                case XSubmapModel.CX_LL45:
                    break;
                case XSubmapModel.CX_LR45:
                    break;
                
                case XSubmapModel.CX_UL225A:
                    break;
                case XSubmapModel.CX_UL225B:
                    break;
                case XSubmapModel.CX_UR225A:
                    break;
                case XSubmapModel.CX_UR225B:
                    break;
                case XSubmapModel.CX_LL225A:
                    break;
                case XSubmapModel.CX_LL225B:
                    break;
                case XSubmapModel.CX_LR225A:
                    break;
                case XSubmapModel.CX_LR225B:
                    break;
                
                case XSubmapModel.CX_UL675A:
                    break;
                case XSubmapModel.CX_UL675B:
                    break;
                case XSubmapModel.CX_UR675A:
                    break;
                case XSubmapModel.CX_UR675B:
                    break;
                case XSubmapModel.CX_LL675A:
                    break;
                case XSubmapModel.CX_LL675B:
                    break;
                case XSubmapModel.CX_LR675A:
                    break;
                case XSubmapModel.CX_LR675B:
                    break;
                    
                case XSubmapModel.CX_SOFTLF:
                    break;
                case XSubmapModel.CX_SOFTRT:
                    break;
                case XSubmapModel.CX_SOFTUP:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_DN;
            
                        this.oY = (y2 - (this.m_cx.bottom) - 1);
                                    
                        collided = true;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    break;
                case XSubmapModel.CX_DEATH:
                    break;
                default:
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
            
            __x += XSubmapModel.CX_TILE_WIDTH;
        }
        
        return false;
    }

//------------------------------------------------------------------------------------------
    public Ck_Collide_LF ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var r:number, c:number;
        var submapRow:number, submapCol:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);

        x1 &= XSubmapModel.CX_TILE_WIDTH_UNMASK;
        c = x1 >> 9;
        submapCol = (x1 & 511) >> 4;
        
        collided = false;
        
        __y = (y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK);
    //			for (__y = (y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK); __y <= (y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK); __y += XSubmapModel.CX_TILE_HEIGHT) {
        while (__y <= (y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK)) {
    //				c = x1/m_submapWidth;
    //				r = __y/m_submapHeight;
    //				i = (int ((__y & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x1 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
    //				switch (m_XSubmaps[r][c].cmap[i]) {
                
            switch (this.m_XSubmaps[__y >> 9][c].cmap[((__y & 496) << 1) + submapCol]) {
            // ([
                case XSubmapModel.CX_EMPTY:
                    break;
                case XSubmapModel.CX_SOLID:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_LF;
                    
                        this.oX = (x1 + XSubmapModel.CX_TILE_WIDTH - this.m_cx.left);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOLIDX001:
                        // function ():void {
                            this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_LF;
        
                            this.oX = (x1 + XSubmapModel.CX_TILE_WIDTH - this.m_cx.left);
            
                            collided = true;
                        break; // },
                case XSubmapModel.CX_SOFT:
                    break;
                case XSubmapModel.CX_JUMP_THRU:
                    break;
                    
                case XSubmapModel.CX_UL45:
                    break;
                case XSubmapModel.CX_UR45:
                    break;
                case XSubmapModel.CX_LL45:
                    break;
                case XSubmapModel.CX_LR45:
                    break;
                
                case XSubmapModel.CX_UL225A:
                    break;
                case XSubmapModel.CX_UL225B:
                    break;
                case XSubmapModel.CX_UR225A:
                    break;
                case XSubmapModel.CX_UR225B:
                    break;
                case XSubmapModel.CX_LL225A:
                    break;
                case XSubmapModel.CX_LL225B:
                    break;
                case XSubmapModel.CX_LR225A:
                    break;
                case XSubmapModel.CX_LR225B:
                    break;
                
                case XSubmapModel.CX_UL675A:
                    break;
                case XSubmapModel.CX_UL675B:
                    break;
                case XSubmapModel.CX_UR675A:
                    break;
                case XSubmapModel.CX_UR675B:
                    break;
                case XSubmapModel.CX_LL675A:
                    break;
                case XSubmapModel.CX_LL675B:
                    break;
                case XSubmapModel.CX_LR675A:
                    break;
                case XSubmapModel.CX_LR675B:
                    break;
                    
                case XSubmapModel.CX_SOFTLF:
                    break;
                case XSubmapModel.CX_SOFTRT:
                        // function ():void {
                            this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_LF;
        
                            this.oX = (x1 + XSubmapModel.CX_TILE_WIDTH - this.m_cx.left);
            
                            collided = true;
                        break; 
                case XSubmapModel.CX_SOFTUP:
                    break;
                case XSubmapModel.CX_SOFTDN:
                    break;
                case XSubmapModel.CX_DEATH:
                    break;
                default:
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
            
            __y += XSubmapModel.CX_TILE_HEIGHT;
        }
        
        return false;
    }

//------------------------------------------------------------------------------------------
    public Ck_Collide_RT ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var r:number, c:number;
        var submapRow:number, submapCol:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
                    
        x2 &= XSubmapModel.CX_TILE_WIDTH_UNMASK;
        c = x2 >> 9;
        submapCol = (x2 & 511) >> 4;
        
        collided = false;
        
        __y = (y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK);
    //			for (__y = (y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK); __y <= (y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK); __y += XSubmapModel.CX_TILE_HEIGHT) {
        while (__y <= (y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK)) {
    //				c = x2/m_submapWidth;
    //				r = __y/m_submapHeight;
    //				i = (int ((__y & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x2 & 511)/XSubmapModel.CX_TILE_WIDTH);
    //				switch (m_XSubmaps[r][c].cmap[i]) {
                
            switch (this.m_XSubmaps[__y >> 9][c].cmap[((__y & 496) << 1) + submapCol]) {
            // ([
                case XSubmapModel.CX_EMPTY:
                    break;
                case XSubmapModel.CX_SOLID:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_RT;
                    
                        this.oX = (x2 - (this.m_cx.right) - 1);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOLIDX001:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_RT;

                        this.oX = (x2 - (this.m_cx.right) - 1);
        
                        collided = true;
                    break; // },
                case XSubmapModel.CX_SOFT:
                    break;
                case XSubmapModel.CX_JUMP_THRU:
                    break;
                    
                case XSubmapModel.CX_UL45:
                    break;
                case XSubmapModel.CX_UR45:
                    break;
                case XSubmapModel.CX_LL45:
                    break;
                case XSubmapModel.CX_LR45:
                    break;
                
                case XSubmapModel.CX_UL225A:
                    break;
                case XSubmapModel.CX_UL225B:
                    break;
                case XSubmapModel.CX_UR225A:
                    break;
                case XSubmapModel.CX_UR225B:
                    break;
                case XSubmapModel.CX_LL225A:
                    break;
                case XSubmapModel.CX_LL225B:
                    break;
                case XSubmapModel.CX_LR225A:
                    break;
                case XSubmapModel.CX_LR225B:
                    break;
                
                case XSubmapModel.CX_UL675A:
                    break;
                case XSubmapModel.CX_UL675B:
                    break;
                case XSubmapModel.CX_UR675A:
                    break;
                case XSubmapModel.CX_UR675B:
                    break;
                case XSubmapModel.CX_LL675A:
                    break;
                case XSubmapModel.CX_LL675B:
                    break;
                case XSubmapModel.CX_LR675A:
                    break;
                case XSubmapModel.CX_LR675B:
                    break;
                    
                case XSubmapModel.CX_SOFTLF:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_RT;

                        this.oX = (x2 - (this.m_cx.right) - 1);
        
                        collided = true;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    break;
                case XSubmapModel.CX_SOFTUP:
                    break;
                case XSubmapModel.CX_SOFTDN:
                    break;
                case XSubmapModel.CX_DEATH:
                    break;
                default:
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
            
            __y += XSubmapModel.CX_TILE_HEIGHT;
        }
        
        return false;
    }
            
//------------------------------------------------------------------------------------------
    public Ck_Slope_RT ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var looking:boolean = true;
        var r:number, c:number;
        var x15:number;
        var y15:number;
        
        collided = false;
        
    //------------------------------------------------------------------------------------------
        // top
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x2/m_submapWidth;
            //				r = y1/m_submapHeight;
            //				i = (int ((y1 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x2 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x2 >> 9;
            r = y1 >> 9;
            i = ( ((y1 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x2 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    y1 = (y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + XSubmapModel.CX_TILE_HEIGHT;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL45:
                    // function ():void {	
                    var __x_LL45:Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __x_LL45[x15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_LL45[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LR45:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225A:
                    // function ():void {	
                    var __x_LL225A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __x_LL225A[x15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_LL225A[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL225B:
                    // function ():void {	
                    var __x_LL225B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __x_LL225B[x15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_LL225B[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675A: // new
                    // function ():void {								
                    var __x_LL675A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    var __y_LL675A:Array<number> = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_LL675A[y15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LL675A[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_LL675B: // new
                    // function ():void {							
                    var __x_LL675B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    var __y_LL675B:Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 10, 12, 14];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_LL675B[y15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LL675B[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    
                    break;	
                case XSubmapModel.CX_LR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_SOFTLF:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTUP:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    // function ():void {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + XSubmapModel.CX_TILE_HEIGHT - this.m_cx.top);
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
    //------------------------------------------------------------------------------------------
        // bottom
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x2/m_submapWidth;
            //				r = y2/m_submapHeight;
            //				i = (int ((y2 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x2 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x2 >> 9;
            r = y2 >> 9;
            i = ( ((y2 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x2 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    y2 = (y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) - 1;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    // function ():void {	
                    var __x_UL45:Array<number> = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __x_UL45[x15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_UL45[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },			
                case XSubmapModel.CX_UR45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR45:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL225A:
                    // function ():void {	
                    var __x_UL225A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __x_UL225A[x15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_UL225A[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },	
                case XSubmapModel.CX_UL225B:
                    // function ():void {	
                    var __x_UL225B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __x_UL225B[x15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_UL225B[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },	
                case XSubmapModel.CX_UR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL675A: // new
                    // function ():void {								
                    var __x_UL675A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    var __y_UL675A:Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 14, 12, 10, 8, 6, 4, 2, 0];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_UL675A[y15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UL675A[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_UL675B: // new
                    // function ():void {							
                    var __x_UL675B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    var __y_UL675B:Array<number> = [14, 12, 10, 8, 6, 4, 2, 0, -2, -4, -6, -8, -10, -12, -14, -16];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_UL675B[y15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UL675B[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    
                    break;	
                case XSubmapModel.CX_UR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_SOFTLF:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTUP:
                    // function ():void {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) - (this.m_cx.bottom) - 1);
                    
                    looking = false;								
                    break; // },
                case XSubmapModel.CX_SOFTDN:
                    looking = false;
                    break;
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
        return false;
    }

//------------------------------------------------------------------------------------------
    public Ck_Slope_LF ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var looking:boolean = true;
        var r:number, c:number;
        var x15:number;
        var y15:number;
        
        collided = false;
        
    //------------------------------------------------------------------------------------------
        // top
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x1/m_submapWidth;
            //				r = y1/m_submapHeight;
            //				i = (int ((y1 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x1 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x1 >> 9;
            r = y1 >> 9;
            i = ( ((y1 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x1 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    y1 = (y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + XSubmapModel.CX_TILE_HEIGHT;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR45:
                    // function ():void {	
                    var __x_LR45:Array<number> = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __x_LR45[x15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_LR45[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    break; // },			
                case XSubmapModel.CX_UL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225A:
                    // function ():void {	
                    var __x_LR225A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __x_LR225A[x15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_LR225A[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    break; // },		
                case XSubmapModel.CX_LR225B:
                    // function ():void {	
                    var __x_LR225B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __x_LR225B[x15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_LR225B[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    break; // },		
                
                case XSubmapModel.CX_UL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675A: // new
                    // function ():void {								
                    var __x_LR675A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    var __y_LR675A:Array<number> = [32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_LR675A[y15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LR675A[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_LR675B: // new
                    // function ():void {							
                    var __x_LR675B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    var __y_LR675B:Array<number> = [16, 14, 12, 10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_LR675B[y15]) {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LR675B[x15] - this.m_cx.top);
                    }
                    
                    looking = false;
                    
                    break;	
                
                case XSubmapModel.CX_SOFTLF:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTUP:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    // function ():void {
                        this.oY = ((y1 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + XSubmapModel.CX_TILE_HEIGHT - this.m_cx.top);
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
    //------------------------------------------------------------------------------------------
        // bottom
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x1/m_submapWidth;
            //				r = y2/m_submapHeight;
            //				i = (int ((y2 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x1 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x1 >> 9;
            r = y2 >> 9;
            i = ( ((y2 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x1 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    y2 = (y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) - 1;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR45:
                    // function ():void {	
                    var __x_UR45:Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __x_UR45[x15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_UR45[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR45:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225A:
                    // function ():void {	
                    var __x_UR225A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __x_UR225A[x15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_UR225A[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_UR225B:
                    // function ():void {	
                    var __x_UR225B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __x_UR225B[x15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) + __x_UR225B[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675A: //new
                    // function ():void {				
                    var __x_UR675A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    var __y_UR675A:Array<number> = [0, 2, 4, 6, 8, 10, 12, 14, 0, 0, 0, 0, 0, 0, 0, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_UR675A[y15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UR675A[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_UR675B: // new
                    // function ():void {				
                    var __x_UR675B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    var __y_UR675B:Array<number> = [-16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_UR675B[y15]) {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UR675B[x15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_SOFTLF:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTUP:
                    // function ():void {
                        this.oY = ((y2 & XSubmapModel.CX_TILE_HEIGHT_UNMASK) - (this.m_cx.bottom) - 1);
                    
                    looking = false;								
                    break; // },
                case XSubmapModel.CX_SOFTDN:
                    looking = false;
                    break;
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
        return false;
    }

//------------------------------------------------------------------------------------------
    public Ck_Slope_DN ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var looking:boolean = true;
        var r:number, c:number;
        var x15:number;
        var y15:number;
        
        collided = false;
        
    //------------------------------------------------------------------------------------------
        // left
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x1/m_submapWidth;
            //				r = y2/m_submapHeight;
            //				i = (int ((y2 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x1 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x1 >> 9;
            r = y2 >> 9;
            i = ( ((y2 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x1 & this.m_submapWidthMask) >> 4);
            
            if (r > 63) {
                return false;
            }
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    x1 = (x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + XSubmapModel.CX_TILE_WIDTH;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR45:
                    // function ():void {				
                    var __y_UR45:Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __y_UR45[y15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UR45[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR45:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225A:
                    // function ():void {				
                    var __y_UR225A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    var __x_UR225A:Array<number> = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __y_UR225A[x15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_UR225A[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_UR225B:
                    // function ():void {				
                    var __y_UR225B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    var __x_UR225B:Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 6, 8, 10, 12, 14, 16];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __y_UR225B[x15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_UR225B[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UR675A: // new
                    // function ():void {								
                    var __x_UR675A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    var __y_UR675A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_UR675A[y15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UR675A[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_UR675B: // new
                    // function ():void {							
                    var __x_UR675B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    var __y_UR675B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_UR675B[y15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UR675B[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    
                    break;	
                
                case XSubmapModel.CX_LL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_SOFTLF:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_LF;
                    
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + XSubmapModel.CX_TILE_WIDTH - this.m_cx.left);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOFTUP:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    looking = false;
                    break;
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
    //------------------------------------------------------------------------------------------
        // right
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x2/m_submapWidth;
            //				r = y2/m_submapHeight;
            //				i = (int ((y2 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x2 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x2 >> 9;
            r = y2 >> 9;
            i = ( ((y2 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x2 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    x2 = (x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) - 1;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL45:
                    // function ():void {				
                    var __y_UL45:Array<number> = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __y_UL45[y15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UL45[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_UR45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR45:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL225A:
                    // function ():void {				
                    var __y_UL225A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    var __x_UL225A:Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 13, 11, 9, 7, 5, 3, 1, -1];   
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __y_UL225A[x15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_UL225A[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_UL225B:
                    // function ():void {				
                    var __y_UL225B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    var __x_UL225B:Array<number> = [13, 11, 9, 7, 5, 3, 1, -1, -3, -5, -7, -9, -11, -13, -15, -17];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 >= __y_UL225B[x15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_UL225B[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_UR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL675A: // new
                    // function ():void {								
                    var __x_UL675A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    var __y_UL675A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_UL675A[y15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UL675A[y15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_UL675B: // new
                    // function ():void {							
                    var __x_UL675B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    var __y_UL675B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y2 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_UL675B[y15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_UL675B[y15] - this.m_cx.bottom - 1);
                    }
                    
                    looking = false;
                    
                    break;
                
                case XSubmapModel.CX_UR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_SOFTLF:
                    // function ():void {
                    this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_RT;
                    
                    this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) - (this.m_cx.right) - 1);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOFTRT:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTUP:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    looking = false;
                    break;
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
        return false;		
    }

//------------------------------------------------------------------------------------------
    public Ck_Slope_UP ():boolean {
        var x1:number, y1:number, x2:number, y2:number;
        var i:number, __x:number, __y:number;
        var collided:boolean;
        var looking:boolean = true;
        var r:number, c:number;
        var x15:number;
        var y15:number;
        
        collided = false;
        
    //------------------------------------------------------------------------------------------
        // left
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x1/m_submapWidth;
            //				r = y1/m_submapHeight;
            //				i = (int ((y1 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x1 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x1 >> 9;
            r = y1 >> 9;
            i = ( ((y1 & this.m_submapHeightMask) >> 4) * this.m_cols) +  ((x1 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    x1 = (x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + XSubmapModel.CX_TILE_WIDTH;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR45:
                    // function ():void {				
                    var __y_LR45:Array<number> = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __y_LR45[y15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LR45[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    break; // },
                
                case XSubmapModel.CX_UL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225A:
                    // function ():void {								
                    var __y_LR225A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    var __x_LR225A:Array<number> = [32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __y_LR225A[x15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_LR225A[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LR225B:
                    // function ():void {							
                    var __y_LR225B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    var __x_LR225B:Array<number> = [16, 14, 12, 10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __y_LR225B[x15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_LR225B[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    break; // },
                
                case XSubmapModel.CX_UL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_LR675A: // new
                    // function ():void {								
                    var __x_LR675A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    var __y_LR675A:Array<number> = [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_LR675A[y15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LR675A[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_LR675B: // new
                    // function ():void {							
                    var __x_LR675B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    var __y_LR675B:Array<number> = [7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
                    
                    x15 = x1 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 <= __x_LR675B[y15]) {
                        this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LR675B[y15] - this.m_cx.left);
                    }
                    
                    looking = false;
                    
                    break;	
                
                case XSubmapModel.CX_SOFTLF:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTRT:
                    // function ():void {
                    this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_LF;
                    
                    this.oX = ((x1 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + XSubmapModel.CX_TILE_WIDTH - this.m_cx.left);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOFTUP:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    looking = false;
                    break;
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
    //------------------------------------------------------------------------------------------
        // right
    //------------------------------------------------------------------------------------------
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        looking = true;
        
        while (looking) {
            //				c = x2/m_submapWidth;
            //				r = y1/m_submapHeight;
            //				i = (int ((y1 & m_submapHeightMask)/XSubmapModel.CX_TILE_HEIGHT) * m_cols) + int ((x2 & m_submapWidthMask)/XSubmapModel.CX_TILE_WIDTH);
            
            c = x2 >> 9;
            r = y1 >> 9;
            i = ( ((y1 & this.m_submapHeightMask) >> 4) * this.m_cols) + ((x2 & this.m_submapWidthMask) >> 4);
            
            switch (this.m_XSubmaps[r][c].cmap[i]) {
                // ([
                case XSubmapModel.CX_EMPTY:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLIDX001:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOLID:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFT:
                    // function ():void {
                    x2 = (x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) - 1;
                    break; // },
                case XSubmapModel.CX_JUMP_THRU:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL45:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR45:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL45:
                    // function ():void {				
                    var __y_LL45:Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __y_LL45[y15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LL45[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LR45:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR225B:
                    looking = false;
                    break;
                case XSubmapModel.CX_LL225A:
                    // function ():void {					
                    var __y_LL225A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    var __x_LL225A:Array<number> = [0, 2, 4, 6, 8, 10, 12, 14, 0, 0, 0, 0, 0, 0, 0, 0];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __y_LL225A[x15]) {		
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_LL225A[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LL225B:
                    // function ():void {				
                    var __y_LL225B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    var __x_LL225B:Array<number> = [-16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (y15 <= __y_LL225B[x15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __x_LL225B[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    break; // },
                case XSubmapModel.CX_LR225A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR225B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_UL675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UL675B:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_UR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_LL675A: // new
                    // function ():void {								
                    var __x_LL675A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    var __y_LL675A:Array<number> = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_LL675A[y15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LL675A[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    
                    break;
                case XSubmapModel.CX_LL675B: // new
                    // function ():void {							
                    var __x_LL675B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    var __y_LL675B:Array<number> = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
                    
                    x15 = x2 & XSubmapModel.CX_TILE_WIDTH_MASK;
                    y15 = y1 & XSubmapModel.CX_TILE_HEIGHT_MASK;
                    
                    if (x15 >= __x_LL675B[y15]) {
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) + __y_LL675B[y15] - this.m_cx.right - 1);
                    }
                    
                    looking = false;
                    
                    break;	
                
                case XSubmapModel.CX_LR675A:
                    looking = false;
                    break;
                case XSubmapModel.CX_LR675B:
                    looking = false;
                    break;
                
                case XSubmapModel.CX_SOFTLF:
                    // function ():void {
                        this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_RT;
                    
                        this.oX = ((x2 & XSubmapModel.CX_TILE_WIDTH_UNMASK) - (this.m_cx.right) - 1);
                    
                    collided = true;
                    break; // },
                case XSubmapModel.CX_SOFTRT:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTUP:
                    looking = false;
                    break;
                case XSubmapModel.CX_SOFTDN:
                    looking = false;
                    break;
                case XSubmapModel.CX_DEATH:
                    looking = false;
                    break;
            } // ])[cx] ();
            
            if (collided) {
                return true;
            }
        }
        
        return false;		
    }

//------------------------------------------------------------------------------------------		
    public Ck_Obj_LF ():boolean {
        if (this.m_objectCollisionList == null) {
            this.m_objectCollisionList = this.getObjectCollisionList ();
        }
        
        return this.Ck_Obj_LF9 (this.m_objectCollisionList);
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_RT ():boolean {
        if (this.m_objectCollisionList == null) {
            this.m_objectCollisionList = this.getObjectCollisionList ();
        }
        
        return this.Ck_Obj_RT9 (this.m_objectCollisionList);
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_UP ():boolean {
        if (this.m_objectCollisionList == null) {
            this.m_objectCollisionList = this.getObjectCollisionList ();
        }
        
        return this.Ck_Obj_UP9 (this.m_objectCollisionList);
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_DN ():boolean {
        if (this.m_objectCollisionList == null) {
            this.m_objectCollisionList = this.getObjectCollisionList ();
        }
        
        return this.Ck_Obj_DN9 (this.m_objectCollisionList);
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_LF9 (__objectCollisionList:Map<XGameObject, XRect>):boolean {
        var x1:number, y1:number, x2:number, y2:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        var __collided:boolean = false;
        
        function __collisionCallback (__logicObject:XGameObjectCX, __rect:XRect):void {
            if (__logicObject.allowLFCollisions) {
                this.oX = __rect.right - this.m_cx.left + 1;
                
                __logicObject.objectCollisionCallback (self);
                
                this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_LF;
            }
        }
        
        XType.doWhile (__objectCollisionList,  /* @:castkey */
            function (__logicObject:XGameObjectCX):boolean {
                var __rect:XRect = __objectCollisionList.get (__logicObject) as XRect;
                
                if (x2 < __rect.left || x1 > __rect.right || y2 < __rect.top || y1 > __rect.bottom) {
                    return true;
                }
                
                __collisionCallback (__logicObject, __rect);
                
                __collided = true;
                
                return true;
            }
        );
        
        return __collided;
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_RT9 (__objectCollisionList:Map<XGameObject, XRect>):boolean {
        var x1:number, y1:number, x2:number, y2:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        var __collided:boolean = false;
        
        function __collisionCallback (__logicObject:XGameObjectCX, __rect:XRect):void {
            if (__logicObject.allowRTCollisions) {
                this.oX = __rect.left - this.m_cx.right - 1;
                
                __logicObject.objectCollisionCallback (self);
                
                this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_RT;
            }
        }
        
        XType.doWhile (__objectCollisionList,  /* @:castkey */
            function (__logicObject:XGameObjectCX):boolean {
                var __rect:XRect = __objectCollisionList.get (__logicObject) as XRect;
                
                if (x2 < __rect.left || x1 > __rect.right || y2 < __rect.top || y1 > __rect.bottom) {
                    return true;
                }
                
                __collisionCallback (__logicObject, __rect);
                
                __collided = true;
                
                return true;
            }
        );
        
        return __collided;
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_UP9 (__objectCollisionList:Map<XGameObject, XRect>):boolean {
        var x1:number, y1:number, x2:number, y2:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        var __collided:boolean = false;

        function __collisionCallback (__logicObject:XGameObjectCX, __rect:XRect):void {
            if (__logicObject.allowUPCollisions) {
                this.oY = __rect.bottom - this.m_cx.top + 1;
                
                __logicObject.objectCollisionCallback (self);
                
                this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_UP;
            }
        }
        
        XType.doWhile (__objectCollisionList,  /* @:castkey */
            function (__logicObject:XGameObjectCX):boolean {
                var __rect:XRect = __objectCollisionList.get (__logicObject) as XRect;
                
                if (x2 < __rect.left || x1 > __rect.right || y2 < __rect.top || y1 > __rect.bottom) {
                    return true;
                }
                
                __collisionCallback (__logicObject, __rect);
                
                __collided = true;
                
                return true;
            }
        );
        
        return __collided;
    }

//------------------------------------------------------------------------------------------
    public Ck_Obj_DN9 (__objectCollisionList:Map<XGameObject, XRect>):boolean {
        var x1:number, y1:number, x2:number, y2:number;
        
        x1 = Math.floor (this.oX + this.m_cx.left);
        x2 = Math.floor (this.oX + this.m_cx.right);
        y1 = Math.floor (this.oY + this.m_cx.top);
        y2 = Math.floor (this.oY + this.m_cx.bottom);
        
        var __collided:boolean = false;
        
        function __collisionCallback (__logicObject:XGameObjectCX, __rect:XRect):void {
            if (__logicObject.allowDNCollisions) {
                this.oY = __rect.top - this.m_cx.bottom - 1;
                
                __logicObject.objectCollisionCallback (self);
                
                this.m_CX_Collide_Flag |= XGameObjectCX.CX_COLLIDE_DN;
            }
        }
        
        XType.doWhile (__objectCollisionList,  /* @:castkey */
            function (__logicObject:XGameObjectCX):boolean {
                var __rect:XRect = __objectCollisionList.get (__logicObject) as XRect;
                
                if (x2 < __rect.left || x1 > __rect.right || y2 < __rect.top || y1 > __rect.bottom || y2 > __rect.bottom) {
                    return true;
                }
                
                __collisionCallback (__logicObject, __rect);
                
                __collided = true;
                
                return true;
            }
        );
        
        return __collided;
    }

//------------------------------------------------------------------------------------------
    public getObjectCollisionList ():Map<XGameObject, XRect> {
        return this.world.getObjectCollisionList ().getRects (this.getLayer ());	
    }

//------------------------------------------------------------------------------------------
}