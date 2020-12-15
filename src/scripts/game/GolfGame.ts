//------------------------------------------------------------------------------------------
import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js-legacy';
import { G } from '../../engine/app/G';
import { XGameObject } from '../../engine/gameobject/XGameObject';
import { XPoint } from '../../engine/geom/XPoint';
import { XSignal } from '../../engine/signals/XSignal';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XWorld } from '../../engine/sprite/XWorld';
import { XPauseManager } from '../../engine/state/XPauseManager';
import { XState } from '../../engine/state/XState';
import { XTask } from '../../engine/task/XTask';
import { XType } from '../../engine/type/XType';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { SidePanel } from '../sidepanel/SidePanel';
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { TerrainTile } from '../terrain/TerrainTile';
import { LayerUtils } from '../utils/LayerUtils';
import { BallExplosion } from './BallExplosion';
import { BallFlash } from './BallFlash';
import { ElectricBeam } from './ElectricBeam';
import { ForceVectorToo } from './ForceVectorToo';
import { GameInteractiveLayer } from './GameInteractiveLayer';
import { GolfBall } from './GolfBall';
import { GolfBallPart } from './GolfBallPart';
import { GolfGameInstance } from './GolfGameInstance';

//------------------------------------------------------------------------------------------
export class GolfGame extends XState {
	public m_gameLayersContainer:GameLayersContainer;
	public m_terrainContainer:TerrainContainer;
	public m_interactiveLayer:GameInteractiveLayer;
	public loader:PIXI.Loader;
	public m_forceVectorToo:ForceVectorToo;
	public m_sidePanel:SidePanel;
	public m_worldName:string;
	public m_terrainXML:XSimpleXMLNode;
	public m_layersXML:XSimpleXMLNode;
	public m_worldGravity:number;
	public m_worldMass:number;
	public m_score:number;
	public m_levelData:any;
	public m_realWorldName:string;

	public m_gameWonSignal:XSignal;

	public m_golfBall:GolfBall;
	public m_ballInHole:boolean;

	public script:XTask;

	public static BACKGROUND_DEPTH:number = 0.0;
	public static BACKGROUND_LAYER:number = 0;

	public static PLAYFIELD_BEHIND_DEPTH:number = 500.0;
	public static PLAYFIELD_BEHIND_LAYER:number = 0;

	public static PLATFORM_DEPTH:number = 750.0;
	public static PLATFORM_LAYER:number = 0;

	public static TERRAIN_DEPTH:number = 1000.0;
	public static TERRAIN_LAYER:number = 0;

	public static PLAYFIELD_FRONT_DEPTH:number = 1500.0;
	public static PLAYFIELD_FRONT_LAYER:number = 0;

	public static FOREGROUND_DEPTH:number = 5000.0;
	public static FOREGROUND_LAYER:number = 1;

	public static SIDEPANEL_DEPTH:number = 9999.0;
	public static SIDEPANEL_LAYER:number = 2;

	public static HUD_DEPTH:number = 5000.0;
	public static HUD_LAYER:number = 4;

	public static ACTION_READY:string = "ready";
	public static ACTION_LAUNCHED:string = "launched";
	public static ACTION_WON:string = "won";

	public m_collisionHandler:any;
	public m_collideFlag:boolean;

	public m_winFlag:boolean;

	public m_resizeListenerID:number;

	public m_attempts:number = 0;
	public m_duration:number = 0;

	public m_musicMuteListenerID:number;
	public m_sfxMuteListenerID:number;

	public m_playfieldAdjustmentScaleX:number;
	public m_playfieldAdjustmentScaleY:number;

	public m_adjustableGameObjects:Map<XGameObject, number>;

	public m_bgScaleRatio:number;

	public m_physicsData:any;

	public m_languageChangeSignal:XSignal;

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

		console.log (": GolfGame: ", this.world.getMatterEngine ().world);

		this.m_gameWonSignal = this.createXSignal ();
	
		this.loadLevel (__params);

		this.initPhysics ();

		this.m_languageChangeSignal = this.createXSignal ();

		this.m_ballInHole = false;
		this.m_winFlag = false;

		this.script = this.addEmptyTask ();

