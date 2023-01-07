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
import { XApp } from '../app/XApp';
import { XSprite } from './XSprite';
import { XSpriteLayer } from './XSpriteLayer';
import { XSpriteLayer9 } from './XSpriteLayer9';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { XTask } from '../task/XTask';
import { XDepthSprite } from './XDepthSprite';
import { XGameObject } from '../gameobject/XGameObject';
import { XType } from '../type/XType';
import { XObjectPoolManager } from '../pool/XObjectPoolManager';
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { Class } from '../type/XType';
import { G } from '../app/G';
import { XSoundSubManager } from '../sound/XSoundSubManager';
import { XBulletCollisionManager } from '../bullet/XBulletCollisionManager';
import { XClassPoolManager } from '../pool/XClassPoolManager';
import { XSoundManager } from '../sound/XSoundManager';
import { XRect } from '../geom/XRect';
import { XObjectCollisionList } from '../collision/XObjectCollisionList';
import { XObjectCollisionManager } from '../collision/XObjectCollisionManager';
import { XMapModel } from '../xmap/XMapModel';

//------------------------------------------------------------------------------------------
export class XWorld extends XSprite {
 
    public m_layers:Array<XSpriteLayer>;
    public m_layerContainers:Array<PIXI.Sprite>;
    public m_XApp:XApp;

    public m_hudLayer:XSpriteLayer;
    public m_XSignalManager:XSignalManager;
    private m_killQueue:Map<XGameObject, number>;
    private m_gameObjects:Map<XGameObject, XDepthSprite>;
    private m_childObjects:Map<XGameObject, XDepthSprite>;	
    private m_children:Map<PIXI.DisplayObject, any>;
    private m_children0:Map<PIXI.DisplayObject, any>;

    private m_streamingSoundManager:XSoundSubManager;
    private m_musicSoundManager:XSoundSubManager;
    private m_sfxSoundManager:XSoundSubManager;

    public m_XLogicObjectPoolManager:XClassPoolManager;

    private m_XBulletCollisionManager:XBulletCollisionManager;
    private m_XObjectCollisionManager:XObjectCollisionManager;
    private m_objectCollisionList:XObjectCollisionList;

    private m_matterEngine:Engine;

    public m_viewRect:XRect;
    
    public static readonly SPRITE_LAYER:number = 0;
    public static readonly SPRITE_XDEPTHSPRITE:number = 1;

    public m_XMapModel:XMapModel;
    public MAX_LAYERS:number;

    //------------------------------------------------------------------------------------------
    constructor (__parent:any, __XApp:XApp, __layers:number = 8, __timerInterval:number = 32) {
        super ();

        this.m_XApp = __XApp;

        // TODO (i needed a add background to allow events to be captured.  figure out if there's a better solution)
        var graphics = new PIXI.Graphics ();
        graphics.beginFill (0x000000, 0.0);
        graphics.drawRect (0, 0, G.SCREEN_WIDTH/4, G.SCREEN_HEIGHT/4);
        graphics.endFill ();
        graphics.alpha = 1.0;
        graphics.scale.x = 4.0;
        graphics.scale.y = 4.0;
        this.addChild (graphics);
       
        this.MAX_LAYERS = __layers;

        this.m_layers = new Array<XSpriteLayer> ();
        this.m_layerContainers = new Array<PIXI.Sprite> ();

        var i:number;

        for (i = 0; i < this.MAX_LAYERS; i++ ) {
            this.m_layers.push (null);
            this.m_layerContainers.push (null);
        }
    
        for (i = this.MAX_LAYERS - 1; i >= 0; i--) {
        // for (i = 0; i < this.MAX_LAYERS; i++) {
            this.createLayer (i);
        }
    
        this.m_hudLayer = new XSpriteLayer9 ();
        this.m_hudLayer.setup ();
        this.m_hudLayer.world = this;
        this.addChild (this.m_hudLayer);

        this.m_killQueue = new Map<XGameObject, number> ();
        
        this.m_gameObjects = new Map<XGameObject, XDepthSprite> ();
        this.m_childObjects = new Map<XGameObject, XDepthSprite> ();
        this.m_children = new Map<PIXI.DisplayObject, any> ();
        this.m_children0 = new Map<PIXI.DisplayObject, any> ();

        this.m_XBulletCollisionManager = new XBulletCollisionManager (this);
        this.m_XLogicObjectPoolManager = new XClassPoolManager ();
        this.m_XObjectCollisionManager = new XObjectCollisionManager (this);
        this.m_objectCollisionList = this.m_XObjectCollisionManager.addCollisionList ();

        this.m_streamingSoundManager = new XSoundSubManager (this.m_XApp.getXSoundManager ());
        this.m_musicSoundManager = new XSoundSubManager (this.m_XApp.getXSoundManager ());
        this.m_sfxSoundManager = new XSoundSubManager (this.m_XApp.getXSoundManager ());

        this.createMatterEngine ();
    }

