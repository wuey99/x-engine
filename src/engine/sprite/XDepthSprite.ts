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
import * as PIXI from 'pixi.js';
import { XSprite } from './XSprite';
import { XSpriteLayer } from './XSpriteLayer';

//------------------------------------------------------------------------------------------
export class XDepthSprite extends XSprite {
    public m_depth:number;
    public m_depth2:number;
    public m_relativeDepthFlag:boolean;
    public m_sprite:PIXI.DisplayObject;
    public x_layer:XSpriteLayer;

    //------------------------------------------------------------------------------------------
    constructor () {
        super ();

        this.m_depth = 0;
        this.m_depth2 = 0;
        this.m_relativeDepthFlag = false;
        this.m_sprite = null;
        this.x_layer = null;
    }

	//------------------------------------------------------------------------------------------
	public setup ():void {
	}
		
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
    }
        
    //------------------------------------------------------------------------------------------
    public clear ():void {
        while (this.children.length > 0) {
            this.removeChildAt (0);
        }
    }
        
    //------------------------------------------------------------------------------------------
    public addSprite (
        __sprite:PIXI.DisplayObject,
        __depth:number,
        __layer:XSpriteLayer,
        __relative:boolean = false
        ):void {
            
        this.m_sprite = __sprite;
        this.x_layer = __layer;
        this.setDepth (__depth);
    
        this.addChild (__sprite);
        this.visible = false;
        this.relativeDepthFlag = __relative;
    }

    //------------------------------------------------------------------------------------------
    public replaceSprite (__sprite:PIXI.Sprite):void {
        this.clear ();
        
        this.m_sprite = __sprite;
        
        this.addChild (__sprite);
        
        this.setVisible (true);
    }

    //------------------------------------------------------------------------------------------
    public getVisible ():boolean {
        return this.visible;
    }

    //------------------------------------------------------------------------------------------
    public setVisible (__value:boolean):void {
        if (this.m_sprite != null) {
            this.m_sprite.visible = __value;
        }   

        this.visible = __value;
    }
    
    //------------------------------------------------------------------------------------------	
    public setDepth (__depth:number):void {
        this.m_depth = __depth;
        this.depth2 = __depth;
        this.zIndex = __depth;
    }		

    //------------------------------------------------------------------------------------------	
    public getDepth ():number {
        return this.m_depth;
    }

    //------------------------------------------------------------------------------------------
    public get depth ():number {
        return this.m_depth;
    }

    //------------------------------------------------------------------------------------------
    public set depth (__depth:number) {
        this.m_depth = __depth;
        this.depth2 = __depth;		
    }

    //------------------------------------------------------------------------------------------
    public getRelativeDepthFlag ():boolean {
        return this.m_relativeDepthFlag;
    }

    //------------------------------------------------------------------------------------------
    public setRelativeDepthFlag (__relative:boolean):void {
        this.m_relativeDepthFlag = __relative;
    }

    //------------------------------------------------------------------------------------------
    public get relativeDepthFlag ():boolean {
        return this.m_relativeDepthFlag;
    }

     //------------------------------------------------------------------------------------------
    public set relativeDepthFlag (__relative:boolean) {
        this.m_relativeDepthFlag = __relative;			
    }

    //------------------------------------------------------------------------------------------
    public get depth2 ():number {
        return this.m_depth2;
    }

    //------------------------------------------------------------------------------------------
    public set depth2 (__depth:number) {
        if (__depth != this.m_depth2) {
            this.m_depth2 = __depth;

        }			
    }

//------------------------------------------------------------------------------------------    
}