		this.setupMuteListeners ();

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (this.m_XApp.gotFirstClick ());
				}, XTask.BNE, "loop",

				() => {
					this.world.getMusicSoundManager ().playSoundFromName ("Common_Music_" + this.m_worldName + "BGM",
						1.0, 999, 0.20,
						() => {
							console.log (": BGM: start: ");
						},
						() => {
							console.log (": BGM: end: ");
						}
					);
				},

			XTask.RETN,
		]);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				/*
				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (
						this.m_XApp.getXProjectManager ().getLoadComplete ()
					);
				}, XTask.BNE, "loop",
				*/
				
				() => {
					this.startGame ();
				},

			XTask.RETN,
		]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		if (this.m_collisionHandler != null) {
			Matter.Events.off (this.world.getMatterEngine (), "collisionStart", this.m_collisionHandler);
		}

		this.m_XApp.removeWindowResizeListener (this.m_resizeListenerID);

		this.cleanupMuteListeners ();
	}

//------------------------------------------------------------------------------------------
	public startGame ():void {	
		this.adjustableGameObjectsScript ();

		this.createTerrainContainer ().deserialize (this.m_terrainXML);
		this.createGameLayersContainer ().deserialize (this.m_layersXML, this.m_terrainContainer);

		this.addStageEventListenerX ("pointerdown", this.onMouseDown.bind (this));
		// this.addStageEventListenerX ("touchstart", this.onMouseDown.bind (this));

		this.createSidePanel ();
		this.createGameSprites ();
		this.createWorldSprites ();
		this.createInteractiveLayer ();

		this.m_terrainContainer.getHoleMarker ().visible = false;
		
		this.addAdjustableGameObject (this.m_terrainContainer.getHoleArrow ());

		this.Idle_Script ();

		this.m_golfBall = this.m_terrainContainer.getGolfBall ();

		this.setupGolfBall ();

		this.createBallCollideHandler ();

		this.addTask ([
			XTask.WAIT, 0x0100,

			() => {
				this.hideBorders ()
			},

			XTask.RETN,
		]);

		this.hideBorders ();

		this.m_playfieldAdjustmentScaleX = 1.0;
		this.m_playfieldAdjustmentScaleY = 1.0;
		this.m_resizeListenerID = this.m_XApp.addWindowResizeListener (this.resize.bind (this));
		this.resize ();

		this.m_attempts = 0;

		(G.appX as GolfGameInstance).getOnStateChange () (
			{
				action: GolfGame.ACTION_READY
			}
		);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT1000, 1 * 1000,

				XTask.FLAGS, (__task:XTask) => {
					this.m_duration += 1000;
				
					(G.appX as GolfGameInstance).getOnStateChange () (
						{
							duration: this.m_duration
						}
					);

					__task.ifTrue (this.m_winFlag);
				}, XTask.BNE, "loop",

			XTask.RETN,
		]);
	}

//------------------------------------------------------------------------------------------
	public hideBorders ():void {
		if (this.m_terrainContainer.getLeftRangeBorder () != null) {
			this.m_terrainContainer.getLeftRangeBorder ().hide ();
		}

		if (this.m_terrainContainer.getRightRangeBorder () != null) {
			this.m_terrainContainer.getRightRangeBorder ().hide ();
		}

		if (this.m_terrainContainer.getBottomRangeBorder () != null) {
			this.m_terrainContainer.getBottomRangeBorder ().hide ();
		}
	}

//------------------------------------------------------------------------------------------
	public setScore (__score:number):void {
	}

//------------------------------------------------------------------------------------------
/*
    airFriction: "0.01"
    ballFriction: "0.1"
    ballMass: "1"
    ballRestitution: "0.8"
    terrainFriction: "0.1"
    terrainRestitution: "0"
    worldGravity: "9.81"
*/

//------------------------------------------------------------------------------------------
	public initPhysics ():void {
		console.log (": initPhysics: ", this.m_levelData.physics);

		this.m_physicsData = this.m_levelData.physics;
		
		/*
		this.m_physicsData = {
			airFriction: "0.01",
			ballFriction: "0.1",
			ballMass: "1",
			ballRestitution: "0.8",
			terrainFriction: "0.1",
			terrainRestitution: "0",
			worldGravity: "9.81"
		};
		*/
	}

