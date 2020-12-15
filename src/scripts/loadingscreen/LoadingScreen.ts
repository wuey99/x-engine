//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { GolfGame } from '../game/GolfGame';
import { BouncyBall } from './BouncyBall';
import { ProgressBar } from './ProgressBar';

//------------------------------------------------------------------------------------------
export class LoadingScreen extends XState {
	public m_worldName:string;
	public m_terrainNum:string;
	public m_levelData:any;
	public m_onStateChange:any;
	public m_score:number;
	public m_terrainXML:XSimpleXMLNode;
	public m_layersXML:XSimpleXMLNode;
	public script:XTask;
	public m_graphics:PIXI.Graphics;
	public m_progressBarWidth:number;
	public m_progressBarHeight:number;

	public static BG_COLOR:number = 0xc0a0ff;
	public static PROGRESSBAR_COLOR:number = 0x000000;

	public m_resizeListenerID:number;

	public m_bouncyBall:BouncyBall;

	public m_progressBar:ProgressBar;
	public m_progressBarX:number;
	public m_progressBarY:number;

//------------------------------------------------------------------------------------------	
	constructor () {
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
		
		this.m_onStateChange = __params[0];
		this.m_worldName = __params[1];
		this.m_terrainNum = __params[2];
		this.m_layersXML = __params[3];
		this.m_terrainXML = __params[4];
		this.m_levelData = __params[5];
		this.m_score = __params[6]

		this.script = this.addEmptyTask ();

		var __graphics:PIXI.Graphics = this.m_graphics = new PIXI.Graphics ();
		/*
		__graphics.beginFill (LoadingScreen.BG_COLOR);
		__graphics.drawRect (0, 0, this.m_XApp.getScreenWidth (), this.m_XApp.getScreenHeight ());
		__graphics.endFill ();
		*/
		this.addSpriteAsChild (__graphics, 0, 0, GolfGame.HUD_LAYER, GolfGame.HUD_DEPTH, true);
		__graphics.x = 0;
		__graphics.y = 0;

		this.setupProgressBar ();
		this.drawProgressBarOutline ();

		this.Init_Script ();

		this.m_resizeListenerID = this.m_XApp.addWindowResizeListener (this.resize.bind (this));
		this.resize ();

		return this;
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		this.m_XApp.removeWindowResizeListener (this.m_resizeListenerID);
	}

//------------------------------------------------------------------------------------------
	public resize ():void {
		// console.log (": GolfGame: resize: ", this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight ());

		this.m_XApp.getRenderer ().resize (this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight ());

		//------------------------------------------------------------------------------------------
		// scale the entire stage
		//------------------------------------------------------------------------------------------		
		var __x:number = 0;
		var __y:number = 0;

		var __scaleX:number = this.m_XApp.getCanvasWidth () / this.m_XApp.getScreenWidth ();
		var __scaleY:number = this.m_XApp.getCanvasHeight () / this.m_XApp.getScreenHeight ();

		var __scaleRatio:number = Math.max (__scaleX, __scaleY);
			
		__x = (this.m_XApp.getCanvasWidth () - this.m_XApp.getScreenWidth () * __scaleRatio) / 2;
		__y = (this.m_XApp.getCanvasHeight () - this.m_XApp.getScreenHeight () * __scaleRatio) / 2;

		this.scaleLayer (GolfGame.HUD_LAYER, __x, __scaleRatio, __y, __scaleRatio);
	}

	//------------------------------------------------------------------------------------------
	public scaleLayer (__layerNum:number, __x:number, __scaleX:number, __y:number, __scaleY:number):void {
		var __layer:XSpriteLayer = this.world.getLayer (__layerNum);

		__layer.x = __x;
		__layer.y = __y;
		__layer.scale.x = __scaleX;
		__layer.scale.y = __scaleY;
	}

	//------------------------------------------------------------------------------------------
	public setupProgressBar ():void {
		this.m_progressBarWidth = this.m_XApp.getScreenWidth () * 0.33;
		this.m_progressBarHeight = 64;
	}

