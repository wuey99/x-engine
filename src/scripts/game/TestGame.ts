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
import { GameObject} from '../gameobject/GameObject';
import { XState } from '../state/XState';

//------------------------------------------------------------------------------------------
export class TestGame extends XState {
	
	public sprite:PIXI.Sprite;
	
//------------------------------------------------------------------------------------------	
	constructor () {
		super ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):GameObject {
        super.setup (__world, __layer, __depth);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):GameObject {
        super.afterSetup (__params);

		console.log (": TestGame: ");
		
        this.sprite = PIXI.Sprite.from ('images/logo.png');
        this.sprite.anchor.set (0.5);
        this.sprite.x = this.m_XApp.renderer.width / 2;
        this.sprite.y = this.m_XApp.renderer.height / 2;
        this.addChild (this.sprite);

        this.m_XApp.getXTaskManager ().addTask ([
            XTask.LABEL, "loop",
                XTask.WAIT, 0x0400,

                () => this.sprite.angle += 0.10,

                XTask.GOTO, "loop",
            XTask.RETN,
		])
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}