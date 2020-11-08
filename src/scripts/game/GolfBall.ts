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
import { EnemyX } from '../test/EnemyX';
import { TerrainContainer } from '../terrain/TerrainContainer';
import * as Matter from 'matter-js';
import { Reticle } from './Reticle';
import { GolfGame } from '../game/GolfGame';
import { GolfGameInstance } from '../game/GolfGameInstance';
import { G } from '../../engine/app/G';
import { BallFire } from './BallFire';

//------------------------------------------------------------------------------------------
export class GolfBall extends XGameObject {
    public m_sprite:PIXI.AnimatedSprite;
    public x_sprite:XDepthSprite;

	public m_reticle:Reticle;
	public m_ballFire:BallFire;

	public m_ballInHoleSignal:XSignal;
	public m_ballOutrgSignal:XSignal;

	public m_terrainContainer:TerrainContainer;
	public m_worldName:string;
	
	public m_mouseDownFlag:boolean;

    public script:XTask;

	public m_ballInHole:boolean;
	public m_ballOutrg:boolean;

	public m_baseX:number;
	public m_baseY:number;

	public m_ballAngle:number;
	public m_ballSpeed:number;

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

		this.setCX (-20, +20, -20, +20);

		this.m_terrainContainer = __params[0];
		this.m_worldName = __params[1];
		var __selfShooting:boolean = __params[2];
		this.m_baseX = __params[3];
		this.m_baseY = __params[4];

		this.m_ballInHoleSignal = this.createXSignal ();
		this.m_ballInHole = false;

		this.m_ballOutrgSignal = this.createXSignal ();
		this.m_ballOutrg = false;

		this.m_mouseDownFlag = false;

		this.m_ballAngle = 0.0;
		this.m_ballSpeed = 0.0;

		this.createSprites ();
		this.createObjects ();

		if (__selfShooting) {
			this.createInputHandlers ();
		}
		
        this.script = this.addEmptyTask ();

        this.Idle_Script ();

		this.checkCollisions ();
		
        this.addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,

                () => {
                    this.m_ballFire.angle = this.m_ballAngle;
                },

                XTask.GOTO, "loop",
            XTask.RETN,
		]);
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
    public createSprites ():void {
		// this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_Ball");
		// this.addSpriteAsChild (this.m_sprite, -44/2, -44/2, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, false);

		this.m_sprite = this.createAnimatedSprite ("GolfBall");
		this.addSortableChild (this.m_sprite, 0, GolfGame.PLAYFIELD_FRONT_DEPTH, false);

		this.show ();
	}

//------------------------------------------------------------------------------------------
	public createObjects ():void {
		this.createReticle ();

		this.m_ballFire = this.addGameObjectAsChild (BallFire, this.getLayer (), this.getDepth () - 1.0) as BallFire;
		this.m_ballFire.afterSetup ([this]);
	}
	
//------------------------------------------------------------------------------------------
	public createReticle ():void {
		this.m_reticle = this.addGameObjectAsChild (Reticle, this.getLayer (), this.getDepth ()) as Reticle;
		this.m_reticle.afterSetup ([]);

		this.m_reticle.addKillListener (() => {
			this.m_reticle = null;
		});
	}

//-----------------------------------------------------------------------------------------
	public removeReticle ():void {
		if (this.m_reticle != null) {
			this.m_reticle.nukeLater ();
		}
	}
	
//------------------------------------------------------------------------------------------
	public checkCollisions ():void {
		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				() => {
					var __gameObject:XGameObject
					
					__gameObject = (G.appX as GolfGameInstance).getHoleCollisionList ().findCollision (
						this.getLayer (), this.getPos (), this.getCX ()
					);

					if (!this.m_ballInHole && __gameObject != null) {
						this.m_ballInHoleSignal.fireSignal ();

						this.m_ballInHole = true;
					}

					__gameObject = (G.appX as GolfGameInstance).getBorderCollisionList ().findCollision (
						this.getLayer (), this.getPos (), this.getCX ()
					);

					if (__gameObject != null) {
						console.log (": border collision: ", __gameObject);

						this.m_ballOutrgSignal.fireSignal ();
					}
				},

				XTask.GOTO, "loop",

			XTask.RETN,
		]);
	}

//--------------------------------------------------------------------------------------
	public setAngle (__angle:number):void {
		this.m_ballAngle = __angle;
	}

