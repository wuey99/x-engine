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
import { XGameObject} from '../gameobject/XGameObject';
import { EnemyX } from '../objects/EnemyX';
import { TerrainContainer } from '../terrain/TerrainContainer';
import * as Matter from 'matter-js';

//------------------------------------------------------------------------------------------
export class GolfBall extends XGameObject {
    public m_sprite:PIXI.Sprite;
    public x_sprite:XDepthSprite;

	public m_terrainContainer:TerrainContainer;
	public m_worldName:string;
	
	public m_mouseDownFlag:boolean;

    public script:XTask;

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

		this.m_terrainContainer = __params[0];
		this.m_worldName = __params[1];
		var __selfShooting:boolean = __params[2];

		this.m_mouseDownFlag = false;

        this.createSprites ();

		if (__selfShooting) {
			this.createInputHandlers ();
		}
		
        this.script = this.addEmptyTask ();

        this.Idle_Script ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
    public createSprites ():void {
        this.m_sprite = this.createSprite (this.m_worldName + "_Sprites_Ball");
        this.addSpriteAsChild (this.m_sprite, -44/2, -44/2, 0, 999999.0, false);

		this.show ();
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
}