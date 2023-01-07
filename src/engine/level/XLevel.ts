//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "GX-Engine"
//
// Copyright (c) 2014 Jimmy Huey (wuey99@gmail.com)
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
	import * as PIXI from 'pixi.js';
    import { XApp } from '../app/XApp';
    import { XMapLayerModel } from '../xmap/XMapLayerModel';
    import { XSubObjectPoolManager } from '../pool/XSubObjectPoolManager';
    import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';
    import { XType } from '../type/XType';
    import { XModelBase } from '../model/XModelBase';
    import { XMapItemModel } from '../xmap/XMapItemModel';
    import { XSubmapModel } from '../xmap/XSubmapModel';
    import { XObjectPoolManager } from '../pool/XObjectPoolManager';
    import { XSubTextureManager } from '../texture/XSubTextureManager';
    import { XMapModel } from '../xmap/XMapModel';
    import { XGameObject } from '../gameobject/XGameObject';
    import { XWorld } from '../sprite/XWorld';
    import { XMapView } from '../xmap/XMapView';
    import { XMapLayerView } from '../xmap/XMapLayerView';
    import { XMapLayerCachedView } from '../xmap/XMapLayerCachedView';
    import { XTask } from '../task/XTask';
    import { XPoint } from '../geom/XPoint';
    import { XRect } from '../geom/XRect';
    import { XSignal } from "../signals/XSignal";
    import { XNumber } from '../task/XNumber';
    import { G } from '../app/G';

//------------------------------------------------------------------------------------------
	export class XLevel extends XMapView {
		public script:XTask;
		
		private m_layerView:Array<XMapLayerView>;
		private m_layerPos:Array<XPoint>;
		private m_layerShake:Array<XPoint>;
		private m_layerScroll:Array<XPoint>;
		
		private m_maxLayers:number;
		
		private m_levelSelectSignal:XSignal;
		private m_gameStateChangedSignal:XSignal;
		private m_levelCompleteSignal:XSignal;
		
		private m_levelData:any;
		private m_levelProps:any;
		
		private m_viewRect:XRect;
	
		public m_adjustableGameObjects:Map<XGameObject, number>;
		public m_playfieldAdjustmentScaleX:number;
		public m_playfieldAdjustmentScaleY:number;

//------------------------------------------------------------------------------------------
		public constructor () {
			super ();
		}
	
//------------------------------------------------------------------------------------------
    public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

        return this;
    }

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);
			
		var __xml:XSimpleXMLNode = __params[this.m_paramIndex++];
		
		var __layerRemapper:Array<number> = null;
		if (__params.length > 1) {
			__layerRemapper = __params[this.m_paramIndex++];
		}

		// this.createModelFromXMLReadOnly (__xml, true, __layerRemapper);
		this.createModelFromXML (__xml, true, __layerRemapper);		
		
		this.world.setXMapModel (this.getModel ());
			
		this.initSubmapPoolManager ();

		this.m_maxLayers = this.world.MAX_LAYERS;
			
		this.m_layerPos = new Array<XPoint> ();
		this.m_layerShake = new Array<XPoint> ();
		this.m_layerScroll = new Array<XPoint> ();
		this.m_layerView = new Array<XMapLayerView> ();
			
		this.m_viewRect = new XRect ();
			
		var i:number;
			
		for (i = 0; i < this.m_maxLayers; i++) {
			this.m_layerPos.push (new XPoint (0, 0));
			this.m_layerShake.push (new XPoint (0, 0));
			this.m_layerScroll.push (new XPoint (0, 0));
			this.m_layerView.push (null);
		}
			
		this.createSprites9 ();

		this.m_levelSelectSignal = this.createXSignal ();
		this.m_gameStateChangedSignal = this.createXSignal ();
		this.m_levelCompleteSignal = this.createXSignal ();

		this.script = this.addEmptyTask ();

		this.adjustableGameObjectsScript ();

        return this;
    }
		
//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup ();
		}
		
