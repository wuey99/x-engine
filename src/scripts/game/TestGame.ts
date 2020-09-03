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
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from '../state/XState';

//------------------------------------------------------------------------------------------
export class TestGame extends XState {
	
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

		console.log (": TestGame: ", XGameObject.getXApp ().getResourceByName ("OctopusBug"));
		
		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (XGameObject.getXApp ().getResourceByName ("OctopusBug"));
				}, XTask.BNE, "loop",

				() => {
					this.createObjects ();
				},

			XTask.RETN,
		]);

		return this;
	}

//------------------------------------------------------------------------------------------
	public createObjects ():void {
			var sheet:PIXI.Spritesheet = XGameObject.getXApp ().getResourceByName ("OctopusBug");
			var animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);
			this.addChild (animatedSprite);
			animatedSprite.x = 256;
			animatedSprite.y = 256;
			
			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,

					() => { animatedSprite.gotoAndStop (0); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (1); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (2); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (3); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (4); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (5); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (6); }, XTask.WAIT, 0x0200,
					() => { animatedSprite.gotoAndStop (7); }, XTask.WAIT, 0x0200,

					XTask.GOTO, "loop",
				XTask.RETN,
			]);

			this.addTask ([
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,

					() => {
						animatedSprite.angle += 8.0;
					},

					XTask.GOTO, "loop",

				XTask.RETN,
			]);
	}

//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}