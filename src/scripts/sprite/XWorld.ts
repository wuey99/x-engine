//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from './XSprite';
import { XSpriteLayer } from './XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { XTask } from '../task/XTask';

//------------------------------------------------------------------------------------------
export class XWorld extends XSprite {
 
    public MAX_LAYERS:number;
    public m_layers:Array<XSpriteLayer>;
    public m_XApp:XApp;

    public sprite:PIXI.Sprite;

    //------------------------------------------------------------------------------------------
    constructor (__parent:any, __XApp:XApp, __layers:number = 8, __timerInterval:number = 32) {
        super ();

        this.m_XApp = __XApp;

        this.MAX_LAYERS = __layers;

        this.m_layers = new Array<XSpriteLayer> ();

        console.log (": ", XTask.BEQ);
        
        var __signalManager:XSignalManager = new XSignalManager (__XApp);
        __signalManager.createXSignal ();

        var __signal = new XSignal ();
        __signal.addListener (function (value:string):void {
            console.log (": fired signal: ", value);
        });
        __signal.fireSignal ("hello");
    }

	//------------------------------------------------------------------------------------------
	public setup ():void {
        super.setup ();

        var callback:any = this.initTestSprite.bind (this);

        callback ();
    }
    
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

	//------------------------------------------------------------------------------------------
	public initTestSprite (a:number):void {
        console.log (": initTestSprite: ", a);
        
        /* Sprite */
        this.sprite = PIXI.Sprite.from ('images/logo.png');
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.m_XApp.renderer.width / 2;
        this.sprite.y = this.m_XApp.renderer.height / 2;
        this.addChild (this.sprite);
    }

    //------------------------------------------------------------------------------------------
    public update ():void {
        if (this.sprite != null) 
            this.sprite.rotation += 0.01;

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