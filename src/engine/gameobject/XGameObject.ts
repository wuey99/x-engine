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
import { FederatedPointerEvent } from '@pixi/events';
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XProcess} from '../process/XProcess';
import { XProcessManager} from '../process/XProcessManager';
import { XProcessSubManager} from '../process/XProcessSubManager';
import { XWorld} from '../sprite/XWorld';
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/XType';
import { World, Body, Engine } from 'matter-js';
import * as Matter from 'matter-js';
import { XRect } from '../geom/XRect';
import { XPoint } from '../geom/XPoint';
import { G } from '../app/G';
import { XState } from '../state/XState';
import { XGameInstance } from '../state/XGameInstance';
import { PausableListener} from '../events/PausableListener';
import { XTextSprite } from '../sprite/XTextSprite';
import { XTextureManager } from '../texture/XTextureManager';
import { XSubTextureManager } from '../texture/XSubTextureManager';
import { XMapItemModel } from '../xmap/XMapItemModel';
import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
import { XModelBase } from '../model/XModelBase';
import { XLevel } from '../level/XLevel';
import { XMickey } from '../level/XMickey';

//------------------------------------------------------------------------------------------
export class XGameObject extends PIXI.Sprite {
	public m_selfObjects:Map<XGameObject, number>;	
	public m_worldObjects:Map<XGameObject, number>;
	public m_childObjects:Map<XGameObject, number>;
	public m_selfSprites:Map<PIXI.DisplayObject, number>;
	public m_childSprites:Map<PIXI.DisplayObject, number>;
	public m_childSprites0:Map<PIXI.DisplayObject, any>;
	public m_worldSprites:Map<PIXI.DisplayObject, number>;	
	public m_animatedSprites:Map<PIXI.AnimatedSprite, string>;
	public m_textSprites:Map<string, XTextSprite>;
	public m_sprites:Map<string, PIXI.Sprite>;
	public m_signals:Map<XSignal, number>;
	public m_bitmapFonts:Map<string, number>;
	public m_XTaskSubManager0:XTaskSubManager;
	public m_XTaskSubManager:XTaskSubManager;
	public m_XProcessSubManager0:XProcessSubManager;
	public m_XProcessSubManager:XProcessSubManager;
	public m_killSignal:XSignal;
	public m_parent:XGameObject;
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
	public m_pos:XPoint;
	public m_pivot:XPoint;
	public m_propagateCount:number;

	public m_attachedMatterBody:Body;
	public m_attachedDebugSprite:PIXI.Sprite;
	public m_matterDX:number;
	public m_matterDY:number;
	public m_matterRotate:boolean;

	public m_mousePoint:XPoint;
	public m_touchPoint:XPoint;

	public static g_XApp:XApp;

	public m_stageEvents:Map<any, keyof PIXI.DisplayObjectEvents>;
	public m_stageEventsX:Map<any, __PausableListener>;
	public m_pausableEvents:Map<any, PausableListener>;

	public m_mouseEnabled:boolean;
	public m_mouseDownFlag:boolean;

	public m_mouseDownSignal:XSignal;
	public m_mouseOverSignal:XSignal;
	public m_mouseMoveSignal:XSignal;
	public m_mouseUpSignal:XSignal;
	public m_mouseOutSignal:XSignal;

	public m_poolClass:any;

	public m_paramIndex:number;

	public m_vel:XPoint;
	public m_oldPos:XPoint;
	
	public m_cx:XRect;
	public m_namedCX:Map<string, XRect>;

	public m_item:XMapItemModel;
	public m_xml:XSimpleXMLNode;

	public m_autoCulling:boolean;
	public m_viewPortRect:XRect;
	public m_selfRect:XRect;
	public m_itemRect:XRect;
	public m_itemPos:XPoint;
	public m_disableCulling:boolean;
	public m_boundingRect:XRect;

	public m_gameStateObject:XState;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();

		this.m_item = null;
		this.m_autoCulling = false;
		this.m_disableCulling = false;
		this.m_boundingRect = null;

		this.m_worldObjects = new Map<XGameObject, number> ();
		this.m_childObjects = new Map<XGameObject, number> ();
		this.m_selfObjects = new Map<XGameObject, number> ();
		this.m_selfSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_childSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_childSprites0 = new Map<PIXI.DisplayObject, any> ();
		this.m_worldSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_animatedSprites = new Map<PIXI.AnimatedSprite, string> ();
		this.m_textSprites  = new Map<string, XTextSprite> ();
		this.m_sprites = new Map<string, PIXI.Sprite> ();	
		this.m_signals = new Map<XSignal, number> ();
		this.m_bitmapFonts = new Map<string, number> ();
		this.m_XTaskSubManager0 = new XTaskSubManager (XGameObject.getXApp ().getXTaskManager0 ());
		this.m_XTaskSubManager = new XTaskSubManager (XGameObject.getXApp ().getXTaskManager ());
		this.m_XProcessSubManager0 = new XProcessSubManager (XGameObject.getXApp ().getXProcessManager0 ());
		this.m_XProcessSubManager = new XProcessSubManager (XGameObject.getXApp ().getXProcessManager ());
		this.m_parent = null;
		this.m_XApp = XGameObject.g_XApp;
		this.m_killSignal = this.createXSignal ();
		this.m_cx = new XRect ();
		this.m_vel = new XPoint ();
		this.m_pivot = new XPoint ();
		this.m_mousePoint = new XPoint ();
		this.m_pos = new XPoint ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
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
		
		this.m_poolClass = null;

		this.m_gameStateObject = null;
		
		/*
		this.m_worldObjects = new Map<XGameObject, number> ();
		this.m_childObjects = new Map<XGameObject, number> ();
		this.m_selfObjects = new Map<XGameObject, number> ();
		this.m_selfSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_childSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_worldSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_animatedSprites = new Map<string, PIXI.AnimatedSprite> ();
		this.m_sprites = new Map<string, PIXI.Sprite> ();	
		this.m_signals = new Map<XSignal, number> ();
		this.m_bitmapFonts = new Map<string, number> ();
		this.m_XTaskSubManager0 = new XTaskSubManager (XGameObject.getXApp ().getXTaskManager0 ());
		this.m_XTaskSubManager = new XTaskSubManager (XGameObject.getXApp ().getXTaskManager ());
		this.m_parent = null;
		this.m_XApp = XGameObject.g_XApp;
		this.m_killSignal = this.createXSignal ();
		this.m_mousePoint = new XPoint ();
		this.m_cx = new XRect ();
		this.m_pos = new XPoint ();
		this.m_vel = new XPoint ();
		this.m_pivot = new XPoint ();
		*/

		this.m_mouseEnabled = true;

		this.m_mouseDownSignal = this.createXSignal ();
		this.m_mouseOverSignal = this.createXSignal ();
		this.m_mouseMoveSignal = this.createXSignal ();
		this.m_mouseUpSignal = this.createXSignal ();
		this.m_mouseOutSignal = this.createXSignal();

		this.alpha = 1.0;
		this.scale.x = this.scale.y = 1.0;
		this.pivot.x = this.pivot.y = 0.0;
		this.m_pivot.x = this.m_pivot.y = 0.0;

		this.m_attachedMatterBody = null;
		this.m_matterDX = 0;
		this.m_matterDY = 0;
		this.m_matterRotate = true;

		this.m_stageEvents = new Map<any, keyof PIXI.DisplayObjectEvents> ();
		this.m_stageEventsX = new Map<any, __PausableListener> ();
		this.m_pausableEvents = new Map<any, PausableListener> ();

		this.m_cx.x = 0;
		this.m_cx.y = 0;
		this.m_cx.width = 0;
		this.m_cx.height = 0;

		this.m_namedCX = new Map<string, XRect> ()
		
		this.m_propagateCount = -1;

