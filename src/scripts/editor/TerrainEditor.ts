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
import { XState } from '../state/XState';
import { TerrainTilePalette } from './TerrainTilePalette';

//------------------------------------------------------------------------------------------
export class TerrainEditor extends XState {
	
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

		this.createObjects ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public createObjects ():void {
		var __y:number = 16;

		var __terrainTilePalette64:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette64.afterSetup ([64, "01"]);

		__terrainTilePalette64.x = 16;
		__terrainTilePalette64.y = __y;

		__y += 64 + 8;

		var __terrainTilePalette32:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette32.afterSetup ([32, "01"]);

		__terrainTilePalette32.x = 16;
		__terrainTilePalette32.y = __y;

		__y += 32 + 8;

		var __terrainTilePalette16:TerrainTilePalette = this.addGameObjectAsChild (TerrainTilePalette, 0, 0.0) as TerrainTilePalette;
		__terrainTilePalette16.afterSetup ([16, "01"]);

		__terrainTilePalette16.x = 16;
		__terrainTilePalette16.y = __y;
	}

//------------------------------------------------------------------------------------------
}