	//------------------------------------------------------------------------------------------
	public drawProgressBarOutline ():void {
		var __x:number = this.m_progressBarX = (this.m_XApp.getScreenWidth () - this.m_progressBarWidth) / 2;
		var __y:number = this.m_progressBarY = (this.m_XApp.getScreenHeight () - this.m_progressBarHeight) / 2;

		var __thickness:number = 6.0;

		this.m_graphics.lineStyle (__thickness, LoadingScreen.PROGRESSBAR_COLOR);
		this.m_graphics.moveTo (__x - __thickness, __y - __thickness);
		this.m_graphics.lineTo (__x - __thickness + this.m_progressBarWidth + __thickness*2, __y - __thickness);
		this.m_graphics.lineTo (__x - __thickness + this.m_progressBarWidth + __thickness*2, __y - __thickness + this.m_progressBarHeight + __thickness*2);
		this.m_graphics.lineTo (__x - __thickness, __y - __thickness + this.m_progressBarHeight + __thickness*2);
		this.m_graphics.lineTo (__x - __thickness, __y - __thickness);
	}

	//------------------------------------------------------------------------------------------
	public updateProgressBar (__percentage:number):void {
		this.m_progressBar.scale.x = __percentage / 8 * (this.m_progressBarWidth + 6);
	}
	
	//------------------------------------------------------------------------------------------
	public createObjects ():void {
		this.m_bouncyBall = this.addGameObjectAsChild (BouncyBall, GolfGame.HUD_LAYER, GolfGame.HUD_DEPTH + 1.0) as BouncyBall;
		this.m_bouncyBall.afterSetup ([]);

		this.m_bouncyBall.x = this.m_progressBarX;
		this.m_bouncyBall.y = this.m_progressBarY - 24.0;

		this.m_progressBar = this.addGameObjectAsChild (ProgressBar, GolfGame.HUD_LAYER, GolfGame.HUD_DEPTH + 2.0) as ProgressBar;
		this.m_progressBar.afterSetup ([]);

		this.m_progressBar.x = this.m_progressBarX - 3;
		this.m_progressBar.y = this.m_progressBarY - 3;
		this.m_progressBar.scale.y =  70/64;
	}

	//------------------------------------------------------------------------------------------
	public Init_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					() => {
						this.m_XApp.getXProjectManager ().startResourceManagersByName (["Preload"]);
					},
		
					XTask.LABEL, "waitPreloadAssets",
						XTask.WAIT, 0x0100,
		
						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (
								this.m_XApp.getXProjectManager ().getLoadCompleteByGroups (["Preload"])
							);
						}, XTask.BNE, "waitPreloadAssets",
						
					() => {
						this.Preloader_Script ();
					},

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
	public Preloader_Script ():void {
		this.createObjects ();

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					() => {
						this.m_XApp.getXProjectManager ().startResourceManagersByName (["default", "Common", this.m_worldName]);
					},
		
					XTask.LABEL, "waitLevelAssets",
						XTask.WAIT, 0x0100,
		
						XTask.FLAGS, (__task:XTask) => {
							this.m_bouncyBall.setTargetX (this.m_progressBarX + this.getLoadedFiles () / this.getTotalFiles () * this.m_progressBarWidth - 42/2);

							this.updateProgressBar (this.getLoadedFiles () / this.getTotalFiles ());

							__task.ifTrue (
								this.m_XApp.getXProjectManager ().getLoadCompleteByGroups (["Common", this.m_worldName])
							);
						}, XTask.BNE, "waitLevelAssets",

					XTask.WAIT1000, 2 * 1000,

					() => {
						this.Start_Script ();
					},

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
	public getLoadedFiles ():number {
		var __loadedFiles:number = 0;

		__loadedFiles += this.m_XApp.getXProjectManager ().getResourceManagerByName ("Common").getLoadedFiles ();
		__loadedFiles += this.m_XApp.getXProjectManager ().getResourceManagerByName (this.m_worldName).getLoadedFiles ();

		return __loadedFiles;
	}

	//------------------------------------------------------------------------------------------
	public getTotalFiles ():number {
		var __totalFiles:number = 0;

		__totalFiles += this.m_XApp.getXProjectManager ().getResourceManagerByName ("Common").getTotalFiles ();
		__totalFiles += this.m_XApp.getXProjectManager ().getResourceManagerByName (this.m_worldName).getTotalFiles ();

		return __totalFiles;
	}

	//------------------------------------------------------------------------------------------
	public Start_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					() => {
						this.m_XApp.getXProjectManager ().startAllResourceManagers ();

						this.getGameInstance ().gotoState (this.m_worldName + "Level", 
							[
								this.m_worldName,
								this.m_layersXML,
								this.m_terrainXML,
								this.m_levelData,
								this.m_score
							]
						)
					},

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
}