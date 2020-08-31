//------------------------------------------------------------------------------------------
// import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from './XSprite';
import { XSpriteLayer } from './XSpriteLayer';

//------------------------------------------------------------------------------------------
export class XWorld extends XSprite {
 
    public MAX_LAYERS:number;
    public m_layers:Array<XSpriteLayer>;

    //------------------------------------------------------------------------------------------
    constructor (__parent:any, __XApp:XApp, __layers:number = 8, __timerInterval:number = 32) {
        super ();

        this.MAX_LAYERS = __layers;

        this.m_layers = new Array<XSpriteLayer> ();
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
    public update ():void {
        /*
        for (i = 0; i<MAX_LAYERS; i++) {
            m_layers[i].depthSort ();
        }
        
        m_hudLayer.depthSort ();
        
        emptyKillQueue ();
        
        for (__key__ in m_gameObjects.keys ()) {
            function (x:Dynamic):Void {
                var __gameObject:GameObject = cast x;
                
    				// console.log (": root gameObject: ", __gameObject, __gameObject.parent, __gameObject.parent.visible);
                    
                    __gameObject.setMasterX (__gameObject.x);
                    __gameObject.setMasterY (__gameObject.y);
                    __gameObject.setMasterAlpha (__gameObject.alpha);
                    __gameObject.setMasterDepth (__gameObject.getDepth ());
                    __gameObject.setMasterVisible (__gameObject.visible);
                    __gameObject.setMasterScaleX (__gameObject.scaleX);
                    __gameObject.setMasterScaleY (__gameObject.scaleY);
                    __gameObject.setMasterFlipX (__gameObject.getFlipX ());
                    __gameObject.setMasterFlipY (__gameObject.getFlipY ());
                    __gameObject.setMasterRotation (__gameObject.rotation);
                    
                __gameObject.update ();
            } (__key__); 
        }
        */
    }

//------------------------------------------------------------------------------------------
}