	//------------------------------------------------------------------------------------------
     public createLayer (i:number):void {
        this.m_layerContainers[i] = new PIXI.Sprite ();
        this.m_layers[i] = new XSpriteLayer9 ();
        this.m_layers[i].setup ();
        this.m_layers[i].world = this;
        this.m_layerContainers[i].addChild (this.m_layers[i]);
        this.addChild (this.m_layerContainers[i]);
    }
    
	//------------------------------------------------------------------------------------------
    public replaceLayer (i:number, __spriteLayer:XSpriteLayer):void {
        while (this.m_layerContainers[i].children.length > 0) {
            this.m_layerContainers[i].removeChildAt (0);
        }
        this.m_layers[i] = __spriteLayer;
        this.m_layers[i].setup ();
        this.m_layers[i].world = this;
        this.m_layerContainers[i].addChild (this.m_layers[i]);
    }

	//------------------------------------------------------------------------------------------
	public setup ():void {
        super.setup ();
    }
    
	//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();

        this.cleanupMatterEngine ();
    
        this.m_XBulletCollisionManager.cleanup ();
        this.m_streamingSoundManager.cleanup ();
        this.m_musicSoundManager.cleanup ();
        this.m_sfxSoundManager.cleanup ();
        
        var i:number;

        for (i = 0; i < this.MAX_LAYERS; i++) {
            this.m_layers[i].cleanup ();
            this.removeChild (this.m_layers[i]);
        }
        