//------------------------------------------------------------------------------------------
	public setLanguage (__language:string):void {
		this.m_languageChangeSignal.fireSignal ();

		this.m_sidePanel.updateLabels ();
	}

//------------------------------------------------------------------------------------------
	public addLanguageChangeListener (__listener:any):void {
		this.m_languageChangeSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public setPhysics (__physicsData:any):void {
		console.log (": physics data: ", __physicsData);

		this.m_physicsData = __physicsData;

		this.updatePhysics ();
	}

//------------------------------------------------------------------------------------------
	public updatePhysics ():void {
		var __physicsData:any = this.m_physicsData;

		this.world.getMatterEngine ().world.gravity.y = __physicsData.worldGravity / 9.81;

		if (this.m_golfBall != null) {
			Matter.Body.setMass (this.m_golfBall.getMatterBody (), __physicsData.ballMass * 1.2);
			this.m_golfBall.getMatterBody ().frictionAir = __physicsData.airFriction;
			this.m_golfBall.getMatterBody ().friction = __physicsData.ballFriction;
			this.m_golfBall.getMatterBody ().restitution = __physicsData.ballRestitution;		
		}
		
		if (this.m_terrainContainer != null) {
			XType.forEach (this.m_terrainContainer.getTerrainTiles (),
				(__terrainTile:TerrainTile) => {
					__terrainTile.getMatterBody ().friction = __physicsData.terrainFriction;
					__terrainTile.getMatterBody ().restitution = __physicsData.terrainRestitution;
				}
			);
		}
	}

//------------------------------------------------------------------------------------------
	public adjustableGameObjectsScript ():void {
		this.m_adjustableGameObjects = new Map<XGameObject, number> ();

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				() => {
					XType.forEach (this.m_adjustableGameObjects,
						(__gameObject:XGameObject) => {
							var __callback:any = this.m_adjustableGameObjects.get (__gameObject);

							if (__callback == null) {	
								__gameObject.scale.x = this.m_playfieldAdjustmentScaleX;
								__gameObject.scale.y = this.m_playfieldAdjustmentScaleY;
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
	public addAdjustableGameObject (__gameObject:XGameObject, __callback:any = null):void {
		this.m_adjustableGameObjects.set (__gameObject, __callback);

		__gameObject.addKillListener (() => {
			this.m_adjustableGameObjects.delete (__gameObject);
		});
	}

//------------------------------------------------------------------------------------------
	public resize ():void {
		// console.log (": GolfGame: resize: ", this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight ());

		this.m_XApp.getRenderer ().resize (this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight ());

		//------------------------------------------------------------------------------------------
		// scale the entire stage
		//------------------------------------------------------------------------------------------		
        // this.m_XApp.getStage ().scale.x = this.m_XApp.getScaleRatio ();
		// this.m_XApp.getStage ().scale.y = this.m_XApp.getScaleRatio ();

		this.m_XApp.getStage ().scale.x = 1.0;
		this.m_XApp.getStage ().scale.y = 1.0;
		
		//------------------------------------------------------------------------------------------
		var __scaleRatio = this.m_XApp.getScaleRatio ();

		//------------------------------------------------------------------------------------------
		// background
		//------------------------------------------------------------------------------------------
		this.scaleBackground ();

		//------------------------------------------------------------------------------------------
		// playfield
		//------------------------------------------------------------------------------------------
		this.scalePlayfield ();

		//------------------------------------------------------------------------------------------
		// foreground
		//------------------------------------------------------------------------------------------
		this.scaleForeground ();

		//------------------------------------------------------------------------------------------
		// sidepanel
		//------------------------------------------------------------------------------------------
		this.scaleSidePanel ();
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
	public scaleSidePanel ():void {
		var __x:number = 0;
		var __y:number = 0;

		var __scaleX:number = this.m_XApp.getCanvasWidth () / this.m_XApp.getScreenWidth ();
		var __scaleY:number = this.m_XApp.getCanvasHeight () / this.m_XApp.getScreenHeight ();

		var __scaleRatio:number = Math.max (__scaleX, __scaleY);

		__x = (this.m_XApp.getCanvasWidth () - this.m_XApp.getScreenWidth () * __scaleRatio) / 2;
		__y = (this.m_XApp.getCanvasHeight () - this.m_XApp.getScreenHeight () * __scaleRatio);
			
		this.scaleLayer (GolfGame.SIDEPANEL_LAYER, 0, __scaleRatio, 0, __scaleRatio);

		var __newSidePanelHeight:number = SidePanel.HEIGHT + __y / __scaleRatio;
		var __newScaleRatio = __newSidePanelHeight / SidePanel.HEIGHT;

		console.log (": scaleSidePanel: ", __newSidePanelHeight, SidePanel.HEIGHT);

		this.m_sidePanel.x = (SidePanel.WIDTH - SidePanel.WIDTH * __newScaleRatio) / 2;
		this.m_sidePanel.scale.x = __newScaleRatio;
		this.m_sidePanel.scale.y = __newScaleRatio;
	}

//------------------------------------------------------------------------------------------
	public scaleBackground ():void {
		var __x:number = 0;
		var __y:number = 0;

		var __scaleX:number = this.m_XApp.getCanvasWidth () / this.m_XApp.getScreenWidth ();
		var __scaleY:number = this.m_XApp.getCanvasHeight () / this.m_XApp.getScreenHeight ();

		var __scaleRatio:number = this.m_bgScaleRatio = Math.max (__scaleX, __scaleY);
			
		__x = (this.m_XApp.getCanvasWidth () - this.m_XApp.getScreenWidth () * __scaleRatio) / 2;
		__y = (this.m_XApp.getCanvasHeight () - this.m_XApp.getScreenHeight () * __scaleRatio);

		// this.scaleLayer (GolfGame.BACKGROUND_LAYER, __x, __scaleRatio, __y, __scaleRatio);
	}

//------------------------------------------------------------------------------------------
	public scaleForeground ():void {
		var __x:number = 0;
		var __y:number = 0;

		var __screenWidth:number = this.m_XApp.getScreenWidth () / GameInteractiveLayer.RES_DIVISOR;
		var __screenHeight:number = this.m_XApp.getScreenHeight () / GameInteractiveLayer.RES_DIVISOR;

		var __scaleX:number = this.m_XApp.getCanvasWidth () / __screenWidth;
		var __scaleY:number = this.m_XApp.getCanvasHeight () / __screenHeight;

		var __scaleRatio:number = Math.max (__scaleX, __scaleY);
			
		__x = (this.m_XApp.getCanvasWidth () - __screenWidth * __scaleRatio) / 2;
		__y = (this.m_XApp.getCanvasHeight () - __screenHeight * __scaleRatio);

		this.scaleLayer (GolfGame.FOREGROUND_LAYER, __x, __scaleRatio, __y, __scaleRatio);
	}

//------------------------------------------------------------------------------------------
	public scaleBackgroundX ():void {
		var __x:number = 0;
		var __y:number = 0;

		var __scaleX:number = this.m_XApp.getCanvasWidth () / this.m_XApp.getScreenWidth ();
		var __scaleY:number;
		
		if (this.m_XApp.getScreenHeight () * __scaleX < this.m_XApp.getCanvasHeight ()) {
			__scaleY = this.m_XApp.getCanvasHeight () / this.m_XApp.getScreenHeight ();
		} else {
			__scaleY = __scaleX;
		}

		__x = (this.m_XApp.getCanvasWidth () - this.m_XApp.getScreenWidth () * __scaleX) / 2;
		__y = (this.m_XApp.getCanvasHeight () - this.m_XApp.getScreenHeight () * __scaleY) / 2;

		// this.scaleLayer (GolfGame.BACKGROUND_LAYER, __x, __scaleX, __y, __scaleY);
	}

//------------------------------------------------------------------------------------------
	public scalePlayfield ():void {
		var __x:number = 0;
		var __y:number = 0;

		// l.width = v.width; // fill
		var __scaleX:number = (this.m_XApp.getCanvasWidth () - SidePanel.WIDTH * this.m_bgScaleRatio) / (this.m_XApp.getScreenWidth () - SidePanel.WIDTH);
		// l.height = l.width * (o.height / o.width);

		// var __scaleY:number = this.m_XApp.getScreenHeight () / this.m_XApp.getScreenWidth ();
		// __scaleY *= 1 + SidePanel.WIDTH / this.m_XApp.getScreenWidth ();
		var __scaleY:number = this.m_XApp.getCanvasHeight () / this.m_XApp.getScreenHeight ();

		// l.y = v.height - l.height; // anchor
		__y = this.m_XApp.getCanvasHeight () - this.m_XApp.getScreenHeight () * __scaleY;

		this.m_playfieldAdjustmentScaleX = 1.0;
		this.m_playfieldAdjustmentScaleY = __scaleX / __scaleY;

		if (__scaleX / __scaleY > 1.25) {
			this.m_playfieldAdjustmentScaleX = 1.25 * __scaleY / __scaleX;
			this.m_playfieldAdjustmentScaleY = 1.25;
		}

		__x = -SidePanel.WIDTH * __scaleX + SidePanel.WIDTH * this.m_bgScaleRatio;

		console.log (": scalePlayfield: ", __x);

		this.scaleLayer (GolfGame.PLAYFIELD_BEHIND_LAYER, __x, __scaleX, __y, __scaleY);
		this.scaleLayer (GolfGame.PLATFORM_LAYER, __x, __scaleX, __y, __scaleY);
		this.scaleLayer (GolfGame.TERRAIN_LAYER, __x, __scaleX, __y, __scaleY);
		this.scaleLayer (GolfGame.PLAYFIELD_FRONT_LAYER, __x, __scaleX, __y, __scaleY);
	
		// this.m_sidePanel.alpha = 0.50;
	}

//------------------------------------------------------------------------------------------
	public setupMuteListeners ():void {
        this.m_musicMuteListenerID = XPauseManager.addMuteMusicListener ((__mute:boolean) => {
			// console.log (": GolfGame: mute music: ", __mute);

            this.world.getMusicSoundManager ().mute (__mute);
		});

        this.m_sfxMuteListenerID = XPauseManager.addMuteSFXListener ((__mute:boolean) => {
			// console.log (": GolfGame: mute sfx: ", __mute);

            this.world.getSFXSoundManager ().mute (__mute);
        });
	}

//------------------------------------------------------------------------------------------
	public cleanupMuteListeners ():void {
		XPauseManager.removeMuteMusicListener (this.m_musicMuteListenerID);
		XPauseManager.removeMuteSFXListener (this.m_sfxMuteListenerID);
	}

//------------------------------------------------------------------------------------------
	public createBallCollideHandler ():void {
		this.m_collideFlag = false;

		Matter.Events.on (this.world.getMatterEngine (), "collisionStart", this.m_collisionHandler = (event:any):void => {
			event.pairs.forEach ((collision:any) => {
				// console.log (": collisionStart: ", collision);
	
				if (this.m_golfBall.getSpeed () >= 0.50 && !this.m_winFlag) {
					this.m_collideFlag = true;
				}
			});
		});

		var __guid:number;

		var __prevAngle:number = 0;

		var __getAngle = ():number => {
			return Math.abs (this.m_golfBall.getAngle () * 180 / Math.PI) % 360;

			// return Math.abs (this.m_golfBall.getMatterBody ().angle * 180 / Math.PI) % 360;
		};

		var __angles:Array<number> = new Array<number> ();

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__angles.push (__getAngle ());

					if (__angles.length > 2) {
						__prevAngle = __angles.unshift ();
					}

					__task.ifTrue (this.m_collideFlag);
				}, XTask.BNE, "loop",

				XTask.WAIT, 0x0400,

				() => {
					var __delta:number = Math.abs ((__prevAngle % 360) - __getAngle ());

					// console.log (": collide angle diff: ", __delta);

					this.m_collideFlag = false;

					if (__delta > 45) {
						__guid = this.world.getSFXSoundManager ().playSoundFromName (
							"Common_Sound_BallHitTerrain" + (Math.floor (Math.random () * 4) + 1),
							1.0, 0, 1.0,
							() => {},
							() => {
								// console.log (": end: terrain: ");
							}
						);
					}
				},

				XTask.WAIT1000, 0.33 * 1000,

				XTask.GOTO, "loop",

			XTask.RETN,
		])
	}

//------------------------------------------------------------------------------------------
	public setupGolfBall ():void {
		this.world.getSFXSoundManager ().playSoundFromName ("Common_Sound_BallReappears");

		this.addAdjustableGameObject (this.m_golfBall);

		// console.log (": GolfBall: density, mass: ", this.m_golfBall.getMatterBody ().density, this.m_golfBall.getMatterBody ().mass);

		Matter.Body.setMass (this.m_golfBall.getMatterBody (), this.m_worldMass * 1.2);

		this.updatePhysics ();
		
		this.m_golfBall.addBallInHoleListener (() => {
			// console.log (": ball in hole: ");

			var __ballHoleFlash:BallFlash = this.m_terrainContainer.addGameObjectAsChild (BallFlash, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as BallFlash;
			__ballHoleFlash.afterSetup ([this.m_terrainContainer, "Common_Sprites_BallHoleFlash"]);
			__ballHoleFlash.x = this.m_terrainContainer.getHoleMarker ().x;
			__ballHoleFlash.y = this.m_terrainContainer.getHoleMarker ().y;
			this.addAdjustableGameObject (__ballHoleFlash, () => {
				__ballHoleFlash.adjustScale (this.m_playfieldAdjustmentScaleX, this.m_playfieldAdjustmentScaleY);
			});

			this.m_ballInHole = true;
		});

		this.m_golfBall.setSpeed (0);

		this.m_golfBall.addBallOutrgListener (() => {
			// console.log (": ball outrg: ");

			var __ballHoleFlash:BallFlash = this.m_terrainContainer.addGameObjectAsChild (BallFlash, GolfGame.PLAYFIELD_FRONT_LAYER, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as BallFlash;
			__ballHoleFlash.afterSetup ([this.m_terrainContainer, "Common_Sprites_BallBorderFlash"]);
			__ballHoleFlash.x = this.m_golfBall.x;
			__ballHoleFlash.y = this.m_golfBall.y;
			this.addAdjustableGameObject (__ballHoleFlash, () => {
				__ballHoleFlash.adjustScale (this.m_playfieldAdjustmentScaleX, this.m_playfieldAdjustmentScaleY);
			});

			this.world.getSFXSoundManager ().playSoundFromName ("Common_Sound_OffScreen");

			this.m_golfBall = this.m_terrainContainer.createGolfBall ();

			this.setupGolfBall ();
		});
	}

//------------------------------------------------------------------------------------------
	public loadLevel (__params:Array<any>):void {
		this.m_worldName = __params[0];
		this.m_layersXML = __params[1];
		this.m_terrainXML = __params[2];
		this.m_levelData = __params[3];
		this.m_score = __params[4];

		this.m_worldGravity = this.m_levelData.gravity;
		this.m_worldMass = this.m_levelData.mass;
		this.m_realWorldName = this.m_levelData.title;

		this.world.getMatterEngine ().world.gravity.y = this.m_worldGravity / 9.8;
		this.world.getMatterEngine ().positionIterations = 20.0;
		this.world.getMatterEngine ().velocityIterations = 20.0;
	}

//------------------------------------------------------------------------------------------
	public getLayersXML ():XSimpleXMLNode {
		return this.m_layersXML;
	}

//------------------------------------------------------------------------------------------
	public getTerrainXML ():XSimpleXMLNode {
		return this.m_terrainXML;
	}

//------------------------------------------------------------------------------------------
	public createGameSprites ():void {
	}

//------------------------------------------------------------------------------------------
	public createWorldSprites ():void {
	}

//------------------------------------------------------------------------------------------
	public createSidePanel ():void {
        this.createBitmapFont (
            "SidePanelLabelFont",
            {
				fontFamily: "Nunito",
				fontSize: 40,
				strokeThickness: 0,
				fill: "white",          
            },
            {chars: this.getBitmapFontChars ()}
		);
		
        this.createBitmapFont (
            "SidePanelSmallLabelFont",
            {
				fontFamily: "Nunito",
				fontSize: 28,
				strokeThickness: 0,
				fill: "white",          
            },
            {chars: this.getBitmapFontChars ()}
        );

		this.m_sidePanel = this.addGameObjectAsChild (SidePanel, GolfGame.SIDEPANEL_LAYER, GolfGame.SIDEPANEL_DEPTH, true) as SidePanel;
		this.m_sidePanel.afterSetup ([this.m_worldName, this.m_realWorldName, this.m_worldGravity, this.m_worldMass, this.m_score]);

		this.m_sidePanel.x = 0;
		this.m_sidePanel.y = 0;

		// this.m_sidePanel.alpha = 0.66;

		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0x000000);
		__graphics.drawRect (0, 0, SidePanel.WIDTH, SidePanel.HEIGHT);
		__graphics.endFill ();
		this.addSpriteAsChild (__graphics, 0, 0, GolfGame.SIDEPANEL_LAYER, GolfGame.SIDEPANEL_DEPTH - 1, true);
		
		/*
		var __layer:XSpriteLayer = this.world.getLayer (GolfGame.SIDEPANEL_LAYER);
		__layer.addSprite (__graphics, 0, true);
		*/
	}

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionEvent) {
		if (this.m_ballInHole || this.m_golfBall.getSpeed () > 0.33) {
			return;
		}

		this.m_golfBall.removeReticle ();

		var __interactionData:PIXI.InteractionData = e.data;

		this.m_forceVectorToo = this.m_interactiveLayer.addGameObjectAsChild (ForceVectorToo, GolfGame.FOREGROUND_LAYER, GolfGame.FOREGROUND_DEPTH, true) as ForceVectorToo;
		this.m_forceVectorToo.afterSetup ([this.m_interactiveLayer]);

		this.m_forceVectorToo.x = __interactionData.getLocalPosition (this.m_interactiveLayer).x;
		this.m_forceVectorToo.y = __interactionData.getLocalPosition (this.m_interactiveLayer).y;

		this.m_forceVectorToo.addUpdateListener ((__dist:number) => {
			// console.log (": update: ", __dist);

			this.m_sidePanel.setForce (__dist);
		});

		this.m_forceVectorToo.addFiredListener ((__dx:number, __dy:number) => {
			// console.log (": fired: ", __dx, __dy);

			this.m_terrainContainer.getGolfBall ().shootBall (__dx, __dy);

			this.Launched_Script ();

			this.m_attempts++;

			(G.appX as GolfGameInstance).getOnStateChange () (
				{
					attempts: this.m_attempts,
					action: GolfGame.ACTION_LAUNCHED
				}
			);
		});
	}

//------------------------------------------------------------------------------------------
	public createInteractiveLayer ():void {
		this.m_interactiveLayer = this.addGameObjectAsChild (GameInteractiveLayer, GolfGame.FOREGROUND_LAYER, GolfGame.FOREGROUND_DEPTH) as GameInteractiveLayer;
		this.m_interactiveLayer.afterSetup ([]);
		this.m_interactiveLayer.x = 0;
		this.m_interactiveLayer.y = 0;
	}

//------------------------------------------------------------------------------------------
	public createGameLayersContainer ():GameLayersContainer {
		this.m_gameLayersContainer = this.addGameObjectAsChild (GameLayersContainer, 0, 0.0) as GameLayersContainer;
		this.m_gameLayersContainer.afterSetup ();
		this.m_gameLayersContainer.x = 0;
		this.m_gameLayersContainer.y = 0;

		return this.m_gameLayersContainer;
	}

//------------------------------------------------------------------------------------------
	public createTerrainContainer ():TerrainContainer {
		this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, GolfGame.TERRAIN_LAYER, GolfGame.TERRAIN_DEPTH) as TerrainContainer;
		this.m_terrainContainer.afterSetup ([this.m_worldName, false]);
		this.m_terrainContainer.x = 0;
		this.m_terrainContainer.y = 0;

		return this.m_terrainContainer;
	}

	//------------------------------------------------------------------------------------------
	public Idle_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
						() => {
							if (this.m_ballInHole) {
								this.Win_Script ();
							}
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
	public Launched_Script ():void {
		this.m_golfBall.setSpeed (999.0);

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
						() => {
							if (this.m_ballInHole) {
								this.Win_Script ();
							}
						},

					    XTask.GOTO, "loop",
						
					XTask.RETN,
				]);	

				this.script.addTask ([	
					XTask.WAIT1000, 0.50 * 1000,
					
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
						() => {
							if (this.m_golfBall.getSpeed () < 0.33) {
								// this.m_golfBall.createReticle ();

								if (this.m_terrainContainer.pointInTerrainTile (this.m_golfBall.x, this.m_golfBall.y)) {
									this.m_golfBall.fireOutrgSignal ();
								} else {
									this.Idle_Script ();
								}
							}
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
	public Win_Script ():void {	
		var __finished:boolean= false;
		var __electricBeam:ElectricBeam;

		this.m_winFlag = true;

		this.script.gotoTask ([
			() => {
				this.world.getSFXSoundManager ().playSoundFromName ("Common_Sound_BallExplosion");
			},

			XTask.WAIT1000, 0.75 * 1000,

			() => {
				var __point:XPoint = this.m_terrainContainer.getHoleArrow ().getBasePos ();

				__electricBeam = this.m_terrainContainer.addGameObjectAsChild (ElectricBeam, GolfGame.PLAYFIELD_BEHIND_LAYER, GolfGame.PLAYFIELD_BEHIND_DEPTH, true) as ElectricBeam;
				__electricBeam.afterSetup ([this.m_terrainContainer]);
				__electricBeam.x = __point.x;
				__electricBeam.y = __point.y + 16;
				
				// console.log (": hole arrow: pos: ", __point.x, __point.y);
			},

			XTask.WAIT1000, 0.66 * 1000,

			() => {
				this.m_golfBall.Flash_Script (() => {
					__finished = true;

					__electricBeam.fadeOut ();
				});
			},

			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
					    XTask.GOTO, "loop",
						
					XTask.RETN,
				]);	

				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (__finished);
						}, XTask.BNE, "loop",

						() => {
							this.Boom_Script ();
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
	public Boom_Script ():void {

		var __golfBallPart:GolfBallPart;

		var i:number;

		var __arrayPoints:Array<any> = [
			{x: -4, y: -4},
			{x: 4, y: -4},
			{x: 4, y: 4},
			{x: -4, y: 4},
			{x: -4, y: 0}
		];

		for (i=0; i<5; i++) {
			__golfBallPart = this.m_terrainContainer.addPooledGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				__arrayPoints[i].x * Math.random () * 2, __arrayPoints[i].y * Math.random () * 2,
				i
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		for (i=0; i<5; i++) {
			__golfBallPart = this.m_terrainContainer.addPooledGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				Math.random () * 6 - 3, Math.random () * 6 - 3,
				Math.floor (Math.random () * 5)
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		for (i=0; i<3; i++) {
			__golfBallPart = this.m_terrainContainer.addPooledGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				Math.random () * 12 - 6, Math.random () * 12 - 6,
				Math.floor (Math.random () * 5)
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		for (i=0; i<2; i++) {
			__golfBallPart = this.m_terrainContainer.addPooledGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				Math.random () * 16 - 8, Math.random () * 16 - 8,
				Math.floor (Math.random () * 5)
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		var __ballExplosion:BallExplosion = this.m_terrainContainer.addPooledGameObjectAsChild (BallExplosion, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as BallExplosion;
		__ballExplosion.afterSetup ([this.m_terrainContainer]);
		__ballExplosion.x = this.m_golfBall.x;
		__ballExplosion.y = this.m_golfBall.y;
		this.addAdjustableGameObject (__ballExplosion);

		LayerUtils.addShake ((__dx:number) => {
			this.x = __dx;
		}, 32);

		LayerUtils.addShake ((__dy:number) => {
			this.y = __dy;
		}, 32);

		this.m_terrainContainer.setPropagateCount (-1);
		
		//------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 4 * 1000,

					() => {
						(G.appX as GolfGameInstance).getOnStateChange () (
							{
								action: GolfGame.ACTION_WON
							}
						);
					},
						
					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					() => {
					},

				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}

	//------------------------------------------------------------------------------------------
	public Outrg_Script ():void {

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,
						
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
}