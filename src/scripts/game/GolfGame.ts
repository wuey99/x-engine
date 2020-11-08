//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js'
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
import { XDepthSprite} from '../../engine/sprite/XDepthSprite';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { TerrainContainer } from '../terrain/TerrainContainer';
import { XState } from '../../engine/state/XState';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import { ForceVector } from './ForceVector';
import { GolfBall } from './GolfBall';
import * as Matter from 'matter-js';
import {Howl, Howler} from 'howler';
import { SidePanel } from '../sidepanel/SidePanel';
import { GameLayersContainer } from '../terrain/GameLayersContainer';
import { XSoundSubManager } from '../../engine/sound/XSoundSubManager';
import { XPoint } from '../../engine/geom/XPoint';
import { ElectricBeam } from './ElectricBeam';
import { GolfBallPart } from './GolfBallPart';
import { BallExplosion } from './BallExplosion';
import { RangeBorder } from './RangeBorder';
import { BallFlash } from './BallFlash';
import { LayerUtils } from '../utils/LayerUtils';

//------------------------------------------------------------------------------------------
export class GolfGame extends XState {
	public m_gameLayersContainer:GameLayersContainer;
	public m_terrainContainer:TerrainContainer;
	public m_loadTerrainComplete:boolean;
	public m_loadLayersComplete:boolean;
	public loader:PIXI.Loader;
	public m_forceVector:ForceVector;
	public m_sidePanel:SidePanel;
	public m_worldName:string;
	public m_terrain:string;
	public m_terrainXML:XSimpleXMLNode;
	public m_layersXML:XSimpleXMLNode;

	public m_gameWonSignal:XSignal;

	public m_golfBall:GolfBall;
	public m_ballInHole:boolean;

	public script:XTask;

	public static BACKGROUND_DEPTH:number = 0.0;
	public static PLATFORM_DEPTH:number = 500.0;
	public static PLAYFIELD_BEHIND_DEPTH:number = 750.0;
	public static TERRAIN_DEPTH:number = 1000.0;
	public static PLAYFIELD_FRONT_DEPTH:number = 1500.0;
	public static FOREGROUND_DEPTH:number = 5000.0;

	public m_collisionHandler:any;
	public m_collideFlag:boolean;

	public m_ballSpeed:number;
	public m_ballAngle:number;

	public m_winFlag:Boolean;

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

		console.log (": GolfGame: ");

		this.m_gameWonSignal = this.createXSignal ();
	
		this.loadLevel (__params);

		this.m_ballInHole = false;
		this.m_winFlag = false;
		this.m_ballSpeed = 0;
		this.m_ballAngle = 0;

		this.script = this.addEmptyTask ();

		this.world.getSoundSubManager ().playSoundFromName ("Common_Music_EarthBGM",
			1.0, 999, 0.20,
			() => {},
			() => {
				console.log (": ball in hole: end: ");
			}
		);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (
						this.m_loadTerrainComplete &&
						this.m_loadLayersComplete &&
						this.m_XApp.getXProjectManager ().getResourceManager ().getLoadComplete ()
					);
				}, XTask.BNE, "loop",

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
	}

//------------------------------------------------------------------------------------------
	public startGame ():void {
		this.createTerrainContainer ().deserialize (this.m_terrainXML);
		this.createGameLayersContainer ().deserialize (this.m_layersXML, this.m_terrainContainer);

		this.addStageEventListenerX ("mousedown", this.onMouseDown.bind (this));

		this.createSidePanel ();
		this.createWorldSprites ();

		this.m_terrainContainer.getHoleMarker ().visible = false;

		this.Idle_Script ();

		this.m_golfBall = this.m_terrainContainer.getGolfBall ();

		this.setupGolfBall ();

		this.createBallCollideHandler ();

		this.calculateBallSpeed ();
	}

//------------------------------------------------------------------------------------------
	public calculateBallSpeed ():void {
		var __prevX:number = this.m_golfBall.x;
		var __prevY:number = this.m_golfBall.y;

		var __aggregateDistance:number = 0;
		var __ticks:number = 0;

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				() => {
					var __dx:number = this.m_golfBall.x - __prevX;
					var __dy:number = this.m_golfBall.y - __prevY;

					__aggregateDistance += Math.sqrt (__dx * __dx + __dy * __dy);
					__ticks++;

					__prevX = this.m_golfBall.x;
					__prevY = this.m_golfBall.y;

					this.m_ballAngle = Math.atan2 (__dy, __dx);

					this.m_golfBall.setAngle ((this.m_ballAngle * 180 / Math.PI + 90.0) % 360);
				},

				XTask.GOTO, "loop",

			XTask.RETN,
		]);

		this.addTask ([
			XTask.LABEL, "loop",
				() => {
					__aggregateDistance = 0;
					__ticks = 0;
				},

				XTask.WAIT1000, 0.50 * 1000,

				() => {
					this.m_ballSpeed = __aggregateDistance / __ticks;
					
					this.m_golfBall.setSpeed (this.m_ballSpeed);
				},

				XTask.GOTO, "loop",

			XTask.RETN,
		]);
	}

