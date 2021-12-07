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
	import * as PIXI from 'pixi.js-legacy';
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
			
		var __xml:XSimpleXMLNode = __params[0]
			
		this.createModelFromXMLReadOnly (__xml, true);
			
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
				/* TODO
					this.m_layerView[i+0] = cast xxx.getXLogicManager ().initXLogicObject (
						// parent
						this,
						// logicObject
						cast new XMapLayerView (),
						// item, layer, depth
						null, 0, 1000,
						// x, y, z
						0, 0, 0,
						// scale, rotation
						1.0, 0,
						[
							// XMapView
							this,
							// XMapModel
							m_XMapModel,
							// layer
							i + 0,
							// logicClassNameToClass
							GX.appX.logicClassNameToClass
						]
					);
					
					addXLogicObject (m_layerView[i+0]);
				*/

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
					G.appX.logicClassNameToClass
				]);

				/* TODO
					m_layerView[i+1] = cast xxx.getXLogicManager ().initXLogicObject (
						// parent
						this,
						// logicObject
						cast new XMapLayerCachedView (),
						// item, layer, depth
						null, 0, 1000,
						// x, y, z
						0, 0, 0,
						// scale, rotation
						1.0, 0,
						[
							// XMapView
							this,
							// XMapModel
							m_XMapModel,
							// layer
							i + 1
						]
					);
					
					addXLogicObject (m_layerView[i+1]);	
				*/

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

				i += 2;
			}
			
			var __graphics:PIXI.Graphics = new PIXI.Graphics ();
			__graphics.beginFill (0xffa0a0);
			__graphics.drawRect (0, 0, this.world.getViewRect ().width, this.world.getViewRect ().height);
			__graphics.endFill ()

			this.addSpriteAsChild (__graphics, 0, 0, 0, 0.0, true);

			this.show ();
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
		public scrollTo (__layer:number, __x:number, __y:number):void {
			this.m_layerPos[__layer].x = __x / 2;
			this.m_layerPos[__layer].y = __y / 2;
		}

//------------------------------------------------------------------------------------------
		public updateScroll ():void {
			var i:number;
			
			for (i = 0; i < this.m_maxLayers; i++) {
				this.m_layerPos[i].copy2 (this.m_layerScroll[i]);
				
				this.m_layerScroll[i].x += this.m_layerShake[i].x;
				this.m_layerScroll[i].y += this. m_layerShake[i].y;
				
				this.world.getXWorldLayer (i).setPos (this.m_layerScroll[i]);
			}
		}
		
//------------------------------------------------------------------------------------------
		public updateFromXMapModel ():void {
			var i:number;
			
			for (i = 0; i < this.m_maxLayers; i++) {
				this.m_layerView[i].updateFromXMapModel ();
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
				
				this.m_layerView[i].updateFromXMapModelAtRect (this.m_viewRect);
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
		public addXShake (__count:number=15, __delayValue:number=0x0100):void {
			var __setX =  (__dy:number) => {
				var i:number;
				
				for (i = 0; i < this.m_maxLayers; i++) {
					this.m_layerShake[i].x = __dy;
					this.m_layerShake[i].y = __dy;
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
					this.m_layerShake[i].x = __dy;
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