		this.m_paramIndex = 0;
	
		this.m_viewPortRect = this.m_XApp.getXRectPoolManager ().borrowObject () as XRect;
		this.m_selfRect = this.m_XApp.getXRectPoolManager ().borrowObject () as XRect;
		this.m_itemRect = this.m_XApp.getXRectPoolManager ().borrowObject () as XRect;
		this.m_itemPos = this.m_XApp.getXPointPoolManager ().borrowObject () as XPoint;

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {	
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		this.returnBorrowedObjects ();

		this.fireKillSignal (this.m_item);
		
		if (this.m_item != null) {
			//	fireKillSignal (m_item);
										
			this.m_item.inuse--;
							
			this.m_item = null;
		}

		this.removeAll ();

		if (this.getParentObject () != null) { 
			this.getParentObject ().removeSelfObject0 (this);
			this.getParentObject ().removeWorldObject0 (this);
			this.getParentObject ().removeChildObject0 (this);
		}
			
		this.detachMatterBody ();
		
		if (this.m_poolClass != null) {
			this.world.getXLogicObjectPoolManager ().returnObject (this.m_poolClass, this);
		}

		this.m_isDead = true;
		this.m_cleanedUp = true;
	}
	
//------------------------------------------------------------------------------------------
	public removeAll ():void {
		this.removeAllTasks0 ();
		this.removeAllTasks ();
		this.removeAllSelfObjects ();
		this.removeAllWorldObjects ();
		this.removeAllChildObjects ();
		this.removeAllSelfSprites ();
		this.removeAllChildSprites ();
		this.removeAllWorldSprites ();
		this.removeAllXSignals ();
		this.removeAllAnimatedSprites ();
		this.removeAllXTextSprites ();
		this.removeAllSprites ();
		this.removeAllStageEvents ();
		this.removeAllStageEventsX ();
		this.removeAllPausableEvents ();
		this.removeAllBitmapFonts ();
	}

//------------------------------------------------------------------------------------------
	public returnBorrowedObjects ():void {
		/*
		xxx.getXPointPoolManager ().returnObject (m_pos);
		xxx.getXPointPoolManager ().returnObject (rp);
		*/

		this.world.getXRectPoolManager ().returnObject (this.m_viewPortRect);
		this.world.getXRectPoolManager ().returnObject (this.m_selfRect);
		this.world.getXRectPoolManager ().returnObject (this.m_itemRect);
		this.world.getXPointPoolManager ().returnObject (this.m_itemPos);		
	}

//------------------------------------------------------------------------------------------
// cull this object if it strays outside the current viewPort
//------------------------------------------------------------------------------------------	
	public __cullObject__ ():void {
		if (this.m_disableCulling) {
			return;
		}
		
		if (this.m_autoCulling) {
			this.autoCullObject ();
			
			return;
		}

	// if this object wasn't ever spawned from a level, don't perform any culling
		if (this.m_item == null) {
			return;
		}
		
	// determine whether this object is outside the current viewPort
		var v:XRect = this.world.getViewRect ();
		
		this.world.getXWorldLayer (this.m_layer).viewPort (v.width, v.height).copy2 (this.m_viewPortRect);
		this.m_viewPortRect.inflate (this.cullWidth (), this.cullHeight ());
		
		if (this.m_viewPortRect.intersects (this.m_itemRect)) {
			return;
		}
		
		this.m_boundingRect.copy2 (this.m_selfRect);
		this.m_selfRect.offsetPoint (this.getPos ());
		
		if (this.m_viewPortRect.intersects (this.m_selfRect)) {
			return;
		}
			
	// yep, kill it
	//    trace (": ---------------------------------------: ");
	//    trace (": cull: ", this);
		
		this.killLater ();
	}

//------------------------------------------------------------------------------------------
// cull this object if it strays outside the current viewPort
//------------------------------------------------------------------------------------------	
	public cullObject ():void {
		if (this.m_disableCulling) {
			return;
		}
		
		if (this.m_autoCulling) {
			this.autoCullObject ();
			
			return;
		}

	// if this object wasn't ever spawned from a level, don't perform any culling
		if (this.m_item == null) {
			return;
		}
		
	// determine whether this object is outside the current viewPort
		this.world.getXWorldLayer (this.m_layer).viewPort (
			this.world.m_viewRect.width, this.world.m_viewRect.height
		).copy2 (this.m_viewPortRect);
		
		this.m_viewPortRect.inflate (this.cullWidth (), this.cullHeight ());
		
		if (this.m_viewPortRect.intersects (this.m_itemRect)) {
			return;
		}
		
		this.m_boundingRect.copy2 (this.m_selfRect);
		this.m_selfRect.x += this.x;
		this.m_selfRect.y += this.y;
		
		if (this.m_viewPortRect.intersects (this.m_selfRect)) {
			return;
		}
			
	// yep, kill it
	//    trace (": ---------------------------------------: ");
	//    trace (": cull: ", this);
		
		this.killLater ();
	}

	//------------------------------------------------------------------------------------------
	public setDisableCulling (__flag:boolean):void {
		this.m_disableCulling = __flag;
	}
		
