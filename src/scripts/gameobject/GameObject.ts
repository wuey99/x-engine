//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/Xtype';

//------------------------------------------------------------------------------------------
export class GameObject extends PIXI.Sprite {
	public m_selfObjects:Map<GameObject, number>;	
	public m_worldObjects:Map<GameObject, number>;
	public m_childObjects:Map<GameObject, number>;
	public m_selfSprites:Map<PIXI.Sprite, number>;
	public m_childSprites:Map<PIXI.Sprite, number>;
	public m_worldSprites:Map<PIXI.Sprite, number>;	
	// TODO public m_bitmaps:Map<String, Bitmap>;
	// TODO public m_XBitmaps:Map<String, XBitmap>;
	// TODO public m_XTilemaps:Map<String, XTilemap>;
	public m_signals:Map<XSignal, number>;
	public m_XTaskSubManager:XTaskSubManager;
	public m_killSignal:XSignal;
	public m_parent:GameObject;
	public m_XApp:XApp;
	public world:XWorld;
	public m_layer:number;
	public m_depth:number;
	public m_propagateDepthFlag:boolean;
	public m_isDead:boolean;
	public m_cleanedUp:boolean;
	public m_delayed:number;
	public m_masterScaleRatio:number;
	public m_flipX:number;
	public m_flipY:number;
	public m_masterFlipX:number;
	public m_masterFlipY:number;
	
	public static g_XApp:XApp;
	
//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):GameObject {
		this.m_masterScaleX = this.m_masterScaleY = 1.0;
		this.m_masterFlipX = this.m_masterFlipY = 1.0;
		this.m_masterX = this.m_masterY = 0;
		this.m_masterRotation = 0;
		this.m_masterVisible = true;
		this.m_masterDepth = 0;
		this.m_masterAlpha = 1.0;
		this.m_masterScaleRatio = 1.0;
		
		this.m_flipX = 1.0;
		this.m_flipY = 1.0;
		
		this.m_delayed = 1;
		
		this.world = __world;
		this.m_layer = __layer;
		this.m_depth = __depth;
		this.m_propagateDepthFlag = false;
		
		this.m_isDead = false;
		this.m_cleanedUp = false;
		
		this.m_worldObjects = new Map<GameObject, number> ();
		this.m_childObjects = new Map<GameObject, number> ();
		this.m_selfObjects = new Map<GameObject, number> ();
		// TODO this.m_bitmaps = new Map<String, Bitmap> ();
		// TODO this.m_XBitmaps = new Map<String, XBitmap> ();
		// TODO this.m_XTilemaps = new Map<String, XTilemap> ();
		this.m_selfSprites = new Map<PIXI.Sprite, number> ();
		this.m_childSprites = new Map<PIXI.Sprite, number> ();
		this.m_worldSprites = new Map<PIXI.Sprite, number> ();		
		this.m_signals = new Map<XSignal, number> ();
		this.m_XTaskSubManager = new XTaskSubManager (GameObject.getXApp ().getXTaskManager ());
		this.m_parent = null;
		this.m_XApp = GameObject.g_XApp;
		this.m_killSignal = this.createXSignal ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):GameObject {
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
		this.removeAllTasks ();
		this.removeAllSelfObjects ();
		this.removeAllWorldObjects ();
		this.removeAllChildObjects ();
		this.removeAllSelfSprites ();
		this.removeAllChildSprites ();
		this.removeAllWorldSprites ();
		this.removeAllBitmaps();
		this.removeAllXBitmaps();
		this.removeAllXTilemaps();
		this.removeAllXSignals();
		
		if (this.getParentObject () != null) { 
			this.getParentObject ().removeSelfObject0 (this);
			this.getParentObject ().removeWorldObject0 (this);
			this.getParentObject ().removeChildObject0 (this);
		}
			
		this.fireKillSignal();
		
		this.m_isDead = true;
		this.m_cleanedUp = true;
	}
	
//------------------------------------------------------------------------------------------
// kill this object and remove it from the World (delayed)
//------------------------------------------------------------------------------------------
	public killLater ():void {
		this.m_isDead = true;
		
		if (this.world != null) {
			this.world.killLater (this);
		}
	}

//------------------------------------------------------------------------------------------
// kill this object and remove it from the World (now)
//------------------------------------------------------------------------------------------
	public kill ():void {
		this.m_isDead = true;
		
		if (this.world != null) {
			this.world.killLater (this);
		}
	}
		
