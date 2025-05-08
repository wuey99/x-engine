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
import { XDepthSprite } from './XDepthSprite';
import { XSpriteLayer } from './XSpriteLayer';
import { XType } from '../type/XType';
import { XRect } from '../geom/XRect';
import { XApp } from '../app/XApp';

//------------------------------------------------------------------------------------------
export class XSpriteLayer0 extends XSpriteLayer {
    private m_container:PIXI.ParticleContainer;

    //------------------------------------------------------------------------------------------
    constructor () {
        super ();

        this.m_container = new PIXI.ParticleContainer ({
            dynamicProperties: {
                position: true,
                scale: true,
                vertices: true,
                rotation: true,
                tint: true,
                uvs: true
            }
        });

        this.m_container.sortableChildren = true;

        this.addChild (this.m_container);
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
    public addChildToContainer (__sprite:PIXI.Container | PIXI.Particle):void {
        this.m_container.addParticle (__sprite as PIXI.Particle);
    }

    //------------------------------------------------------------------------------------------
    public removeChildFromContainer (__sprite:PIXI.Container | PIXI.Particle):void {
        this.m_container.removeParticle (__sprite as PIXI.Particle);
    }

    //------------------------------------------------------------------------------------------	
    public depthSort ():void {
        this.m_container.sortChildren ();
    }
    
//------------------------------------------------------------------------------------------    
}