	//------------------------------------------------------------------------------------------
	// auto-cull this object if it strays outside the current viewPort
	//
	// auto-culled objects aren't spawned from a level so there's no
	// item object to retrieve a boundingRect from.  we're going to have
	// to provide a reasonable default for the boundingRect
	//------------------------------------------------------------------------------------------	
	public autoCullObject ():void {
		// determine whether this object is outside the current viewPort
		var v:XRect = this.world.getViewRect();
			
		var r:XRect = this.m_XApp.getXRectPoolManager ().borrowObject () as XRect;
		var i:XRect = this.m_XApp.getXRectPoolManager ().borrowObject () as XRect;

		this.world.getXWorldLayer (this.m_layer).viewPort (v.width, v.height).copy2 (r);
		r.inflate (this.autoCullWidth (), this.autoCullHeight ());
			
		this.m_boundingRect.copy2 (i);
		i.offsetPoint (this.getPos ());
	
		if (r.intersects (i)) {
			this.m_XApp.getXRectPoolManager ().returnObject (r);
			this.m_XApp.getXRectPoolManager ().returnObject (i);
				
			return;
		}
			
		this.m_XApp.getXRectPoolManager ().returnObject (r);
		this.m_XApp.getXRectPoolManager ().returnObject (i);
			
		// yep, kill it
		console.log (": ---------------------------------------: ");
		console.log (": cull: ", this);
			
		this.killLater ();
	}

//------------------------------------------------------------------------------------------
	public cullWidth ():number {
		return 256;
	}
		
//------------------------------------------------------------------------------------------
	public cullHeight ():number {
		return 256;
	}
		
//------------------------------------------------------------------------------------------
	public autoCullWidth ():number {
		return 512;
	}
		
//------------------------------------------------------------------------------------------
	public autoCullHeight ():number {
		return 512;
	}
		
//------------------------------------------------------------------------------------------
	public nukeLater ():void {
		if (this.m_item != null) {
			this.m_item.inuse++;
		}
		
		this.killLater ();
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
	public nuke ():void {
		if (this.m_item != null) {
			this.m_item.inuse++;
		}
			
		this.kill ();
	}
	
//------------------------------------------------------------------------------------------
	public addKillListener (__listener:any ):number {
		return this.m_killSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public fireKillSignal (__model:XModelBase = null):void {
		this.m_killSignal.fireSignal (__model);
	}

//------------------------------------------------------------------------------------------
	public getInteractiveArea ():PIXI.Container {
		return null;
	}

//------------------------------------------------------------------------------------------
	public enableInteractivity (
		__eventFilter:Array<string> =
			[
				"pointerdown",
				"pointerover",
				"pointermove",
				"pointerup",
				"pointerout",
				"pointerupoutside",
			]
		):void {

		this.getInteractiveArea ().interactive = true;
		this.getInteractiveArea ().interactiveChildren = true;

		this.m_mouseEnabled = true;
		this.m_mouseDownFlag = false;

		if (__eventFilter.indexOf ("pointerdown") >= 0) {
			this.addPausableEventListener ("pointerdown", this.getInteractiveArea (), this.onMouseDown.bind (this));
		}
		if (__eventFilter.indexOf ("pointermove") >= 0) {
			this.addPausableEventListener ("pointermove", this.getInteractiveArea (), this.onMouseMove.bind (this));
		}
		if (__eventFilter.indexOf ("pointerover") >= 0) {
			this.addPausableEventListener ("pointerover", this.getInteractiveArea (), this.onMouseOver.bind (this));
		}		
		if (__eventFilter.indexOf ("pointerup") >= 0) {
			this.addPausableEventListener ("pointerup", this.getInteractiveArea (), this.onMouseUp.bind (this));
		}
		if (__eventFilter.indexOf ("pointerout") >= 0) {
			this.addPausableEventListener ("pointerout", this.getInteractiveArea (), this.onMouseOut.bind (this));
		}
		if (__eventFilter.indexOf ("pointerupoutside") >= 0) {
			this.addPausableEventListener ("pointerupoutside", this.getInteractiveArea (), this.onMouseOut.bind (this));
		}
	}

//------------------------------------------------------------------------------------------
	public setMouseEnabled (__enabled:boolean):void {
		this.m_mouseEnabled = __enabled;
	}

//------------------------------------------------------------------------------------------
	public getMouseEnabled ():boolean {
		return this.m_masterMouseEnabled;
	}

//------------------------------------------------------------------------------------------
	public globalToLayer (__layerNum:number, __point:PIXI.Point):void {
		var __layer:XSpriteLayer = this.world.getLayer (__layerNum);

		__point.x /= __layer.scale.x;
		__point.y /= __layer.scale.y;
		
		__point.x *= G.scaleRatio;
		__point.y *= G.scaleRatio;

		__point.x -= __layer.x;
		__point.y -= __layer.y;
	}

//------------------------------------------------------------------------------------------
	public onMouseDown (e:FederatedPointerEvent):void {
		this.m_mouseDownSignal.fireSignal (this, e);

		this.m_mouseDownFlag = true;
	}			

//------------------------------------------------------------------------------------------
	public onMouseOver (e:FederatedPointerEvent):void {
		this.m_mouseOverSignal.fireSignal (this, e);
	}	

//------------------------------------------------------------------------------------------
	public onMouseUp (e:FederatedPointerEvent):void {
		this.m_mouseUpSignal.fireSignal (this, e);

		this.m_mouseDownFlag = false;
	}			

//------------------------------------------------------------------------------------------
	public onMouseOut (e:FederatedPointerEvent):void {
		this.m_mouseOutSignal.fireSignal (this, e);
		
		this.m_mouseDownFlag = false;
	}	

//------------------------------------------------------------------------------------------
	public onMouseMove (e:FederatedPointerEvent):void {
		console.log (": onMouseMove: ", e);

		if (this.m_mouseDownFlag) {
			this.m_mouseMoveSignal.fireSignal (this, e);
		}
	}	

//------------------------------------------------------------------------------------------
	public addMouseDownListener (__listener:any):number {
		return this.m_mouseDownSignal.addListener (__listener);
	}
			
//------------------------------------------------------------------------------------------
	public removeMouseDownListener (__id:number):void {
		this.m_mouseDownSignal.removeListener (__id);
	}

//------------------------------------------------------------------------------------------
	public fireMouseDownSignal ():void {
		this.m_mouseDownSignal.fireSignal ();
	}
	
//------------------------------------------------------------------------------------------
	public addMouseOverListener (__listener:any):number {
		return this.m_mouseOverSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeMouseOverListener (__id:number):void {
		this.m_mouseOverSignal.removeListener (__id);
	}

//------------------------------------------------------------------------------------------
	public fireMouseOverSignal ():void {
		this.m_mouseOverSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addMouseUpListener (__listener:any):number {
		return this.m_mouseUpSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeMouseUpListener (__id:number):void {
		this.m_mouseUpSignal.removeListener (__id);
	}

//------------------------------------------------------------------------------------------
	public fireMouseUpSignal ():void {
		this.m_mouseUpSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addMouseMoveListener (__listener:any):number {
		return this.m_mouseMoveSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeMouseMoveListener (__id:number):void {
		this.m_mouseMoveSignal.removeListener (__id);
	}

//------------------------------------------------------------------------------------------
	public fireMouseMoveSignal ():void {
		this.m_mouseMoveSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addMouseOutListener (__listener:any):number {
		return this.m_mouseOutSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeMouseOutListener (__id:number):void {
		this.m_mouseOutSignal.removeListener (__id);
	}

//------------------------------------------------------------------------------------------
	public fireMouseOutSignal ():void {
		this.m_mouseOutSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addStageEventListener (__eventName:keyof PIXI.DisplayObjectEvents, __listener:any):any {
		this.m_XApp.getStage ().on (__eventName, __listener);

		this.m_stageEvents.set (__listener, __eventName);

		return __listener;
	}

//------------------------------------------------------------------------------------------
	public removeStageEventListener (__listener:any):any {
		var __eventName:keyof PIXI.DisplayObjectEvents = this.m_stageEvents.get (__listener);

		this.m_XApp.getStage ().off (__eventName, __listener);

		this.m_stageEvents.delete (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAllStageEvents ():void {
		XType.forEach (this.m_stageEvents,
			(__listener:any) => {
				this.removeStageEventListener (__listener);				
			}
		);
	}

//------------------------------------------------------------------------------------------
	public addStageEventListenerX (__eventName:keyof PIXI.DisplayObjectEvents, __listener:any):any {
		var __pausableListener:__PausableListener = new __PausableListener (this, __eventName, __listener);

		this.m_stageEventsX.set (__listener, __pausableListener);
		
		return __listener;
	}

//------------------------------------------------------------------------------------------
	public removeStageEventListenerX (__listener:any):any {
		var __pausableListener:__PausableListener = this.m_stageEventsX.get (__listener);
		__pausableListener.cleanup ();

		this.m_stageEventsX.delete (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAllStageEventsX ():void {
		XType.forEach (this.m_stageEventsX,
			(__listener:any) => {
				this.removeStageEventListenerX (__listener);				
			}
		);
	}

//------------------------------------------------------------------------------------------
	public addPausableEventListener (__eventName:keyof PIXI.DisplayObjectEvents, __displayObject:PIXI.DisplayObject, __listener:any):any {
		var __pausableListener:PausableListener = new PausableListener (this, __eventName, __displayObject, __listener);

		this.m_pausableEvents.set (__listener, __pausableListener);
		
		return __listener;
	}

//------------------------------------------------------------------------------------------
	public removePausableEventListener (__listener:any):any {
		var __pausableListener:PausableListener = this.m_pausableEvents.get (__listener);
		__pausableListener.cleanup ();

		this.m_pausableEvents.delete (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAllPausableEvents ():void {
		XType.forEach (this.m_pausableEvents,
			(__listener:any) => {
				this.removePausableEventListener (__listener);				
			}
		);
	}

//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XGameObject.g_XApp = __XApp;
	}

//------------------------------------------------------------------------------------------
    public static getXApp ():XApp {
        return XGameObject.g_XApp;
    }

//------------------------------------------------------------------------------------------
	public getLevelObject ():XLevel {
		return this.getGameStateObject ().getLevelObject ();
	}

//------------------------------------------------------------------------------------------
	public getGameStateObject ():XState {
		if (this.m_gameStateObject == null) {
			this.m_gameStateObject = G.appX.getGameStateObject ();
		}

		return this.m_gameStateObject;
	}

//------------------------------------------------------------------------------------------
	public getGameInstance ():XGameInstance {
		return this.getGameStateObject ().getGameInstance ();
	}

//------------------------------------------------------------------------------------------
	public getMickeyObject ():XMickey {
		return this.getGameInstance ().getMickeyObject ();
	}

//------------------------------------------------------------------------------------------
	public setMickeyObject (__mickeyObject:XMickey):void {
		return this.getGameInstance ().setMickeyObject (__mickeyObject);
	}

//------------------------------------------------------------------------------------------
    public getMousePos ():XPoint {
		var __point:XPoint = this.m_XApp.getMousePos ();

        this.m_mousePoint.x = __point.x;
        this.m_mousePoint.y = __point.y;
		
		this.globalToLocal (this, this.m_mousePoint);

        return this.m_mousePoint;
	}

    //------------------------------------------------------------------------------------------
    public getTouchPos ():XPoint {
		var __point:XPoint = this.m_XApp.getTouchPos ();

        this.m_touchPoint.x = __point.x;
        this.m_touchPoint.y = __point.y;
		
		this.globalToLocal (this, this.m_touchPoint);

        return this.m_touchPoint;
	}

//------------------------------------------------------------------------------------------
	public getPivot ():XPoint {
		return this.m_pivot;
	}

//------------------------------------------------------------------------------------------
	public getPivotX ():number {
		return this.m_pivot.x;
	}

//------------------------------------------------------------------------------------------
	public getPivotY ():number {
		return this.m_pivot.y;
	}

//------------------------------------------------------------------------------------------
	public getVerticalPercent (__percent:number):number {
		return this.getActualHeight () * __percent;
	}
		
//------------------------------------------------------------------------------------------
	public verticalPercent (__displayObject:PIXI.Sprite, __percent:number, __pivotY:number = 0):XGameObject {
		var __y:number = (this.getActualHeight () - __displayObject.height) * __percent + __pivotY;
			
		__displayObject.y = __y;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public verticalPercentCentered (__displayObject:PIXI.Sprite, __percent:number):XGameObject {
		var __y:number = this.getActualHeight () * __percent;
			
		__displayObject.y = __y;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public getHorizontalPercent (__percent:number):number {
		return this.getActualWidth () * __percent;
	}
		
//------------------------------------------------------------------------------------------
	public horizontalPercent (__displayObject:PIXI.Sprite, __percent:number, __pivotX:number = 0):XGameObject {
		var __x:number = (this.getActualWidth () - __displayObject.width) * __percent + __pivotX;
			
		__displayObject.x = __x;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public horizontalPercentCentered (__displayObject:PIXI.Sprite, __percent:number):XGameObject {
		var __x:number = this.getActualWidth () * __percent;
			
		__displayObject.x = __x;
			
		return this;
	}

//------------------------------------------------------------------------------------------
	public setCollisions ():void {
	}

//------------------------------------------------------------------------------------------
	public get pos ():PIXI.ObservablePoint {
		return this.position;
	}
			
	public set pos (__pos:PIXI.ObservablePoint) {
		this.position.x = __pos.x;
		this.position.y = __pos.y;
	}

//------------------------------------------------------------------------------------------
	public get oX ():number {
		return this.position.x;
	}

	public set oX (__val:number) {
		this.position.x = __val;
	}

//------------------------------------------------------------------------------------------
	public get oY ():number {
		return this.position.y;
	}		

	public set oY (__val:number) {
		this.position.y = __val;
	}

//------------------------------------------------------------------------------------------
	public getPos ():XPoint {
		this.m_pos.x = this.x;
		this.m_pos.y = this.y;
		
		return this.m_pos;
	}

//------------------------------------------------------------------------------------------
	public get boundingRect ():XRect {
		return this.m_boundingRect;
	}

	public set boundingRect (__val:XRect) {
		this.m_boundingRect = __val;		
	}

//------------------------------------------------------------------------------------------
	public setCX (
		__x1:number,
		__x2:number,
		__y1:number,
		__y2:number
		):void {
			
		this.m_cx.x = __x1;
		this.m_cx.y = __y1;
		this.m_cx.width = __x2 - __x1 + 1;
		this.m_cx.height = __y2 - __y1 + 1;
	}

//------------------------------------------------------------------------------------------
	public getCX ():XRect {
		return this.m_cx;
	}

//------------------------------------------------------------------------------------------
	public setNamedCX (
		__name:string,
		__x1:number,
		__x2:number,
		__y1:number,
		__y2:number
		):void {
			
		this.m_namedCX.set (__name, new XRect (__x1, __y1, __x2 - __x1 + 1, __y2 - __y1 + 1));
	}

//------------------------------------------------------------------------------------------
	public getNamedCX (__name:string):XRect {
		return this.m_namedCX.get (__name).cloneX ();
	}

//------------------------------------------------------------------------------------------
	public getAdjustedNamedCX (__name:string):XRect {
		var __rect:XRect = this.m_namedCX.get (__name).cloneX ();	
		__rect.offset (this.x, this.y);
		return __rect;
	}

//------------------------------------------------------------------------------------------		
	public get autoCulling ():boolean {
		return this.m_autoCulling;
	}

	public set autoCulling (__val:boolean) {
		this.m_autoCulling = __val;
		
		if (this.autoCulling) {
			this.boundingRect = new XRect (-32, -32, 64, 64);
		}
	}

//------------------------------------------------------------------------------------------
	public setItem (__item:XMapItemModel):void {
		this.m_item = __item;
		
		if (this.m_item != null) {
			this.m_boundingRect = __item.boundingRect.cloneX ();
			
			this.m_item.boundingRect.copy2 (this.m_itemRect);
			this.m_itemPos.x = this.m_item.x;
			this.m_itemPos.y = this.m_item.y;
			this.m_itemRect.offsetPoint (this.m_itemPos);
		}
	}

//------------------------------------------------------------------------------------------
	public get item ():XMapItemModel {
		return this.m_item;
	}

	public set item (__val:XMapItemModel) {	
	}

//------------------------------------------------------------------------------------------
	public setupItemParamsXML ():void {
		this.m_xml = new XSimpleXMLNode ();
		
		if (this.item != null && this.item.params != null && this.item.params != "") {
			this.m_xml.setupWithXMLString (this.item.params);
		}
	}

//------------------------------------------------------------------------------------------
	public setXML (__xml:XSimpleXMLNode):void {
		this.m_xml = __xml;
	}

//------------------------------------------------------------------------------------------
	public getXML ():XSimpleXMLNode {
		return this.m_xml;
	}

//------------------------------------------------------------------------------------------
	public itemHasAttribute (__attr:string):boolean {
		return this.m_xml.hasAttribute (__attr);	
	}

//------------------------------------------------------------------------------------------
	public itemGetAttribute (__attr:string):any {
		return this.m_xml.getAttribute (__attr);
	}

//------------------------------------------------------------------------------------------
	public itemGetAttributeString (__attr:string):string {
		return this.m_xml.getAttributeString (__attr);
	}

//------------------------------------------------------------------------------------------
	public itemGetAttributeFloat (__attr:string):number {
		return this.m_xml.getAttributeFloat (__attr);
	}

//------------------------------------------------------------------------------------------
	public itemGetAttributeInt (__attr:string):number {
		return this.m_xml.getAttributeInt (__attr);
	}

//------------------------------------------------------------------------------------------
	public itemGetAttributeBoolean (__attr:string):boolean {
		return this.m_xml.getAttributeBoolean (__attr);
	}

//------------------------------------------------------------------------------------------
	public setPivot (__dx:number, __dy:number):void {
	}

//------------------------------------------------------------------------------------------
	public isWorldGameObject (__gameObject:XGameObject):boolean {
		return this.m_worldObjects.has (__gameObject);
	}
	
//------------------------------------------------------------------------------------------
	public getWorldXGameObjects ():Map<XGameObject, number> {
		return this.m_worldObjects;
	}

//------------------------------------------------------------------------------------------
	public getChildXGameObjects ():Map<XGameObject, number> {
		return this.m_childObjects;
	}

//------------------------------------------------------------------------------------------
	public createAnimatedSprite (__name:string):PIXI.AnimatedSprite {	
		var sheet:PIXI.Spritesheet = world.getResourceByName (__name);

		var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);
		__animatedSprite.visible = false;
		this.m_animatedSprites.set (__animatedSprite, __name);
			
		return __animatedSprite;
	}

//------------------------------------------------------------------------------------------
	public createAnimatedSpriteFrom (__name:string, __subManagerName:string = null):PIXI.AnimatedSprite {	
		return this.createAnimatedSpriteX (__name, __subManagerName);
	}

//------------------------------------------------------------------------------------------
	public createAnimatedSpriteX (__name:string,  __subManagerName:string = null):PIXI.AnimatedSprite {
		var __subManager:XSubTextureManager = this.getDefaultSubTextureManager ();

		if (__subManagerName != null) {
			__subManager = this.m_XApp.getSubTextureManager (__subManagerName);
		}

		var __animatedSprite:PIXI.AnimatedSprite = __subManager.createAnimatedSprite (__name);
		__animatedSprite.visible = false;
		this.m_animatedSprites.set (__animatedSprite, __name);
			
		return __animatedSprite;
	}

//------------------------------------------------------------------------------------------
	public removeAnimatedSprite (__animatedSprite:PIXI.AnimatedSprite):void {
		if (this.m_animatedSprites.has (__animatedSprite)) {
			this.m_animatedSprites.delete (__animatedSprite);

			__animatedSprite.destroy ();
		}
	}

//------------------------------------------------------------------------------------------
	public removeAllAnimatedSprites ():void {
		var __animatedSprite:PIXI.AnimatedSprite

		for (__animatedSprite of this.m_animatedSprites.keys ()) {
			__animatedSprite.destroy ();
		}

		this.m_animatedSprites.clear ();
	}

//------------------------------------------------------------------------------------------
	public getDefaultSubTextureManager ():XSubTextureManager {
		return this.m_XApp.getDefaultSubTextureManager ()
	}

//------------------------------------------------------------------------------------------
	public createSprite (__name:string):PIXI.Sprite {
		var __texture:PIXI.Texture = world.getResourceByName (__name);
		var __sprite:PIXI.Sprite = PIXI.Sprite.from (__texture);

		this.m_sprites.set (__name, __sprite);

		return __sprite;
	}

//------------------------------------------------------------------------------------------
	public removeAllSprites ():void {
		var __name:string;

		for (__name of this.m_sprites.keys ()) {
			var __sprite:PIXI.Sprite = this.m_sprites.get (__name);

			__sprite.destroy ();
		}

		this.m_sprites.clear ();
	}

//------------------------------------------------------------------------------------------
	public createXTextSprite (
		__width:number=32,
		__height:number=32,
		__text:string="",
		__fontName:string="Aller",
		__fontSize:number=12,
		__color:number=0x000000,
		__bold:boolean=false,
		__horzAlign:string="left",
		__vertAlign:string="top"
	):XTextSprite {

		var __textSprite:XTextSprite = new XTextSprite (
			__width,
			__height,
			__text,
			__fontName,
			__fontSize,
			__color,
			__bold,
			__horzAlign,
			__vertAlign
		);

		return __textSprite;
	}

	//------------------------------------------------------------------------------------------
	public removeAllXTextSprites ():void {
		var __name:string;

		for (__name of this.m_textSprites.keys ()) {
			var __textSprite:XTextSprite = this.m_textSprites.get (__name);
			__textSprite.cleanup ();
		}

		this.m_textSprites.clear ();
	}

//------------------------------------------------------------------------------------------
	public addGameObjectToSelf (__class:any):XGameObject {
		var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
		__gameObject.setup (this.world, this.getLayer(), this.getDepth());
		
		__gameObject.setParent (this);
		
		this.addChild (__gameObject);
		
		this.m_selfObjects.set (__gameObject, 0);
		
		return __gameObject;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addGameObject (__class, __layer, __depth, __visible);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}
	
//------------------------------------------------------------------------------------------
	public addDetachedGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addDetachedGameObject (__class, __layer, __depth, __visible);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addPooledGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addPooledGameObject (__class, __layer, __depth, __visible);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addPooledDetachedGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addPooledDetachedGameObject (__class, __layer, __depth, __visible);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addGameObjectAsChild (__class, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectAsDetachedChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addGameObjectAsDetachedChild (__class, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectAsChild0 (__gameObject:XGameObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			this.world.addGameObjectAsChild0 (__gameObject, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}
	
//------------------------------------------------------------------------------------------
	public addGameObjectAsDetachedChild0 (__gameObject:XGameObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			this.world.addGamedObjectAsDetachedChild0 (__gameObject, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addPooledGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addPooledGameObjectAsChild (__class, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addPooledGameObjectAsDetachedChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addPooledGameObjectAsDetachedChild (__class, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public getParentObject ():XGameObject {
		return this.m_parent;
	}
	
//------------------------------------------------------------------------------------------
	public setParentObject (__parent:XGameObject):void {
		this.m_parent = __parent;
	}
	
	//------------------------------------------------------------------------------------------
	public setPoolClass (__class:any):void {
		this.m_poolClass = __class;
	}

//------------------------------------------------------------------------------------------
	public globalToLocalX (__gameObject:XGameObject, __point:XPoint, __depth:number = 0):XPoint {
        var __tabs:Array<String> = ["...", "......", ".........", "............", "...............", "...................."];

		console.log (": XGameObject: globalToLocal: ", __tabs[__depth], __point.x, __point.y, __gameObject, __gameObject.x, __gameObject.y);
		
		__point.x -= __gameObject.x;
		__point.y -= __gameObject.y;

		if (__gameObject.getParentObject () != null) {
		 	return __gameObject.globalToLocalX (__gameObject.getParentObject (), __point, __depth + 1);
		}

		return __point;
	}

//------------------------------------------------------------------------------------------
	public globalToLocal (__gameObject:XGameObject, __point:PIXI.Point, __depth:number = 0):PIXI.Point {
		var __tabs:Array<String> = ["...", "......", ".........", "............", "...............", "...................."];

		// console.log (": XGameObject: globalToLocal: ", __tabs[__depth], __point.x, __point.y, __gameObject, __gameObject.x, __gameObject.y);
		
		__point.x -= __gameObject.x;
		__point.y -= __gameObject.y;

		if (__gameObject.getParentObject () != null) {
			return __gameObject.globalToLocal (__gameObject.getParentObject (), __point, __depth + 1);
		}

		return __point;
	}

//------------------------------------------------------------------------------------------
	public localToGlobal (__gameObject:XGameObject, __point:PIXI.Point, __depth:number = 0):PIXI.Point {
		var __tabs:Array<String> = ["...", "......", ".........", "............", "...............", "...................."];

		// console.log (": XGameObject: globalToLocal: ", __tabs[__depth], __point.x, __point.y, __gameObject, __gameObject.x, __gameObject.y);
		
		__point.x += __gameObject.x;
		__point.y += __gameObject.y;

		if (__gameObject.getParentObject () != null) {
			return __gameObject.localToGlobal (__gameObject.getParentObject (), __point, __depth + 1);
		}

		return __point;
	}

//------------------------------------------------------------------------------------------
	public translateAlias (__path:string):string {
		return this.m_XApp.getXProjectManager ().translateAlias (__path);
	}

//------------------------------------------------------------------------------------------
//
// SELF
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeSelfObject (__gameObject:XGameObject):void {
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
	public removeSelfObject0 (__gameObject:XGameObject):void {
		if (this.m_selfObjects.has (__gameObject)) {
			this.m_selfObjects.delete (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllSelfObjects ():void {
        var __gameObject:XGameObject;

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
	public removeWorldObject (__gameObject:XGameObject):void {
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
	public removeWorldObject0 (__gameObject:XGameObject):void {
		if (this.m_worldObjects.has (__gameObject)) {
			this.m_worldObjects.delete (__gameObject);
				
			this.world.removeGameObject (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllWorldObjects ():void {
        var __gameObject:XGameObject;

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
	public removeChildObject (__gameObject:XGameObject):void {
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
	public removeChildObject0 (__gameObject:XGameObject):void {
		if (this.m_childObjects.has (__gameObject)) {
			this.m_childObjects.delete (__gameObject);
				
			this.world.removeGameObject (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllChildObjects ():void {
        var __gameObject:XGameObject;

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
	public addSpriteToSelf (__sprite__:PIXI.DisplayObject, __dx:number, __dy:number):PIXI.DisplayObject {
		this.m_selfSprites.set (__sprite__, 0);	

		__sprite__.pivot.x = -__dx;
		__sprite__.pivot.y = -__dy;
		
		this.addChild (__sprite__);	
		
		return __sprite__;
	}
	
//------------------------------------------------------------------------------------------
	public removeAllSelfSprites ():void {
        var __sprite:PIXI.DisplayObject;

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
	public addSpriteAsChild (__sprite__:PIXI.DisplayObject, __dx:number, __dy:number, __layer:number, __depth:number, __visible:boolean = false):PIXI.DisplayObject {
		__sprite__.pivot.x = -__dx;
		__sprite__.pivot.y = -__dy;
		
		this.addSortableChild (__sprite__, __layer, __depth, __visible);	
		
		return __sprite__;
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChild (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = false):void {
	    this.m_childSprites.set (__sprite, 0);
		
		this.world.addSortableChild (__sprite, __layer, __depth, __visible);
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChild0 (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = false, __metaData:any = null):void {
		if (__metaData == null) {
			__metaData = {
				x: 0,
				y: 0,
				rotation: 0,
				alpha: 1.0,
				scaleX: 1.0,
				scaleY: 1.0,
				visible: true
			};
		}

		this.m_childSprites0.set (__sprite, __metaData);
		
		this.world.addSortableChild0 (__sprite, __layer, __depth, __visible);
	}

//------------------------------------------------------------------------------------------
	public removeChildSprite (__sprite:PIXI.DisplayObject):void {
		if (this.m_childSprites.has (__sprite)) {
			this.m_childSprites.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}

		if (this.m_childSprites0.has (__sprite)) {
			this.m_childSprites0.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
	public removeAllChildSprites ():void {
        var __sprite:PIXI.DisplayObject;
    
		for (__sprite of this.m_childSprites.keys ()) {
			this.removeChildSprite (__sprite);
		}

		for (__sprite of this.m_childSprites0.keys ()) {
			this.removeChildSprite (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// World
//
//------------------------------------------------------------------------------------------
	
//------------------------------------------------------------------------------------------
	public addSpriteToWorld (__sprite__:PIXI.DisplayObject, __dx:number, __dy:number, __layer:number, __depth:number, __visible:boolean = true):PIXI.DisplayObject {
		__sprite__.pivot.x = -__dx;
		__sprite__.pivot.y = -__dy;

		this.addSortableChildToWorld (__sprite__, __layer, __depth, __visible);	
		
		return __sprite__;
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChildToWorld (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):void {
		this.m_worldSprites.set (__sprite, 0);
		
		this.world.addSortableChild (__sprite, __layer, __depth, __visible);
	}
	
//------------------------------------------------------------------------------------------
	public removeWorldSprite (__sprite:PIXI.DisplayObject):void {
		if (this.m_worldSprites.has (__sprite)) {
			this.m_worldSprites.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
	public removeAllWorldSprites ():void {
        var __sprite:PIXI.DisplayObject;

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
	public createBitmapFont (__name:string, __style:any, __options:any):void {
        PIXI.BitmapFont.from (__name, __style, __options);

		this.m_bitmapFonts.set (__name, 0);
	}

//------------------------------------------------------------------------------------------
	public getBitmapFontChars ():Array<any> {
		return PIXI.BitmapFont.ASCII.concat (["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"]);
	}
	
//------------------------------------------------------------------------------------------
	public removeBitmapFont (__name:string):void {
		if (this.m_bitmapFonts.has (__name)) {
			PIXI.BitmapFont.uninstall (__name);

			this.m_bitmapFonts.delete (__name);
		}
	}

//------------------------------------------------------------------------------------------
	public removeAllBitmapFonts ():void {
        var __name:string;

		for (__name of this.m_bitmapFonts.keys ()) {
			this.removeBitmapFont (__name);
		}
	}

//------------------------------------------------------------------------------------------
	public createXSignal ():XSignal {
		var __signal:XSignal = XGameObject.getXApp ().getXSignalManager ().createXSignal ();
		
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
					
			XGameObject.getXApp ().getXSignalManager ().removeXSignal (__signal);
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
	public getXTaskManager0 ():XTaskManager {
		return XGameObject.getXApp ().getXTaskManager0 ();
	}

//------------------------------------------------------------------------------------------
	public addTask0 (
		__taskList:Array<any>,
		__findLabelsFlag:boolean = false
		):XTask {

		var __task:XTask = this.m_XTaskSubManager0.addTask (__taskList, __findLabelsFlag);
			
		__task.setParent (this);
			
		return __task;
	}

//------------------------------------------------------------------------------------------
	public changeTask0 (
		__task:XTask,
		__taskList:Array<any>,
		__findLabelsFlag:boolean = false
		):XTask {
				
		return this.m_XTaskSubManager0.changeTask (__task, __taskList, __findLabelsFlag);
	}

//------------------------------------------------------------------------------------------
	public isTask0 (__task:XTask):boolean {
		return this.m_XTaskSubManager0.isTask (__task);
	}		
	
//------------------------------------------------------------------------------------------
	public removeTask0 (__task:XTask):void {
		this.m_XTaskSubManager0.removeTask (__task);	
	}

//------------------------------------------------------------------------------------------
	public removeAllTasks0 ():void {
		this.m_XTaskSubManager0.removeAllTasks ();
	}

//------------------------------------------------------------------------------------------
	public addEmptyTask0 ():XTask {
		return this.m_XTaskSubManager0.addEmptyTask ();
	}

//------------------------------------------------------------------------------------------
	public getEmptyTaskX0 ():Array<any> {
		return this.m_XTaskSubManager0.getEmptyTaskX ();
	}	
	
//------------------------------------------------------------------------------------------
	public gotoLogic0 (__logic:any):void {
		this.m_XTaskSubManager0.gotoLogic (__logic);
	}

//------------------------------------------------------------------------------------------
	public getXTaskManager ():XTaskManager {
		return XGameObject.getXApp ().getXTaskManager ();
	}

//------------------------------------------------------------------------------------------
	public addTask (
		__taskList:Array<any>,
		__findLabelsFlag:boolean = false
		):XTask {

		var __task:XTask = this.m_XTaskSubManager.addTask (__taskList, __findLabelsFlag);
			
		__task.setParent (this);
			
		return __task;
	}

//------------------------------------------------------------------------------------------
	public changeTask (
		__task:XTask,
		__taskList:Array<any>,
		__findLabelsFlag:boolean = false
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
	public getXProcessManager0 ():XProcessManager {
		return XGameObject.getXApp ().getXProcessManager0 ();
	}

//------------------------------------------------------------------------------------------
	public addProcess0 (
		__generatorFunc:any
		):XProcess {

		var __process:XProcess = this.m_XProcessSubManager0.addProcess (__generatorFunc);
			
		__process.setParent (this);
			
		return __process;
	}

//------------------------------------------------------------------------------------------
	public changeProcess0 (
		__process:XProcess,
		__generatorFunc:any
		):XProcess {
				
		return this.m_XProcessSubManager0.changeProcess (__process, __generatorFunc);
	}

//------------------------------------------------------------------------------------------
	public isProcess0 (__process:XProcess):boolean {
		return this.m_XProcessSubManager0.isProcess (__process);
	}		

//------------------------------------------------------------------------------------------
	public removeProcess0 (__process:XProcess):void {
		this.m_XProcessSubManager0.removeProcess (__process);	
	}

//------------------------------------------------------------------------------------------
	public removeAllProcesses0 ():void {
		this.m_XProcessSubManager0.removeAllProcesses ();
	}

//------------------------------------------------------------------------------------------
	public addEmptyProcess0 ():XProcess {
		return this.m_XProcessSubManager0.addEmptyProcess ();
	}

//------------------------------------------------------------------------------------------
	public getXProcessManager ():XProcessManager {
		return XGameObject.getXApp ().getXProcessManager ();
	}

//------------------------------------------------------------------------------------------
	public addProcess (
		__generatorFunc:any
		):XProcess {

		var __process:XProcess = this.m_XProcessSubManager.addProcess (__generatorFunc);
			
		__process.setParent (this);
			
		return __process;
	}

//------------------------------------------------------------------------------------------
	public changeProcess (
		__process:XProcess,
		__generatorFunc:any
		):XProcess {
				
		return this.m_XProcessSubManager.changeProcess (__process, __generatorFunc);
	}

//------------------------------------------------------------------------------------------
	public isProcess (__process:XProcess):boolean {
		return this.m_XProcessSubManager.isProcess (__process);
	}		
	
//------------------------------------------------------------------------------------------
	public removeProcess (__process:XProcess):void {
		this.m_XProcessSubManager.removeProcess (__process);	
	}

//------------------------------------------------------------------------------------------
	public removeAllProcesses ():void {
		this.m_XProcessSubManager.removeAllProcesses ();
	}

//------------------------------------------------------------------------------------------
	public addEmptyProcess ():XProcess {
		return this.m_XProcessSubManager.addEmptyProcess ();
	}

//------------------------------------------------------------------------------------------
	public setDepth (__depth:number):XGameObject {
		this.m_depth = __depth;
		
		return this;
	}		
	
//------------------------------------------------------------------------------------------
    public getDepth ():number {
        return this.m_depth;
    }

//------------------------------------------------------------------------------------------
	public setPropagateDepthFlag (__flag:boolean):XGameObject {
		this.m_propagateDepthFlag = __flag;
		
		return this;
	}	
		
//------------------------------------------------------------------------------------------
	public setLayer (__layer:number):XGameObject {
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
	public get propagateCount ():number {
		return this.m_propagateCount;
	}

//------------------------------------------------------------------------------------------
	public set propagateCount (__count:number) {
		this.m_propagateCount = __count;
	}

//------------------------------------------------------------------------------------------
	public isReady ():boolean {
		return this.m_delayed == 0;
	}
	
//------------------------------------------------------------------------------------------
    public updateCollisions ():void {
		this.setCollisions ();

        var __gameObject:XGameObject;

		for (__gameObject of this.m_childObjects.keys ()) {
			__gameObject.updateCollisions ();
		}
	}
	
//------------------------------------------------------------------------------------------
	public update ():void {
			if (this.m_delayed > 0) {
				this.m_delayed--;
				
				return;
			}
	
//------------------------------------------------------------------------------------------
			var __x:number;
			var __y:number;
			var __rotation:number;

			if (this.m_attachedMatterBody != null) {
				this.x = this.m_attachedMatterBody.position.x;
				this.y = this.m_attachedMatterBody.position.y;
				if (this.m_matterRotate) {
					this.m_masterRotation = this.angle = this.m_attachedMatterBody.angle * 180 / Math.PI; // this.setMasterRotation (this.angle = this.m_attachedMatterBody.angle * 180 / Math.PI);
				}
			}
			
			__x = this.m_masterX; // this.getMasterX ();
			__y = this.m_masterY; // this.getMasterY ();
			__rotation = this.m_masterRotation; // this.getMasterRotation ();

			var __visible:boolean = this.m_masterVisible; // this.getMasterVisible ();
			var __scaleX:number = this.m_masterScaleX * this.m_masterScaleRatio; // this.getMasterScaleX () * this.m_masterScaleRatio;
			var __scaleY:number = this.m_masterScaleY * this.m_masterScaleRatio; // this.getMasterScaleY () * this.m_masterScaleRatio;
			var __flipX:number = this.m_masterFlipX; // this.getMasterFlipX ();
			var __flipY:number = this.m_masterFlipY; // this.getMasterFlipY ();
			var __depth:number = this.m_masterDepth; // this.getMasterDepth ();
			var __alpha:number = this.m_masterAlpha; // this.getMasterAlpha ();
			var __mouseEnabled:boolean = this.m_masterMouseEnabled;

//------------------------------------------------------------------------------------------
			if (this.m_propagateCount >= 0) {
				if (this.m_propagateCount == 0) {
					return;
				}

				this.m_propagateCount--;
			}

//------------------------------------------------------------------------------------------
// update child objects that live in the World
//------------------------------------------------------------------------------------------	
			var __depthSprite:XDepthSprite = this.parent as XDepthSprite;
			if (__depthSprite != null) {
				__depthSprite.setDepth (this.getDepth ());
			}

			var __gameObject:XGameObject;

			for (__gameObject of this.m_childObjects.keys ()) {	
				if (__gameObject != null && !__gameObject.isDead) {	
					var __parent:PIXI.DisplayObject = __gameObject.parent;

					if (__parent != null) {
						__parent.x = __x / G.scaleRatio;
						__parent.y = __y / G.scaleRatio;
						__parent.angle = __rotation;
						__parent.visible = __visible;
						__parent.scale.x = __scaleX * __flipX / G.scaleRatio;
						__parent.scale.y = __scaleY * __flipY / G.scaleRatio;
						__parent.alpha = __alpha;
					}

					// propagate rotation, scale, visibility, alpha
					__gameObject.m_masterX = __gameObject.x * __scaleX + __x; // __gameObject.setMasterX (__gameObject.x * __scaleX + __x);
					__gameObject.m_masterY = __gameObject.y * __scaleY + __y; // __gameObject.setMasterY (__gameObject.y * __scaleY + __y);
					__gameObject.m_masterRotation = (__gameObject.angle + __rotation) % 360; //__gameObject.setMasterRotation (__gameObject.angle + __rotation);
					__gameObject.m_masterScaleX = __gameObject.scale.x * __scaleX; //__gameObject.setMasterScaleX (__gameObject.scale.x * __scaleX);
					__gameObject.m_masterScaleY = __gameObject.scale.y * __scaleY; //__gameObject.setMasterScaleY (__gameObject.scale.y * __scaleY);
					__gameObject.m_masterFlipX = __gameObject.m_flipX * __flipX; //__gameObject.setMasterFlipX (__gameObject.getFlipX () * __flipX);
					__gameObject.m_masterFlipY = __gameObject.m_flipY * __flipY; //__gameObject.setMasterFlipY (__gameObject.getFlipY () * __flipY);
					__gameObject.m_masterVisible = __gameObject.visible && __visible; // __gameObject.setMasterVisible (__gameObject.visible && __visible);
					__gameObject.m_masterDepth = __gameObject.m_depth; // __gameObject.setMasterDepth (__gameObject.getDepth ());
					__gameObject.m_masterAlpha = __gameObject.alpha * __alpha; //__gameObject.setMasterAlpha (__gameObject.alpha * __alpha);
					__gameObject.m_masterMouseEnabled =  __gameObject.m_mouseEnabled && __mouseEnabled;

                    __gameObject.update ();
                }
			}
		
//------------------------------------------------------------------------------------------
			var __sprite:PIXI.DisplayObject;
			
//------------------------------------------------------------------------------------------			
// update self sprites that live in the World
//------------------------------------------------------------------------------------------
			for (__sprite of this.m_selfSprites.keys ()) {
				if (__sprite != null) {
					__sprite.scale.x = __flipX / G.scaleRatio;
					__sprite.scale.y = __flipY / G.scaleRatio;
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
					var __parent:PIXI.DisplayObject = __sprite.parent;

					__parent.x = __x / G.scaleRatio;
					__parent.y = __y / G.scaleRatio;
					__parent.angle = __rotation;
					__parent.visible = __sprite.visible && __visible;
					__parent.scale.x = __scaleX * __flipX / G.scaleRatio;
					__parent.scale.y = __scaleY * __flipY / G.scaleRatio;
					__parent.alpha = __alpha;
				}
			}

			for (__sprite of this.m_childSprites0.keys ()) {
				if (__sprite != null) {
					var __metaData:any = this.m_childSprites0.get (__sprite);

					__sprite.x = (__metaData.x * __scaleX + __x) / G.scaleRatio;
					__sprite.y = (__metaData.y * __scaleY + __y) / G.scaleRatio;
					__sprite.angle = (__metaData.rotation * __scaleX + __rotation) % 360;
					__sprite.visible = __metaData.visible && __visible;
					__sprite.scale.x = __metaData.scaleX * __scaleX * __flipX / G.scaleRatio;
					__sprite.scale.y = __metaData.scaleY * __scaleY * __flipY / G.scaleRatio;
					if (__metaData.visible && __visible) {
						__sprite.alpha = __metaData.alpha * __alpha;
					} else {
						__sprite.alpha = 0.0;
					}
				}
			}
		
//------------------------------------------------------------------------------------------
// cull object (if outside world bounding rectangle)
//------------------------------------------------------------------------------------------
			this.cullObject ();
	}
	
//------------------------------------------------------------------------------------------
    public createMatterBody ():void {
    }

//------------------------------------------------------------------------------------------
	public attachMatterBodyCircle (__body:Body, __radius:number, __debug:boolean = true):XGameObject {
		var __graphics:PIXI.Graphics = null;

		/*
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);
		__graphics.drawCircle (0, 0, __radius);
		__graphics.endFill ();
		*/

		this.attachMatterBodyDebug (__body, __graphics, __debug);

		return this;
	}

//------------------------------------------------------------------------------------------
	public attachMatterBodyRectangle (__body:Body, __rect:XRect, __debug:boolean = true):XGameObject {
		var __graphics:PIXI.Graphics = null;
		
		/*
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);
		__graphics.drawRect (-__rect.width/2, -__rect.height/2, __rect.width, __rect.height);
		__graphics.endFill ();
		*/

		this.attachMatterBodyDebug (__body, __graphics, __debug);

		return this;
	}

//------------------------------------------------------------------------------------------
	public attachMatterBodyVertices (__body:Body, __vertices:Array<any>, __debug:boolean = true):XGameObject {
		var __graphics:PIXI.Graphics = null;

		/*
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);

        __graphics.drawPolygon (
            this.convertVerticesToPoints (__vertices)
		);

		__graphics.endFill ();

		__graphics.alpha = 0.33;
		*/

		this.convertVerticesToPoints (__vertices);
		
		 this.attachMatterBodyDebug (__body, __graphics, __debug);

		 return this;
	}

//------------------------------------------------------------------------------------------
	public convertVerticesToPoints (__vertices:Array<any>):Array<PIXI.Point> {
		var __points:Array<PIXI.Point> = new Array<PIXI.Point> ();

		var __vector = Matter.Vertices.centre (__vertices);

		this.m_matterDX = __vector.x;
		this.m_matterDY = __vector.y;
		
		this.setPivot (__vector.x, __vector.y);

		var __vertex:any;

		for (__vertex of __vertices) {
			__points.push (new PIXI.Point (__vertex.x - __vector.x, __vertex.y - __vector.y));
		}

		return __points;
	}

//------------------------------------------------------------------------------------------
	public getMatterDX ():number {
		return this.m_matterDX;
	}

//------------------------------------------------------------------------------------------
	public getMatterDY ():number {
		return this.m_matterDY;
	}

//------------------------------------------------------------------------------------------
	public setMatterRotate (__value:boolean):void {
		this.m_matterRotate = __value;
	}

//------------------------------------------------------------------------------------------
	public attachMatterBodyDebug (__body:Body, __graphics:PIXI.Graphics, __debug:boolean = false):XGameObject {
		this.m_attachedDebugSprite = new PIXI.Sprite ();
		__debug = false; if (__debug) {
			// this.m_attachedDebugSprite.addChild (__graphics);
		}
		
		this.addSortableChild (this.m_attachedDebugSprite, this.getLayer (), this.getDepth ());

		this.attachMatterBody (__body);

		return this;
	}

//------------------------------------------------------------------------------------------
    public attachMatterBody (__body:Body):XGameObject {
		this.m_attachedMatterBody = __body;

		Matter.World.add (this.world.getMatterEngine ().world, __body);

		return this;
    }

//------------------------------------------------------------------------------------------
    public detachMatterBody ():void {
		if (this.m_attachedMatterBody != null) {
			Matter.World.remove (this.world.getMatterEngine ().world, this.m_attachedMatterBody);

			this.m_attachedMatterBody = null;
		}
    }

//------------------------------------------------------------------------------------------
	public getMatterBody ():Matter.Body {
		return this.m_attachedMatterBody;
	}
	
//------------------------------------------------------------------------------------------	
	public createSprites ():void {
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
		
	public set cleanedUp (__val:boolean) {
		this.m_cleanedUp = __val;			
	}
	
//------------------------------------------------------------------------------------------
	public collisionCallback ():void {	
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
		public m_masterMouseEnabled:boolean;
	
//------------------------------------------------------------------------------------------	
		public get vel ():XPoint {
			return this.m_vel;
		}

//------------------------------------------------------------------------------------------
		public setScale (__scale:number):void {
			this.scale.x = this.scale.y = __scale;
		}
		
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
		public setMasterFlipX (__value:number):void {
			this.m_masterFlipX = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterFlipX ():number {
			return this.m_masterFlipX;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterFlipY (__value:number):void {
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
		public setMasterMouseEnabled (__enabled:boolean):void {
			this.m_masterMouseEnabled = __enabled;
		}

//------------------------------------------------------------------------------------------		
		public getMasterMouseEnabled ():boolean {
			return this.m_masterMouseEnabled;
		}

//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
class __PausableListener {
	public m_gameObject:XGameObject;
	public m_eventName:keyof PIXI.DisplayObjectEvents;
	public m_listener:any;
	public boundListener:any;

	//------------------------------------------------------------------------------------------
	constructor (__gameObject:XGameObject, __eventName:keyof PIXI.DisplayObjectEvents, __listener:any) {
		this.m_gameObject = __gameObject;
		this.m_eventName = __eventName;
		this.m_listener = __listener;

		XGameObject.getXApp ().getStage ().on (__eventName, this.boundListener = this.__listener.bind (this));
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		XGameObject.getXApp ().getStage ().off (this.m_eventName, this.boundListener);
	}

	//------------------------------------------------------------------------------------------
	private __listener (e:FederatedPointerEvent):void {
		if (!XGameObject.getXApp ().isPaused () && this.m_gameObject.getMasterMouseEnabled ()) {
			this.m_listener (e);
		}
	}

//------------------------------------------------------------------------------------------
}