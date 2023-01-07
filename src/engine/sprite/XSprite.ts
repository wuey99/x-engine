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
import * as PIXI from 'pixi.js'
import { XWorld } from './XWorld';
import { XApp } from '../app/XApp';
import { XRect } from '../geom/XRect';
import { XPoint } from '../geom/XPoint';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XSprite extends PIXI.Sprite {

    public m_world:XWorld;
    
    public m_pos:XPoint;
    public m_rect:XRect;
    public m_scale:number;

    public static g_XApp:XApp;

    //------------------------------------------------------------------------------------------
    constructor () {
        super ();
    }

	//------------------------------------------------------------------------------------------
	public setup ():void {
        this.m_pos = XSprite.g_XApp.getXPointPoolManager ().borrowObject (); 
        this.m_rect = XSprite.g_XApp.getXRectPoolManager ().borrowObject ();

        this.m_scale = 1.0;
	}
		
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
        XSprite.g_XApp.getXPointPoolManager ().returnObject (this.m_pos);
        XSprite.g_XApp.getXRectPoolManager ().returnObject (this.m_rect);
    }
        
	//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XSprite.g_XApp = __XApp;
	}
        
    //------------------------------------------------------------------------------------------
    public get world ():XWorld {
        return this.m_world;
    }
    
    //------------------------------------------------------------------------------------------
    public set world (__XWorld:XWorld) {
        this.m_world = __XWorld;		
    }

    //------------------------------------------------------------------------------------------
    public getPos ():XPoint {
        this.m_pos.x = this.x;
        this.m_pos.y = this.y;
        
        return this.m_pos;
    }

    //------------------------------------------------------------------------------------------		
    public setPos (__p:XPoint):void {
        this.m_pos.x = this.x = __p.x;
        this.m_pos.y = this.y = __p.y;
    }

    //------------------------------------------------------------------------------------------
    public setScale (__scale:number):void {
        this.m_scale = __scale;
    }

    //------------------------------------------------------------------------------------------
    public getScale ():number {
        return this.m_scale;
    }

//------------------------------------------------------------------------------------------
    public viewPort (__canvasWidth:number, __canvasHeight:number):XRect {
        this.m_rect.x = -this.x/this.m_scale
        this.m_rect.y = -this.y/this.m_scale;
        this.m_rect.width = __canvasWidth/this.m_scale;
        this.m_rect.height = __canvasHeight/this.m_scale;
        
        return this.m_rect;
    }

//------------------------------------------------------------------------------------------    
}