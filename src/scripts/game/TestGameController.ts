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
import { XGameController } from '../state/XGameController';
import { TestGame } from './TestGame';
import { TestMatter } from './TestMatter';
import { TerrainEditor } from '../editor/TerrainEditor';

//------------------------------------------------------------------------------------------
export class TestGameController extends XGameController {
	
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

		this.getGameInstance ().registerState ("TestGame", TestGame);
		this.getGameInstance ().registerState ("TestMatter", TestMatter);
		this.getGameInstance ().registerState ("TerrainEditor", TerrainEditor);

		this.addTask ([
			XTask.LABEL, "loop",
				XTask.WAIT, 0x0100,

				XTask.FLAGS, (__task:XTask) => {
					__task.ifTrue (this.m_XApp.getXProjectManager ().getLoadComplete ());
				}, XTask.BNE, "loop",

				() => {
					console.log (": load complete: ");
				},

				() => this.getGameInstance ().gotoState ("TerrainEditor"),

			XTask.RETN,
		]);

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
}