//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
		public createSprites9 ():void {			
			var i:number = 0;
			
			while (i < this.m_maxLayers) {
				this.m_layerView[i+0] = this.addGameObjectAsChild (
					XMapLayerView,
					0, 1000.0,
					false
				) as XMapLayerView;

				this.m_layerView[i+0].afterSetup ([
					// XMapView
					this,
					// XMapModel
					this.m_XMapModel,
					// layer
					i + 0,
					// logicClassNameToClass
					G.appX.logicClassNameToClass.bind (G.appX)
				]);

				if (!this.skipBG ()) {
					this.m_layerView[i+1] = this.addGameObjectAsChild (
						XMapLayerCachedView,
						0, 1000.0 - 1,
						false
					) as XMapLayerCachedView;
						
					this.m_layerView[i+1].afterSetup ([
						// XMapView
						this,
						// XMapModel
						this.m_XMapModel,
						// layer
						i + 1
					]);
				}

				i += 2;
			}
			
			/*
			var __graphics:PIXI.Graphics = new PIXI.Graphics ();
			__graphics.beginFill (0xffa0a0);
			__graphics.drawRect (0, 0, this.world.getViewRect ().width, this.world.getViewRect ().height);
			__graphics.endFill ()
			__graphics.alpha = 0.66;

			this.addSpriteAsChild (__graphics, 0, 0, 7, 0.0, true);
			*/

			this.show ();
		}

//------------------------------------------------------------------------------------------
		public skipBG ():boolean {
			return false;
		}

//------------------------------------------------------------------------------------------
		public addXMapItem (__item:XMapItemModel, __depth:number):XGameObject {	
			return this.m_layerView[0].addXMapItem (__item, __depth);
		}

//------------------------------------------------------------------------------------------
		public getXLogicObject (__item:XMapItemModel):XGameObject {		
			return this.m_layerView[0].getXGameObject (__item);
		}
		
//------------------------------------------------------------------------------------------
		public addXMapItemModelToMap (
			__logicClassName:string, __imageClassName:string,
			__layerNum:number,
			__x:number, __y:number, __scale:number, __depth:number = 0.0,
			__frame:number = 0
			):void {

			var sheet:PIXI.Spritesheet = this.world.getResourceByName (__imageClassName);
			var __frames:Array<any> = Object.values (sheet["_frames"]);
			var __width:number =  __frames[0].frame.w;
			var __height:number =  __frames[0].frame.h;
			var __dx:number = __frames[0].anchor.x * __width;
			var __dy:number = __frames[0].anchor.y * __height;

			var __layerModel:XMapLayerModel = this.getModel ().getLayer (__layerNum);

			var __id:number = __layerModel.generateID ();

			var __item:XMapItemModel = new XMapItemModel ();

			__item.setup (
			// __layerMModel
				__layerModel,
			// __logicClassName
				__logicClassName,
			// __hasLogic
				true,
			// __name, __id
				"", __id,
			// __imageClassName, __frame
				__imageClassName, __frame,
			// __XMapItem
				"",
			// __x, __y,
				__x, __y,
			// __scale, __rotation, __depth
				__scale, 0, __depth,
			// __collisionRect,
				new XRect (-16, -16, 32, 32),
			// __boundingRect,
				new XRect (__scale < 0 ? __width - __dx : -__dx, -__dy, __width, __height),
			// __params
				"<params/>",
				[]
			);

			__layerModel.addItem (__item);
		}

//------------------------------------------------------------------------------------------
	public adjustableGameObjectsScript ():void {
		this.m_adjustableGameObjects = new Map<XGameObject, number> ();

		this.m_playfieldAdjustmentScaleX = 1.0;
		this.m_playfieldAdjustmentScaleY = 1.0;

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				() => {
					XType.forEach (this.m_adjustableGameObjects,
						(__gameObject:XGameObject) => {
							var __callback:any = this.m_adjustableGameObjects.get (__gameObject);

							if (__callback == null) {	
								__gameObject.scale.x = this.m_playfieldAdjustmentScaleX * 1.0;
								__gameObject.scale.y = this.m_playfieldAdjustmentScaleY * 1.0;
							} else {
								__callback (__gameObject);
							}
						}
					)
				},

				XTask.GOTO, "loop",

			XTask.RETN,
		]);
	}