//------------------------------------------------------------------------------------------
// kill this object and remove it from the World (now)
//------------------------------------------------------------------------------------------
	public nuke ():void {
		this.m_isDead = true;
		
		if (this.world != null) {
			this.world.killLater (this);
		}
	}
	
//------------------------------------------------------------------------------------------
	public addKillListener (__listener:any ):number {
		return this.m_killSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public fireKillSignal ():void {
		this.m_killSignal.fireSignal ();
	}
	
//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		GameObject.g_XApp = __XApp;
	}

//------------------------------------------------------------------------------------------
    public static getXApp ():XApp {
        return GameObject.g_XApp;
    }

//------------------------------------------------------------------------------------------
	public getVerticalPercent (__percent:number):number {
		return this.getActualHeight () * __percent;
	}
		
//------------------------------------------------------------------------------------------
	public verticalPercent (__displayObject:PIXI.Sprite, __percent:number):GameObject {
		var __y:number = (this.getActualHeight () - __displayObject.height) * __percent;
			
		__displayObject.y = __y;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public verticalPercentCentered (__displayObject:PIXI.Sprite, __percent:number):GameObject {
		var __y:number = this.getActualHeight () * __percent;
			
		__displayObject.y = __y;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public getHorizontalPercent (__percent:number):number {
		return this.getActualWidth () * __percent;
	}
		
//------------------------------------------------------------------------------------------
	public horizontalPercent (__displayObject:PIXI.Sprite, __percent:number):GameObject {
		var __x:number = (this.getActualWidth () - __displayObject.width) * __percent;
			
		__displayObject.x = __x;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public horizontalPercentCentered (__displayObject:PIXI.Sprite, __percent:number):GameObject {
		var __x:number = this.getActualWidth () * __percent;
			
		__displayObject.x = __x;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public isWorldGameObject (__gameObject:GameObject):boolean {
		return this.m_worldObjects.has (__gameObject);
	}
	
//------------------------------------------------------------------------------------------
// TODO use className?
//------------------------------------------------------------------------------------------
/*
	public createXBitmap (__name:String, __bitmapNames:Array<String>):XBitmap {	
		var __bitmap:XBitmap = cast XApp.getXBitmapPoolManager ().borrowObject ();
		__bitmap.setup ();
		__bitmap.initWithClassName (null, __name, __bitmapNames);
		__bitmap.alpha = 1.0;
		__bitmap.scaleX = __bitmap.scaleY = 1.0;
			
		m_XBitmaps.set (__name, __bitmap);
			
		return __bitmap;
	}

//------------------------------------------------------------------------------------------
	public createXTilemap (__name:String, __bitmapNames:Array<String>):XTilemap {
		var __tilemap:XTilemap = cast XApp.getXTilemapPoolManager ().borrowObject (); 
		__tilemap.setup ();
		__tilemap.initWithClassName (null, __name, __bitmapNames);
		__tilemap.alpha = 1.0;
		__tilemap.scaleX = __tilemap.scaleY = 1.0;
		__tilemap.rotation = 0.0;
			
		m_XTilemaps.set (__name, __tilemap);
			
		return __tilemap;
	}
*/

//------------------------------------------------------------------------------------------
	public addGameObjectToSelf (__class:any):GameObject {
		var __gameObject:GameObject = XType.createInstance (__class) as GameObject;
		__gameObject.setup (world, this.getLayer(), this.getDepth());
		
		__gameObject.setParent (this);
		
		this.addChild (__gameObject);
		
		this.m_selfObjects.set (__gameObject, 0);
		
		return __gameObject;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0):GameObject {
		if (this.world != null) {
			var __gameObject = this.world.addGameObject (__class, __layer, __depth);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}
	
//------------------------------------------------------------------------------------------
	public addGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):GameObject {
		if (this.world != null) {
			var __gameObject = this.world.addChildObject(__class, __layer, __depth, __visible);
			
			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}
	
//------------------------------------------------------------------------------------------
	public getParentObject ():GameObject {
		return this.m_parent;
	}
	
//------------------------------------------------------------------------------------------
	public setParentObject (__parent:GameObject):void {
		this.m_parent = __parent;
	}
	
//------------------------------------------------------------------------------------------
//
// SELF
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeSelfObject (__gameObject:GameObject):void {
		if (this.m_selfObjects.has (__gameObject)) {
			this.m_selfObjects.delete (__gameObject);
				
			if (!__gameObject.cleanedUp) {
				__gameObject.cleanup ();
			}
			
			this.removeChild (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
// remove GameObject from the World but don't kill it
//------------------------------------------------------------------------------------------	
	public removeSelfObject0 (__gameObject:GameObject):void {
		if (this.m_selfObjects.has (__gameObject)) {
			this.m_selfObjects.delete (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllSelfObjects ():void {
        var __gameObject:GameObject;

		for (__gameObject of this.m_selfObjects.keys ()) {
            this.removeSelfObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// WORLD
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeWorldObject (__gameObject:GameObject):void {
		if (this.m_worldObjects.has (__gameObject)) {
			this.m_worldObjects.delete (__gameObject);
				
			if (!__gameObject.cleanedUp) {
				__gameObject.cleanup ();
			}
			
			this.world.removeGameObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
// remove GameObject from the World but don't kill it
//------------------------------------------------------------------------------------------	
	public removeWorldObject0 (__gameObject:GameObject):void {
		if (this.m_worldObjects.has (__gameObject)) {
			this.m_worldObjects.delete (__gameObject);
				
			this.world.removeGameObject (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllWorldObjects ():void {
        var __gameObject:GameObject;

		for (__gameObject of this.m_worldObjects.keys ()) {
			this.removeWorldObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// CHILD
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeChildObject (__gameObject:GameObject):void {
		if (this.m_childObjects.has (__gameObject)) {
			this.m_childObjects.delete (__gameObject);
				
			if (!__gameObject.cleanedUp) {
				__gameObject.cleanup ();
			}
			
			this.world.removeGameObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
// remove GameObject from the World but don't kill it
//------------------------------------------------------------------------------------------	
	public removeChildObject0 (__gameObject:GameObject):void {
		if (this.m_childObjects.has (__gameObject)) {
			this.m_childObjects.delete (__gameObject);
				
			this.world.removeGameObject (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllChildObjects ():void {
        var __gameObject:GameObject;

		for (__gameObject of this.m_childObjects.keys ()) {
			this.removeChildObject (__gameObject);
		}
	}
			
//------------------------------------------------------------------------------------------
//
// SELF
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
    // TODO
	public addSpriteAssetToSelf (bitmapName:string, __dx:number, __dy:number):PIXI.Sprite {
		var __sprite:PIXI.Sprite = null; // TODO createSpriteFromAssets(bitmapName);
		
		return this.addSpriteToSelf (__sprite, __dx, __dy);
	}
	
//------------------------------------------------------------------------------------------
	public addSpriteToSelf (__sprite__:PIXI.Sprite, __dx:number, __dy:number):PIXI.Sprite {
		var __sprite = new PIXI.Sprite();
		__sprite.addChild(__sprite__);
		
		this.m_selfSprites.set (__sprite, 0);	

		__sprite__.x = __dx;
		__sprite__.y = __dy;
		
		this.addChild (__sprite);	
		
		return __sprite;
	}
	
//------------------------------------------------------------------------------------------
	public removeAllSelfSprites ():void {
        var __sprite:PIXI.Sprite;

		for (__sprite of this.m_selfSprites.keys ()) {
            this.m_selfSprites.delete (__sprite);

            this.removeChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// CHILD
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
    // TODO
	public addSpriteAssetAsChild (bitmapName:string, __dx:number, __dy:number, __layer:number, __depth:number):PIXI.Sprite {
		var __sprite:PIXI.Sprite = null; // TODO createSpriteFromAppAssets(bitmapName);
		
		return this.addSpriteAsChild (__sprite, __dx, __dy, __layer, __depth);	
	}
	
//------------------------------------------------------------------------------------------
	public addSpriteAsChild (__sprite__:PIXI.Sprite, __dx:number, __dy:number, __layer:number, __depth:number):PIXI.Sprite {
		var __sprite = new PIXI.Sprite ();
		__sprite.addChild(__sprite__);

		__sprite__.x = __dx;
		__sprite__.y = __dy;
		
		this.addSortableChild (__sprite, __layer, __depth);	
		
		return __sprite;
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChild (__sprite:PIXI.Sprite, __layer:number = 0, __depth:number = 0.0, __visible:boolean = false):void {
	    this.m_childSprites.set (__sprite, 0);
		
		this.world.addSortableChild (__sprite, __layer, __depth, __visible);
	}
	
//------------------------------------------------------------------------------------------
	public removeChildSprite (__sprite:PIXI.Sprite):void {
		if (this.m_childSprites.has (__sprite)) {
			this.m_childSprites.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
	public removeAllChildSprites ():void {
        var __sprite:PIXI.Sprite;
    
		for (__sprite of this.m_childSprites.keys ()) {
			this.removeChildSprite (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// World
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
    // TODO
	public addSpriteAssetToWorld (bitmapName:string, __dx:number, __dy:number, __layer:number, __depth:number, __visible:boolean = true):PIXI.Sprite {
		var __sprite:PIXI.Sprite = null; // createSpriteFromAppAssets(bitmapName);
		
		return this.addSpriteToWorld (__sprite, __dx, __dy, __layer, __depth, __visible);	
	}
	
//------------------------------------------------------------------------------------------
	public addSpriteToWorld (__sprite__:PIXI.Sprite, __dx:number, __dy:number, __layer:number, __depth:number, __visible:boolean = true):PIXI.Sprite {
		var __sprite = new PIXI.Sprite ();
		__sprite.addChild (__sprite__);
	
		__sprite__.x = __dx;
		__sprite__.y = __dy;

		this.addSortableChildToWorld (__sprite, __layer, __depth, __visible);	
		
		return __sprite;
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChildToWorld (__sprite:PIXI.Sprite, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):void {
		this.m_worldSprites.set (__sprite, 0);
		
		this.world.addSortableChild (__sprite, __layer, __depth, __visible);
	}
	
//------------------------------------------------------------------------------------------
	public removeWorldSprite (__sprite:PIXI.Sprite):void {
		if (this.m_worldSprites.has (__sprite)) {
			this.m_worldSprites.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
	public removeAllWorldSprites ():void {
        var __sprite:PIXI.Sprite;

		for (__sprite of this.m_worldSprites.keys ()) {
			this.removeWorldSprite (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// BITMAP
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
    public createSpriteFromAssets (bitmapName:String):PIXI.Sprite {
        var __sprite:PIXI.Sprite = new PIXI.Sprite ();
        
        // TODO __sprite.addChild (createBitmapFromAssets(bitmapName));
        
        return __sprite;
    }
	
//------------------------------------------------------------------------------------------
	public removeAllBitmaps ():void {
        /* TODO */
	}
		
//------------------------------------------------------------------------------------------
	public removeAllXBitmaps ():void {
        /* TODO */
	}
	
//------------------------------------------------------------------------------------------
	public removeAllXTilemaps ():void {
        /* TODO */
	}
	
//------------------------------------------------------------------------------------------
	public createXSignal ():XSignal {
		var __signal:XSignal = GameObject.getXApp ().getXSignalManager ().createXSignal ();
		
		if (!(this.m_signals.has (__signal))) {
			this.m_signals.set (__signal, 0);
		}
			
		__signal.setParent (this);
			
		return __signal;
	}

//------------------------------------------------------------------------------------------
	public removeXSignal (__signal:XSignal):any {	
		if (this.m_signals.has (__signal)) {
			this.m_signals.delete (__signal);
					
			GameObject.getXApp ().getXSignalManager ().removeXSignal (__signal);
		}
	}

//------------------------------------------------------------------------------------------
	public removeAllXSignals ():void {
        var __signal:XSignal;

		for (__signal of this.m_signals.keys ()) {
			this.removeXSignal (__signal);
		}
	}
				
//------------------------------------------------------------------------------------------
	public getXTaskManager ():XTaskManager {
		return GameObject.getXApp ().getXTaskManager ();
	}

//------------------------------------------------------------------------------------------
	public addTask (
		__taskList:Array<any>,
		__findLabelsFlag:boolean = true
		):XTask {

		var __task:XTask = this.m_XTaskSubManager.addTask (__taskList, __findLabelsFlag);
			
		__task.setParent (this);
			
		return __task;
	}

//------------------------------------------------------------------------------------------
	public changeTask (
		__task:XTask,
		__taskList:Array<any>,
		__findLabelsFlag:boolean = true
		):XTask {
				
		return this.m_XTaskSubManager.changeTask (__task, __taskList, __findLabelsFlag);
	}

//------------------------------------------------------------------------------------------
	public isTask (__task:XTask):boolean {
		return this.m_XTaskSubManager.isTask (__task);
	}		
		
//------------------------------------------------------------------------------------------
	public removeTask (__task:XTask):void {
		this.m_XTaskSubManager.removeTask (__task);	
	}

//------------------------------------------------------------------------------------------
	public removeAllTasks ():void {
		this.m_XTaskSubManager.removeAllTasks ();
	}

//------------------------------------------------------------------------------------------
	public addEmptyTask ():XTask {
		return this.m_XTaskSubManager.addEmptyTask ();
	}
	
//------------------------------------------------------------------------------------------
	public getEmptyTaskX ():Array<any> {
		return this.m_XTaskSubManager.getEmptyTaskX ();
	}	
		
//------------------------------------------------------------------------------------------
	public gotoLogic (__logic:any):void {
		this.m_XTaskSubManager.gotoLogic (__logic);
	}
	
//------------------------------------------------------------------------------------------
	public setDepth (__depth:number):GameObject {
		this.m_depth = __depth;
		
		return this;
	}		
	
//------------------------------------------------------------------------------------------
    public getDepth ():number {
        return this.m_depth;
    }

//------------------------------------------------------------------------------------------
	public setPropagateDepthFlag (__flag:boolean):GameObject {
		this.m_propagateDepthFlag = __flag;
		
		return this;
	}	
		
//------------------------------------------------------------------------------------------
	public setLayer (__layer:number):GameObject {
		this.m_layer = __layer;
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public getLayer ():number {
		return this.m_layer;
	}

//------------------------------------------------------------------------------------------
	public getWidth ():number {
		return this.width;
	}
	
//------------------------------------------------------------------------------------------
	public getHeight ():number {
		return this.height;
	}
	
//------------------------------------------------------------------------------------------
	public getActualWidth ():number {
		return this.width;
	}
	
//------------------------------------------------------------------------------------------
	public getActualHeight ():number {
		return this.height;
	}

//------------------------------------------------------------------------------------------
	public isReady ():boolean {
		return this.m_delayed == 0;
	}
	
//------------------------------------------------------------------------------------------
	public update ():void {
			if (this.m_delayed > 0) {
				this.m_delayed--;
				
				return;
			}
			
//------------------------------------------------------------------------------------------
			var __x:number = this.getMasterX ();
			var __y:number = this.getMasterY ();
			var __visible:boolean = this.getMasterVisible ();
			var __scaleX:number = this.getMasterScaleX () * this.m_masterScaleRatio;
			var __scaleY:number = this.getMasterScaleY () * this.m_masterScaleRatio;
			var __flipX:number = this.getMasterFlipX ();
			var __flipY:number = this.getMasterFlipY ();
			var __rotation:number = this.getMasterRotation ();
			var __depth:number = this.getMasterDepth ();
			var __alpha:number = this.getMasterAlpha ();

//------------------------------------------------------------------------------------------
// update child objects that live in the World
//------------------------------------------------------------------------------------------	
			var __depthSprite:XDepthSprite = this.parent as XDepthSprite;
			__depthSprite.setDepth (this.getDepth ());
			
			var __gameObject:GameObject;
            
            var __gameObject:GameObject;

			for (__gameObject of this.m_childObjects.keys ()) {	
				if (__gameObject != null && !__gameObject.isDead) {	
					__gameObject.parent.x = __x;
					__gameObject.parent.y = __y;
					__gameObject.parent.angle = __rotation;
					__gameObject.parent.visible = __visible;
					__gameObject.parent.scale.x= __scaleX * __flipX;
					__gameObject.parent.scale.y = __scaleY * __flipY;
					__gameObject.parent.alpha = __alpha;
						
					// propagate rotation, scale, visibility, alpha
					__gameObject.setMasterX (__gameObject.x * __scaleX + __x);
					__gameObject.setMasterY (__gameObject.y * __scaleY + __y);
					__gameObject.setMasterRotation (__gameObject.angle + __rotation);
					__gameObject.setMasterScaleX (__gameObject.scale.x * __scaleX);
					__gameObject.setMasterScaleY (__gameObject.scale.y * __scaleY);
					__gameObject.setMasterFlipX (__gameObject.getFlipX () * __flipX);
					__gameObject.setMasterFlipY (__gameObject.getFlipY () * __flipY);
					__gameObject.setMasterVisible (__gameObject.visible && __visible);
					__gameObject.setMasterDepth (__gameObject.getDepth ());
					__gameObject.setMasterAlpha (__gameObject.alpha * __alpha);
					
                    __gameObject.update ();
                }
			}
		
//------------------------------------------------------------------------------------------
			var __sprite:PIXI.Sprite;
			
//------------------------------------------------------------------------------------------			
// update self sprites that live in the World
//------------------------------------------------------------------------------------------
            var __sprite:PIXI.Sprite;
            
			for (__sprite of this.m_selfSprites.keys ()) {
				if (__sprite != null) {
					__sprite.scale.x = __flipX;
					__sprite.scale.y = __flipY;
                }
			}
	
//------------------------------------------------------------------------------------------			
// update child sprites that live in the World
//------------------------------------------------------------------------------------------	
			for (__sprite of this.m_childSprites.keys ()) {
				if (this.m_propagateDepthFlag) {
					__depthSprite =  __sprite.parent as XDepthSprite;
					__depthSprite.setDepth (this.getDepth());			
				}
					
				if (__sprite != null) {
					__sprite.parent.x = __x;
					__sprite.parent.y = __y;
					__sprite.parent.angle = __rotation;
					__sprite.parent.visible = __sprite.visible && __visible;
					__sprite.parent.scale.x = __scaleX * __flipX;
					__sprite.parent.scale.y = __scaleY * __flipY;
					__sprite.parent.alpha = __alpha;
				}
			}
	}
	
//------------------------------------------------------------------------------------------
	public show ():void {
		this.visible = true;
	}
		
//------------------------------------------------------------------------------------------
	public hide ():void {
		this.visible = false;
	}		

//------------------------------------------------------------------------------------------
	public get isDead ():boolean {
		return this.m_isDead;
	}
		
	public set isDead (__val:boolean) {
		this.m_isDead = __val;
	}
		
//------------------------------------------------------------------------------------------
	public get cleanedUp ():boolean {
		return this.m_cleanedUp;
	}
		
	public set_cleanedUp (__val:boolean) {
		this.m_cleanedUp = __val;			
	}
	
//------------------------------------------------------------------------------------------	
		public m_masterVisible:boolean;
		public m_masterDepth:number;
		public m_masterScaleX:number;
		public m_masterScaleY:number;
		public m_masterRotation:number;
		public m_masterAlpha:number;
		public m_masterX:number;
		public m_masterY:number;
	
//------------------------------------------------------------------------------------------		
		public setMasterX (__value:number):void {
			this.m_masterX = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterX ():number {
			return this.m_masterX;
		}

//------------------------------------------------------------------------------------------		
		public setMasterY (__value:number):void {
			this.m_masterY = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterY ():number {
			return this.m_masterY;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterAlpha (__alpha:number):void {
			this.m_masterAlpha = __alpha;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterAlpha ():number {
			return this.m_masterAlpha;
		}
			
//------------------------------------------------------------------------------------------		
		public setMasterVisible (__visible:boolean):void {
			this.m_masterVisible = __visible;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterVisible ():boolean {
			return this.m_masterVisible;
		}
					
//------------------------------------------------------------------------------------------		
		public setMasterRotation (__rotation:number):void {
			this.m_masterRotation = __rotation % 360;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterRotation ():number {
			return this.m_masterRotation;
		}

//------------------------------------------------------------------------------------------		
		public setMasterScaleX (__scale:number):void {
			this.m_masterScaleX = __scale;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterScaleX ():number {
			return this.m_masterScaleX;
		}

//------------------------------------------------------------------------------------------		
		public setMasterScaleY (__scale:number):void {
			this.m_masterScaleY = __scale;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterScaleY ():number {
			return this.m_masterScaleY;
		}

//------------------------------------------------------------------------------------------		
		public setMasterFlipX(__value:number):void {
			this.m_masterFlipX = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterFlipX ():number {
			return this.m_masterFlipX;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterFlipY(__value:number):void {
			this.m_masterFlipY = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterFlipY ():number {
			return this.m_masterFlipY;
		}
		
//------------------------------------------------------------------------------------------
		public getFlipX ():number {
			return this.m_flipX;
		}
		
		public setFlipX (__value:number):void {
			this.m_flipX = __value;
		}
		
//------------------------------------------------------------------------------------------
		public getFlipY ():number {
			return this.m_flipY;
		}
		
		public setFlipY (__value:number):void {
			this.m_flipY = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterDepth (__depth:number):void {
			this.m_masterDepth = __depth;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterDepth ():number {
			return this.m_masterDepth;
		}
		
//------------------------------------------------------------------------------------------
}