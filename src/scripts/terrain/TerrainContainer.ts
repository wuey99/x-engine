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
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { TerrainTile } from './TerrainTile';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class TerrainContainer extends XGameObject {
    public m_terrainTiles:Map<TerrainTile, number>;
    
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

        this.m_terrainTiles = new Map<TerrainTile, number> ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
    }

//------------------------------------------------------------------------------------------
    public pickupTerrainTile (__x:number, __y:number):TerrainTile {
        XType.forEach (this.m_terrainTiles,
            (__key:any) => {
                var __terrainTile:TerrainTile = __key as TerrainTile;

                if (
                    (__x > __terrainTile.x && __x < __terrainTile.x + __terrainTile.getSize ()) &&
                    (__y > __terrainTile.y && __y < __terrainTile.y + __terrainTile.getSize ())
                ) {
                    console.log (": pickupTerrainTile: ", __terrainTile, __x, __y, __terrainTile.x, __terrainTile.y, __terrainTile.x + __terrainTile.getSize (), __terrainTile.y + __terrainTile.getSize ());
                }
            }
        );

        return null;
    }

//------------------------------------------------------------------------------------------
    public addTerrainTile (__x:number, __y:number, __size:number, __terrain:string, __frame:number):TerrainTile {
        var __terrainTile:TerrainTile = this.addGameObjectAsChild (TerrainTile, 0, 10.0, true) as TerrainTile;
        __terrainTile.afterSetup (
            [
                __x, __y,
                __size,
                __terrain,
                __frame
            ]
        );

        this.m_terrainTiles.set (__terrainTile, 0);

        return __terrainTile;
    }
    
//------------------------------------------------------------------------------------------
    public removeTerrainTile ():void {
            
    }

//------------------------------------------------------------------------------------------
}