        this.m_hudLayer.cleanup();
        this.removeChild (this.m_hudLayer);
    }

    //------------------------------------------------------------------------------------------
    public clearCollisions ():void {
        this.m_XBulletCollisionManager.clearCollisions ();
        this.m_XObjectCollisionManager.clearCollisions ();
    }
    
    //------------------------------------------------------------------------------------------
    public updateCollisions ():void {
        var __gameObject:XGameObject;

        for (__gameObject of this.m_gameObjects.keys ()) { 
            __gameObject.updateCollisions ();
        }
    }

    //------------------------------------------------------------------------------------------
    public resetLayers ():void {
        var i:number;

        for (i=0; i < this.MAX_LAYERS; i++) {
            var __layer:XSpriteLayer = this.getLayer (i);
            __layer.x = 0;
            __layer.y = 0;
            __layer.scale.x = 1.0;
            __layer.scale.y = 1.0;
        }
    }

    //------------------------------------------------------------------------------------------
    public update ():void {
        var i:number;

        for (i = 0; i < this.MAX_LAYERS; i++) {
            this.m_layers[i].depthSort ();
        }
        
        this.m_hudLayer.depthSort ();
        
        this.emptyKillQueue ();
        
        if (!this.m_XApp.isPaused ()) {
            Matter.Engine.update (this.getMatterEngine ());
        }

        var __gameObject:XGameObject;

        for (__gameObject of this.m_gameObjects.keys ()) {
            __gameObject.m_masterX = __gameObject.x;
            __gameObject.m_masterY = __gameObject.y;
            __gameObject.m_masterAlpha = __gameObject.alpha;
            __gameObject.m_masterDepth = __gameObject.m_depth;
            __gameObject.m_masterScaleX = __gameObject.scale.x;
            __gameObject.m_masterScaleY = __gameObject.scale.y;
            __gameObject.m_masterFlipX = __gameObject.m_flipX;
            __gameObject.m_masterFlipY = __gameObject.m_flipY;
            __gameObject.m_masterRotation = __gameObject.angle;
            __gameObject.m_masterMouseEnabled = __gameObject.m_mouseEnabled;
                    
            __gameObject.update ();
        }
    }

    //------------------------------------------------------------------------------------------
    public addGameObject (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
        __gameObject.setup (this, __layer, __depth);
        
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_gameObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }			

    //------------------------------------------------------------------------------------------
    public addDetachedGameObject (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
        __gameObject.setup (this, __layer, __depth);
        
        this.m_gameObjects.set (__gameObject, null);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public addPooledGameObject (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = this.getXLogicObjectPoolManager ().borrowObject (__class) as XGameObject;
        __gameObject.setup (this, __layer, __depth);
        
        __gameObject.setPoolClass (__class);
        
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_gameObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }			

    //------------------------------------------------------------------------------------------
    public addPooledDetachedGameObject (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = this.getXLogicObjectPoolManager ().borrowObject (__class) as XGameObject;
        __gameObject.setup (this, __layer, __depth);
        
        __gameObject.setPoolClass (__class);
        
        this.m_gameObjects.set (__gameObject, null);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public addGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
        __gameObject.setup(this, __layer, __depth);
        
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_childObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public addGameObjectAsDetachedChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
        __gameObject.setup(this, __layer, __depth);

        this.m_childObjects.set (__gameObject, null);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public addGameObjectAsChild0 (__gameObject:XGameObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        __gameObject.setup(this, __layer, __depth);
        
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_childObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public addGamedObjectAsDetachedChild0 (__gameObject:XGameObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        __gameObject.setup(this, __layer, __depth);
        
        this.m_childObjects.set (__gameObject, null);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public addPooledGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = this.getXLogicObjectPoolManager ().borrowObject (__class) as XGameObject;
        __gameObject.setup(this, __layer, __depth);
        
        __gameObject.setPoolClass (__class);

        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__gameObject, __depth, __visible);

        this.m_childObjects.set (__gameObject, __depthSprite);
        
        return __gameObject;
    }

    //------------------------------------------------------------------------------------------
    public addPooledGameObjectAsDetachedChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
        var __gameObject:XGameObject = this.getXLogicObjectPoolManager ().borrowObject (__class) as XGameObject;
        __gameObject.setup(this, __layer, __depth);
        
        __gameObject.setPoolClass (__class);

        this.m_childObjects.set (__gameObject, null);
        
        return __gameObject;
    }	

    //------------------------------------------------------------------------------------------
    public removeGameObject (__gameObject:XGameObject):void {	
        if (this.m_gameObjects.has (__gameObject)) {
            var __depthSprite:XDepthSprite = this.m_gameObjects.get (__gameObject);
            
            if (__depthSprite != null) {
                this.m_layers[__gameObject.getLayer()].removeSprite (__depthSprite);
            }

            this.m_gameObjects.delete (__gameObject);
        }
        
        if (this.m_childObjects.has (__gameObject)) {
            var __depthSprite:XDepthSprite = this.m_childObjects.get (__gameObject);
            
            if (__depthSprite != null) {
                this.m_layers[__gameObject.getLayer()].removeSprite (__depthSprite);
            }

            this.m_childObjects.delete (__gameObject);
        }	
    }

    //------------------------------------------------------------------------------------------
    public addSortableChild (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):void {
        var __depthSprite:XDepthSprite;
        
        __depthSprite = this.m_layers[__layer].addSprite (__sprite, __depth, __visible);

        this.m_children.set (__sprite, [__layer, __depthSprite]);
    }

    //------------------------------------------------------------------------------------------
    public addSortableChild0 (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):void {
        this.m_layers[__layer].addSprite0 (__sprite, __depth, __visible);

        this.m_children0.set (__sprite, [__layer, __sprite]);
    }
    
    //------------------------------------------------------------------------------------------
    public getChildDepthSprite (__sprite:PIXI.DisplayObject):XDepthSprite {
        return this.m_children.get (__sprite)[XWorld.SPRITE_XDEPTHSPRITE];
    }

    //------------------------------------------------------------------------------------------
    public removeSortableChild (__sprite:PIXI.DisplayObject):void {
        if (this.m_children.has (__sprite)) {
            var x:any  = this.m_children.get (__sprite);
            
            this.m_layers[x[XWorld.SPRITE_LAYER]].removeSprite (x[XWorld.SPRITE_XDEPTHSPRITE]);
            
            this.m_children.delete (__sprite);				
        }

        if (this.m_children0.has (__sprite)) {
            var x:any  = this.m_children0.get (__sprite);
            
            this.m_layers[x[XWorld.SPRITE_LAYER]].removeSprite0 (x[XWorld.SPRITE_XDEPTHSPRITE]);
            
            this.m_children0.delete (__sprite);				
        }
    }

    //------------------------------------------------------------------------------------------
    public killLater (__gameObject:XGameObject):void {
        if (!this.m_killQueue.has (__gameObject)) {
            this.m_killQueue.set (__gameObject, 0);
        }
    }

    //------------------------------------------------------------------------------------------
    public emptyKillQueue ():void {	
        var __gameObject:XGameObject;

        for (__gameObject of this.m_killQueue.keys ()) {
            if (!__gameObject.cleanedUp) {
                __gameObject.cleanup ();
            }
                
            this.removeGameObject (__gameObject);
                
            this.m_killQueue.delete (__gameObject);
        }
    }

    //------------------------------------------------------------------------------------------
    public getStage ():PIXI.Container {
        return this.m_XApp.getStage ();
    }

    //------------------------------------------------------------------------------------------
    public getXLogicObjectPoolManager ():XClassPoolManager {
        return this.m_XLogicObjectPoolManager;
    }

    //------------------------------------------------------------------------------------------
    public getStreamingSoundManager ():XSoundSubManager {
        return this.m_streamingSoundManager;
    }

    //------------------------------------------------------------------------------------------
    public getMusicSoundManager ():XSoundSubManager {
        return this.m_musicSoundManager;
    }
    
    //------------------------------------------------------------------------------------------
    public getSFXSoundManager ():XSoundSubManager {
        return this.m_sfxSoundManager;
    }
    
    //------------------------------------------------------------------------------------------
    public createMatterEngine ():void {
        this.m_matterEngine = Matter.Engine.create ();
    }

    //------------------------------------------------------------------------------------------
    public cleanupMatterEngine ():void {
        Matter.World.clear (this.m_matterEngine.world, false);
        Matter.Engine.clear (this.m_matterEngine);
    }

    //------------------------------------------------------------------------------------------
    public getMatterEngine ():Engine {
        return this.m_matterEngine;
    }

    //------------------------------------------------------------------------------------------
    public getXBulletCollisionManager ():XBulletCollisionManager {
        return this.m_XBulletCollisionManager;
    }

//------------------------------------------------------------------------------------------
    public getXObjectCollisionManager ():XObjectCollisionManager {
        return this.m_XObjectCollisionManager;
    }

//------------------------------------------------------------------------------------------
    public getObjectCollisionList ():XObjectCollisionList {
        return this.m_objectCollisionList;
    }

    //------------------------------------------------------------------------------------------
    public createXSignal ():XSignal {
        return this.m_XSignalManager.createXSignal ();
    }

    //------------------------------------------------------------------------------------------
    public getXSignalManager ():XSignalManager {
        return this.m_XSignalManager;
    }

    //------------------------------------------------------------------------------------------
    public getXRectPoolManager ():XObjectPoolManager {
        return this.m_XApp.getXRectPoolManager ();
    }

    //------------------------------------------------------------------------------------------
    public getXPointPoolManager ():XObjectPoolManager {
        return this.m_XApp.getXPointPoolManager ();
    }

    //------------------------------------------------------------------------------------------
    public getXDepthSpritePoolManager ():XObjectPoolManager {
        return this.m_XApp.getXDepthSpritePoolManager ();
    }

    //------------------------------------------------------------------------------------------
    public getMaxLayers ():number {
        return this.MAX_LAYERS;
    }

    //------------------------------------------------------------------------------------------
    public setXMapModel (__XMapModel:XMapModel):void {
        this.m_XMapModel = __XMapModel;
    }

    //------------------------------------------------------------------------------------------
    public getXMapModel ():XMapModel {
        return this.m_XMapModel;
    }

    //------------------------------------------------------------------------------------------
    public getLayer (__layer:number):XSpriteLayer {
        return this.m_layers[__layer];
    }

    //------------------------------------------------------------------------------------------
    public getXWorldLayer (__layer:number):XSpriteLayer {
        return this.m_layers[__layer];
    }

    //------------------------------------------------------------------------------------------
    public getLayerContainer (__layer:number):PIXI.Sprite {
        return this.m_layerContainers[__layer];
    }

//------------------------------------------------------------------------------------------
    public setViewRect (
        __width:number, __height:number
        ):void {
            
        this.m_viewRect = new XRect (0, 0, __width, __height);
    }

//------------------------------------------------------------------------------------------	
    public getViewRect ():XRect {
        return this.m_viewRect;
    }

//------------------------------------------------------------------------------------------
    public getResourceByName (__name:string):any {
        return this.m_XApp.getXProjectManager ().getResourceByName (__name);
    }

//------------------------------------------------------------------------------------------
// http://www.flipcode.com/archives/Fast_Approximate_Distance_Functions.shtml
//------------------------------------------------------------------------------------------
    public approxDistance (dx:number, dy:number):number {
        var min:number, max:number, approx:number;
        
        if ( dx < 0 ) dx = -dx;
        if ( dy < 0 ) dy = -dy;
        
        if ( dx < dy ) {
            min = dx;
            max = dy;
        } else {
            min = dy;
            max = dx;
        }
        
        approx = ( max * 1007 ) + ( min * 441 );
    //	if ( max < ( min << 4 ))
        if ( max < ( min * 16 ))
            approx -= ( max * 40 );
        
    // add 512 for proper rounding
    //	return (( approx + 512 ) >> 10 );
        return (( approx + 512 ) / 1024 );	
    }

//------------------------------------------------------------------------------------------
    public approxDistanceToGameObject (__sourceObject:XGameObject, __targetObject:XGameObject):number {
        return this.approxDistance	(__sourceObject.x - __targetObject.x, __sourceObject.y - __targetObject.y)
    }

//------------------------------------------------------------------------------------------
    public realDistance (dx:number, dy:number):number {
        return Math.sqrt (dx*dx + dy*dy);		
    }

//------------------------------------------------------------------------------------------
    public realDistanceToGameObject (__sourceObject:XGameObject, __targetObject:XGameObject):number {
        return this.realDistance	(__sourceObject.x - __targetObject.x, __sourceObject.y - __targetObject.y)
    }

//------------------------------------------------------------------------------------------
}