//--------------------------------------------------------------------------------------
	public getAngle ():number {
		return this.m_ballAngle;
	}

//--------------------------------------------------------------------------------------
	public setSpeed (__speed:number):void {
		this.m_ballSpeed = __speed;
	}

//--------------------------------------------------------------------------------------
	public getSpeed ():number {
		return this.m_ballSpeed;
	}

//------------------------------------------------------------------------------------------
	public addBallInHoleListener (__listener:any):number {
		return this.m_ballInHoleSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public addBallOutrgListener (__listener:any):number {
		return this.m_ballOutrgSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public isBallInHole ():boolean {
		return this.m_ballInHole;
	}

//------------------------------------------------------------------------------------------
	public isBallOutrg ():boolean {
		return this.m_ballOutrg;
	}

//------------------------------------------------------------------------------------------
	public isBallOutOfView ():boolean {
		return false;
	}

//------------------------------------------------------------------------------------------
	public createInputHandlers ():void {
		this.m_sprite.interactive = true;
		this.m_sprite.interactiveChildren = true;

        this.m_sprite.on ("mousedown", (e:PIXI.InteractionEvent) => {
			this.m_mouseDownFlag = true;

			this.m_terrainContainer.clearGraphics ();

			console.log (": mousedown: ");
		});

        this.m_XApp.getStage ().on ("mouseup", (e:PIXI.InteractionEvent) => {
			if (this.m_mouseDownFlag) {
				this.m_mouseDownFlag = false;
				
				this.ballRelease (e);

				console.log (": mouseup: ");
			}
		});

		this.m_XApp.getStage ().on ("mouseleave", (e:PIXI.InteractionEvent) => {
			if (this.m_mouseDownFlag) {
				this.m_mouseDownFlag = false;
				
				this.ballRelease (e);

				console.log (": mouseleave: ");
			}
		});

		this.m_XApp.getStage ().on ("mouseout", (e:PIXI.InteractionEvent) => {
			if (this.m_mouseDownFlag) {
				this.m_mouseDownFlag = false;
				
				this.ballRelease (e);

				console.log (": mouseout: ");
			}
		});

        this.m_sprite.on ("mousemove", (e:PIXI.InteractionEvent) => {
            var __interactionData:PIXI.InteractionData = e.data;

			if (this.m_mouseDownFlag) {
				this.m_terrainContainer.drawForceVector (0xffff00, this.x, this.y, __interactionData.global.x, __interactionData.global.y);

				console.log (": ", __interactionData.global.x, __interactionData.global.y);
			}
		});
    }

	//------------------------------------------------------------------------------------------
	public ballRelease (e:PIXI.InteractionEvent):void {
		this.m_terrainContainer.clearGraphics ();

		console.log (": ball released: ");

		var __interactionData:PIXI.InteractionData = e.data;

		var __x:number = __interactionData.global.x;
		var __y:number = __interactionData.global.y;

		var __dx:number = (this.x - __x) / 2048;
		var __dy:number = (this.y - __y) / 2048;

		console.log (": applyForce: ", __dx, __dy);

		this.shootBall (__dx, __dy);
	}

//------------------------------------------------------------------------------------------
	public shootBall (__dx:number, __dy:number):void {
		Matter.Body.applyForce (
			this.getMatterBody (),
			{
				x: this.getMatterBody ().position.x,
				y: this.getMatterBody ().position.y
			},
			{
				x: __dx,
				y: __dy,	
			}
		);

		this.world.getSoundSubManager ().playSoundFromName ("Common_Sound_BallLaunched",
			1.0, 0, 1.0
		);

		this.m_ballFire.OnFire_Script ();
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
	public Flash_Script (__finishedCallback:any):void {

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
				XTask.LOOP, 12,
					() => {
						this.m_sprite.gotoAndStop (0);
					}, XTask.WAIT, 0x0200,

					() => {
						this.m_sprite.gotoAndStop (1);
					}, XTask.WAIT, 0x0200,
				XTask.NEXT,

				() => {
					this.visible = false;

					__finishedCallback ();
				},

			XTask.LABEL, "wait",
				XTask.WAIT, 0x0100,

				XTask.GOTO, "wait",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
    }
        
//------------------------------------------------------------------------------------------
}