//------------------------------------------------------------------------------------------
	public setPlayfieldAdjustmentScale (__scaleX:number, __scaleY:number):void {
		this.m_playfieldAdjustmentScaleX = __scaleX;
		this.m_playfieldAdjustmentScaleY = __scaleY;
	}

//------------------------------------------------------------------------------------------
	public addAdjustableGameObject (__gameObject:XGameObject, __callback:any = null):void {
	}

//------------------------------------------------------------------------------------------
	public addAdjustableGameObjectX (__gameObject:XGameObject, __callback:any = null):void {
		this.m_adjustableGameObjects.set (__gameObject, __callback);

		__gameObject.addKillListener (() => {
			this.m_adjustableGameObjects.delete (__gameObject);
		});
	}

//------------------------------------------------------------------------------------------
	public scrollTo (__layer:number, __x:number, __y:number):void {
		this.m_layerPos[__layer].x = __x / G.scaleRatio;
		this.m_layerPos[__layer].y = __y / G.scaleRatio;
	}

//------------------------------------------------------------------------------------------
	public updateScroll ():void {
		var i:number;
			
		for (i = 0; i < this.m_maxLayers; i++) {
			this.m_layerPos[i].copy2 (this.m_layerScroll[i]);
				
			this.m_layerScroll[i].x += this.m_layerShake[i].x;
			this.m_layerScroll[i].y += this.m_layerShake[i].y;
				
			this.world.getXWorldLayer (i).setPos (this.m_layerScroll[i]);
		}
	}
		
//------------------------------------------------------------------------------------------
	public updateFromXMapModel ():void {
		var i:number;
			
		for (i = 0; i < this.m_maxLayers; i++) {
			if ((i & 1) == 0  || !this.skipBG ()) {
				this.m_layerView[i].updateFromXMapModel ();
			}
		}
	}
		
//------------------------------------------------------------------------------------------
	public prepareUpdateScroll ():void {
		var i:number;
			
		for (i = 0; i < this.m_maxLayers; i++) {
			this.m_layerPos[i].copy2 (this.m_layerScroll[i]);
				
			this.m_layerScroll[i].x += this.m_layerShake[i].x;
			this.m_layerScroll[i].y += this.m_layerShake[i].y;
		}

		for (i = 0; i < this.m_maxLayers; i++) {
			this.m_viewRect.x = -this.m_layerScroll[i].x;
			this.m_viewRect.y = -this.m_layerScroll[i].y;
			this.m_viewRect.width = this.world.getViewRect ().width;
			this.m_viewRect.height = this.world.getViewRect ().height;
				
			if ((i & 1) == 0 || !this.skipBG ()) {
				this.m_layerView[i].updateFromXMapModelAtRect (this.m_viewRect);
			}
		}
	}
		
//------------------------------------------------------------------------------------------
	public finishUpdateScroll ():void {
		var i:number;
			
		for (i = 0; i < this.m_maxLayers; i++) {
			this.world.getXWorldLayer (i).setPos (this.m_layerScroll[i]);
		}			
	}

//------------------------------------------------------------------------------------------
	public onEntry ():void {
		this.FadeIn_Script ();
	}
		
//------------------------------------------------------------------------------------------
	public onExit ():void {
	}
		
//------------------------------------------------------------------------------------------
	public setLevelAlpha (__alpha:number):void {
		G.appX.setMaskAlpha (__alpha);
	}

//------------------------------------------------------------------------------------------
	public isShaking ():boolean {
		var __isShaking:boolean = false;

		var i:number;
				
		for (i = 0; i < this.m_maxLayers; i++) {
			if (this.m_layerShake[i].x != 0) {
				__isShaking = true;
			}

			if (this.m_layerShake[i].y != 0) {
				__isShaking = true;
			}
		}

		return __isShaking;
	}

