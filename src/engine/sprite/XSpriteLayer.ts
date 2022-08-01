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
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from './XSprite';
import { XDepthSprite } from './XDepthSprite';
import { XType } from '../type/XType';
import { XRect } from '../geom/XRect';
import { XApp } from '../app/XApp';

//------------------------------------------------------------------------------------------
export class XSpriteLayer extends XSprite {
    private m_XDepthSpriteMap:Map<XDepthSprite, number>; 

    //------------------------------------------------------------------------------------------
    constructor () {
        super ();

        this.m_XDepthSpriteMap = new Map<XDepthSprite, number> ();

        this.sortableChildren = true;
    }

	//------------------------------------------------------------------------------------------
	public setup ():void {
        super.setup ();
	}
		
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

    //------------------------------------------------------------------------------------------
    public addChildToContainer (__sprite:PIXI.DisplayObject):void {
    }

    //------------------------------------------------------------------------------------------
    public removeChildFromContainer (__sprite:PIXI.DisplayObject):void {
    }

    //------------------------------------------------------------------------------------------
    public addSprite (__sprite:PIXI.DisplayObject, __depth:number, __visible:boolean = true):XDepthSprite {
        var __depthSprite:XDepthSprite = this.world.getXDepthSpritePoolManager ().borrowObject () as XDepthSprite;
        __depthSprite.setup ();
        
        __depthSprite.alpha = 1.0;
        __depthSprite.clear ();
        __depthSprite.addSprite (__sprite, __depth, this);
        __depthSprite.visible = __visible;
        __depthSprite.world = this.world;
        __depthSprite.scale.x = __depthSprite.scale.y = 1.0;
        __depthSprite.zIndex = __depth;

        __sprite.visible = true;
        
        this.addChildToContainer (__depthSprite);
            
        this.m_XDepthSpriteMap.set (__depthSprite, 0);
        
        return __depthSprite;
    }	

    //------------------------------------------------------------------------------------------
    public addSprite0 (__sprite:PIXI.DisplayObject, __depth:number, __visible:boolean = true):PIXI.DisplayObject {
        __sprite.zIndex = __depth;

        __sprite.visible = true;
        
        this.addChildToContainer (__sprite);

        return __sprite;
    }	

    //------------------------------------------------------------------------------------------
    public addDepthSprite (__depthSprite:XDepthSprite):XDepthSprite {	
        this.addChild (__depthSprite);
            
        this.m_XDepthSpriteMap.set (__depthSprite, 0);
        
        return __depthSprite;
    }

    //------------------------------------------------------------------------------------------
    public removeSprite (__depthSprite:XDepthSprite):void {
        if (this.m_XDepthSpriteMap.has (__depthSprite)) {
            __depthSprite.cleanup ();
            
            this.removeChildFromContainer (__depthSprite);
            
            this.world.getXDepthSpritePoolManager ().returnObject (__depthSprite);

            this.m_XDepthSpriteMap.delete (__depthSprite);
        }
    }

    //------------------------------------------------------------------------------------------
    public removeSprite0 (__sprite:PIXI.DisplayObject):void {
        this.removeChildFromContainer (__sprite);
    }

    //------------------------------------------------------------------------------------------
    public moveSprite (__depthSprite:XDepthSprite):void {
        if (this.m_XDepthSpriteMap.has (__depthSprite)) {
            this.removeChild (__depthSprite);
            
            this.m_XDepthSpriteMap.delete (__depthSprite);
        }
    }

    //------------------------------------------------------------------------------------------	
    public depthSort ():void {
    }

//------------------------------------------------------------------------------------------    
}