//------------------------------------------------------------------------------------------
	public createBallCollideHandler ():void {
		this.m_collideFlag = false;

		Matter.Events.on (this.world.getMatterEngine (), "collisionStart", this.m_collisionHandler = (event:any):void => {
			event.pairs.forEach ((collision:any) => {
				// console.log (": collisionStart: ", collision);
	
				if (this.m_ballSpeed >= 0.50 && !this.m_winFlag) {
					this.m_collideFlag = true;
				}
			});
		});

		var __guid:number;

		var __prevAngle:number = 0;

		var __getAngle = ():number => {
			return Math.abs (this.m_ballAngle * 180 / Math.PI) % 360;

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

					console.log (": collide angle diff: ", __delta);

					this.m_collideFlag = false;

					if (__delta > 45) {
						__guid = this.world.getSoundSubManager ().playSoundFromName (
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
		this.world.getSoundSubManager ().playSoundFromName ("Common_Sound_BallReappears");

		this.m_ballSpeed = 0;

		this.m_golfBall.addBallInHoleListener (() => {
			console.log (": ball in hole: ");

			var __ballHoleFlash:BallFlash = this.m_terrainContainer.addGameObjectAsChild (BallFlash, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as BallFlash;
			__ballHoleFlash.afterSetup ([this.m_terrainContainer, "Common_Sprites_BallHoleFlash"]);
			__ballHoleFlash.x = this.m_terrainContainer.getHoleMarker ().x;
			__ballHoleFlash.y = this.m_terrainContainer.getHoleMarker ().y;

			this.m_ballInHole = true;
		});

		this.m_golfBall.addBallOutrgListener (() => {
			console.log (": ball outrg: ");

			var __ballHoleFlash:BallFlash = this.m_terrainContainer.addGameObjectAsChild (BallFlash, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as BallFlash;
			__ballHoleFlash.afterSetup ([this.m_terrainContainer, "Common_Sprites_BallBorderFlash"]);
			__ballHoleFlash.x = this.m_golfBall.x;
			__ballHoleFlash.y = this.m_golfBall.y;

			this.world.getSoundSubManager ().playSoundFromName ("Common_Sound_OffScreen");

			this.m_golfBall = this.m_terrainContainer.createGolfBall ();

			this.setupGolfBall ();
		});
	}

//------------------------------------------------------------------------------------------
	public loadLevel (__params:Array<any>):void {
		this.m_worldName = __params[0];
		this.m_layersXML = __params[1];
		this.m_terrainXML = __params[2];

		this.m_loadTerrainComplete = true;
		this.m_loadLayersComplete = true;
	}

//------------------------------------------------------------------------------------------
	public createWorldSprites ():void {
		var __rangeBorderLeft:RangeBorder = this.m_terrainContainer.addGameObjectAsChild (RangeBorder, 0, 999999.0, false) as RangeBorder;
		__rangeBorderLeft.afterSetup ([this.m_terrainContainer, -256, +16]);
		__rangeBorderLeft.x = 384;
		__rangeBorderLeft.y = 1090;

		var __rangeBorderRight:RangeBorder = this.m_terrainContainer.addGameObjectAsChild (RangeBorder, 0, 999999.0, false) as RangeBorder;
		__rangeBorderRight.afterSetup ([this.m_terrainContainer, -16, +256]);
		__rangeBorderRight.x = 2700;
		__rangeBorderRight.y = 1090;
	}

//------------------------------------------------------------------------------------------
	public createSidePanel ():void {
        PIXI.BitmapFont.from ("SidePanelLabelFont", {
			fontFamily: "Arial",
			fontSize: 40,
			strokeThickness: 0,
			fill: "white"
		});
	   
        PIXI.BitmapFont.from ("SidePanelSmallLabelFont", {
			fontFamily: "Arial",
			fontSize: 28,
			strokeThickness: 0,
			fill: "white"
		});

		this.m_sidePanel = this.addGameObjectAsChild (SidePanel, this.getLayer (), this.getDepth () + 1000.0, true) as SidePanel;
		this.m_sidePanel.afterSetup ([this.m_worldName]);

		this.m_sidePanel.x = 0;
		this.m_sidePanel.y = 0;
	}

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionEvent) {
		if (this.m_ballInHole || this.m_ballSpeed > 0.33) {
			return;
		}

		this.m_golfBall.removeReticle ();

		var __interactionData:PIXI.InteractionData = e.data;

		this.m_forceVector = this.m_terrainContainer.addGameObjectAsChild (ForceVector, 0, 0.0, true) as ForceVector;
		this.m_forceVector.afterSetup ([this.m_terrainContainer]);

		this.m_forceVector.x = __interactionData.getLocalPosition (this.m_terrainContainer).x;
		this.m_forceVector.y = __interactionData.getLocalPosition (this.m_terrainContainer).y;

		this.m_forceVector.addUpdateListener ((__dist:number) => {
			console.log (": update: ", __dist);

			this.m_sidePanel.setForce (__dist);
		});

		this.m_forceVector.addFiredListener ((__dx:number, __dy:number) => {
			console.log (": fired: ", __dx, __dy);

			this.m_terrainContainer.getGolfBall ().shootBall (__dx, __dy);

			this.Launched_Script ();
		});
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
		this.m_terrainContainer = this.addGameObjectAsChild (TerrainContainer, 0, GolfGame.TERRAIN_DEPTH) as TerrainContainer;
		this.m_terrainContainer.afterSetup ([this.m_worldName]);
		this.m_terrainContainer.x = 0;
		this.m_terrainContainer.y = 0;

		return this.m_terrainContainer;
	}

    //------------------------------------------------------------------------------------------
    public loadTerrain (__path:string):void {
        this.loader = new PIXI.Loader ();

        this.m_loadTerrainComplete = false;

		console.log (": loadTerrain: begin: ");

		__path = this.translateAlias (__path);

        this.loader.add (__path).load ((loader, resources) => {
            this.m_loadTerrainComplete = true;

            var __response:string = resources[__path].xhr.response;

			var __terrainXMLString = __response;

			this.m_terrainXML = new XSimpleXMLNode ();
			this.m_terrainXML.setupWithXMLString (__terrainXMLString);

			console.log (": loadTerrain: ", __response);
        });
	}
	
    //------------------------------------------------------------------------------------------
    public loadLayers (__path:string):void {
        this.loader = new PIXI.Loader ();

        this.m_loadLayersComplete = false;

		console.log (": loadLayers: begin: ");

		__path = this.translateAlias (__path);

        this.loader.add (__path).load ((loader, resources) => {
            this.m_loadLayersComplete = true;

            var __response:string = resources[__path].xhr.response;

			var __layersXML = __response;

			this.m_layersXML = new XSimpleXMLNode ();
			this.m_layersXML.setupWithXMLString (__layersXML);

			console.log (": loadLayers: ", __response);
        });
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
		this.m_ballSpeed = 999.0;

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
							if (this.m_ballSpeed < 0.33) {
								this.m_golfBall.createReticle ();

								this.Idle_Script ();
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
				this.world.getSoundSubManager ().playSoundFromName ("Common_Sound_BallExplosion");
			},

			XTask.WAIT1000, 0.75 * 1000,

			() => {
				var __point:XPoint = this.m_terrainContainer.getHoleArrow ().getBasePos ();

				__electricBeam = this.m_terrainContainer.addGameObjectAsChild (ElectricBeam, 0, GolfGame.PLAYFIELD_BEHIND_DEPTH, true) as ElectricBeam;
				__electricBeam.afterSetup ([this.m_terrainContainer]);
				__electricBeam.x = __point.x;
				__electricBeam.y = __point.y + 16;
				
				console.log (": hole arrow: pos: ", __point.x, __point.y);
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
			__golfBallPart = this.m_terrainContainer.addGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				__arrayPoints[i].x * Math.random () * 2, __arrayPoints[i].y * Math.random () * 2,
				i
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		for (i=0; i<5; i++) {
			__golfBallPart = this.m_terrainContainer.addGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				Math.random () * 6 - 3, Math.random () * 6 - 3,
				Math.floor (Math.random () * 5)
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		for (i=0; i<3; i++) {
			__golfBallPart = this.m_terrainContainer.addGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				Math.random () * 12 - 6, Math.random () * 12 - 6,
				Math.floor (Math.random () * 5)
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		for (i=0; i<2; i++) {
			__golfBallPart = this.m_terrainContainer.addGameObjectAsChild (GolfBallPart, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as GolfBallPart;
			__golfBallPart.afterSetup ([
				this.m_terrainContainer,
				Math.random () * 16 - 8, Math.random () * 16 - 8,
				Math.floor (Math.random () * 5)
			]);
			__golfBallPart.x = this.m_golfBall.x;
			__golfBallPart.y = this.m_golfBall.y;
		}

		var __ballExplosion:BallExplosion = this.m_terrainContainer.addGameObjectAsChild (BallExplosion, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, true) as BallExplosion;
		__ballExplosion.afterSetup ([this.m_terrainContainer]);
		__ballExplosion.x = this.m_golfBall.x;
		__ballExplosion.y = this.m_golfBall.y;

		LayerUtils.addShake ((__dx:number) => {
			this.x = __dx;
		}, 32);

		LayerUtils.addShake ((__dy:number) => {
			this.y = __dy;
		}, 32);

		//------------------------------------------------------------------------------------------
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