//------------------------------------------------------------------------------------------
	public addXShake (__count:number=15, __delayValue:number=0x0100):void {
		var __setX =  (__dy:number) => {
			var i:number;
				
			for (i = 0; i < this.m_maxLayers; i++) {
				this.m_layerShake[i].x = __dy;
				// this.m_layerShake[i].y = __dy;
			}
				
			this.updateScroll ();
		}
			
		var __delay:XNumber = new XNumber (0);
		__delay.value = __delayValue;
			
		this.addTask ([
			XTask.LABEL, "loop",
				() => {__setX (-__count); }, XTask.WAIT, __delay,
				() => {__setX ( __count); }, XTask.WAIT, __delay,
				
			XTask.FLAGS, (__task:XTask) => {
				__count--;
					
				__task.ifTrue (__count == 0);
			}, XTask.BNE, "loop",
				
			() => {
				__setX (0);
			},
				
			XTask.RETN,
		]);
	}
		
//------------------------------------------------------------------------------------------
	public addYShake (__count:number=15, __delayValue:number=0x0100):void {
		var __setY = (__dy:number) => {
			var i:number;
				
			for (i = 0; i < this.m_maxLayers; i++) {
				// this.m_layerShake[i].x = __dy;
				this.m_layerShake[i].y = __dy;
			}
				
			this.updateScroll ();
		}
			
		var __delay:XNumber = new XNumber (0);
		__delay.value = __delayValue;
			
		this.addTask ([
			XTask.LABEL, "loop",
				() => {__setY (-__count); }, XTask.WAIT, __delay,
				() => {__setY ( __count); }, XTask.WAIT, __delay,
				
				XTask.FLAGS, (__task:XTask) => {
					__count--;
						
					__task.ifTrue (__count == 0);
				}, XTask.BNE, "loop",
					
				() => {
					__setY (0);
				},
					
			XTask.RETN,
		]);
	}
		
//------------------------------------------------------------------------------------------
	public FadeOut_Script (__levelId:string=""):void {
			
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
							
						XTask.FLAGS, (__task:XTask) => {
							this.setLevelAlpha (Math.max (0.0, G.appX.getMaskAlpha () - 0.025));
								
							__task.ifTrue (G.appX.getMaskAlpha () == 0.0 && __levelId != "");
						}, XTask.BNE, "loop",
							
						() => {
							this.fireLevelSelectSignal (__levelId);
								
							this.nukeLater ();
						},
							
						XTask.GOTO, "loop",
						
					XTask.RETN,
				]);
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",	
				XTask.WAIT, 0x0100,	
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
		//------------------------------------------------------------------------------------------
	}
		
//------------------------------------------------------------------------------------------
	public FadeOutAlpha_Script (__levelId:string=""):void {
			
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
							
						XTask.FLAGS, (__task:XTask) => {
							this.alpha = Math.max (0.0, this.alpha - 0.025);
						},
							
						XTask.GOTO, "loop",
						
					XTask.RETN,
				]);
					
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",	
				XTask.WAIT, 0x0100,	
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
		//------------------------------------------------------------------------------------------
	}
		
//------------------------------------------------------------------------------------------
	public FadeIn_Script ():void {
			
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
							
						() => {
							this.setLevelAlpha (Math.min (1.0, G.appX.getMaskAlpha () + 0.05));
						},
							
						XTask.GOTO, "loop",
						
					XTask.RETN,
				]);
					
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",	
				XTask.WAIT, 0x0100,	
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}
	
	//------------------------------------------------------------------------------------------
	public getLevelProps ():any {
		return this.m_levelProps;
	}
		
	//------------------------------------------------------------------------------------------
	public setLevelProps (__levelProps:any):void {
		this.m_levelProps = __levelProps;
	}
		
	//------------------------------------------------------------------------------------------
	public addLevelSelectListener (__listener:any):number {
		return this.m_levelSelectSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public fireLevelSelectSignal (__levelId:string):void {
		this.m_levelSelectSignal.fireSignal (__levelId);
	}
		
	//------------------------------------------------------------------------------------------
	public addGameStateChangedListener (__listener:any):number {
		return this.m_gameStateChangedSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public fireGameStateChangedSignal (__gameState:number):void {
		this.m_gameStateChangedSignal.fireSignal (__gameState);
	}
		
	//------------------------------------------------------------------------------------------
	public addLeveCompleteListener (__listener:any):number {
		return this.m_levelCompleteSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public fireLevelCompleteSignal (__status:string = null):void {
		this.m_levelCompleteSignal.fireSignal (__status);
	}
		
//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
// }