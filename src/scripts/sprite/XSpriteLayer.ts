//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { XSprite } from './XSprite';
import { XDepthSprite } from './XDepthSprite';

//------------------------------------------------------------------------------------------
export class XSpriteLayer extends XSprite {
    private m_XDepthSpriteMap:Map<XDepthSprite, number>; 
		
    public forceSort:boolean;
    
    public list:Array<XDepthSprite>;

    //------------------------------------------------------------------------------------------
    constructor () {
        super ();

        this.m_XDepthSpriteMap = new Map<XDepthSprite, number> ();

        this.list = new Array<XDepthSprite> ();

        var i:number;

        for (i=0; i<2000; i++) {
            this.list.push (null);
        }

        this.forceSort = true;
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
    public addSprite (__sprite:PIXI.Sprite, __depth:number, __visible:boolean = true):XDepthSprite {
        var __depthSprite:XDepthSprite = new XDepthSprite (); /* TODO cast world.getXDepthSpritePoolManager ().borrowObject (); as XDepthSprite */
        
        __depthSprite.setup ();
        __depthSprite.alpha = 1.0;
        __depthSprite.clear ();
        __depthSprite.addSprite (__sprite, __depth, this);
        __depthSprite.visible = __visible;
        __depthSprite.world = this.world;
        __depthSprite.scale.x = __depthSprite.scale.y = 1.0;
        
        __sprite.visible = true;
        
        this.addChild (__depthSprite);
            
        this.m_XDepthSpriteMap.set (__depthSprite, 0);
        
        return __depthSprite;
    }	

    //------------------------------------------------------------------------------------------
    public addDepthSprite (__depthSprite:XDepthSprite):XDepthSprite {	
        this.addChild (__depthSprite);
            
        this.m_XDepthSpriteMap.set (__depthSprite, 0);
        
        return __depthSprite;
    }

    //------------------------------------------------------------------------------------------
    public  removeSprite (__depthSprite:XDepthSprite):void {
        if (this.m_XDepthSpriteMap.has (__depthSprite)) {
            __depthSprite.cleanup ();
            
            this.removeChild (__depthSprite);
            
            /* TODO
            this.world.getXDepthSpritePoolManager ().returnObject (__depthSprite);
            */

            this.m_XDepthSpriteMap.delete (__depthSprite);
        }
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
        /* TODO
        var length:Int = 0;
        
        XType.clearArray (list);
        
        for (__key__ in m_XDepthSpriteMap.keys ()) {
            function (sprite:Dynamic):Void {
                list[length++] = sprite;
            } (__key__);
        }

            list.sort (
                function (a:XDepthSprite, b:XDepthSprite):Int {
                    return Std.int (a.depth2 - b.depth2);
                }
            );				
        
        var i:Int;

        for (i in 0 ... length) {
            setChildIndex (list[i], i);
        }
        */
    }

//------------------------------------------------------------------------------------------    
}