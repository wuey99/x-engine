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
import { TerrainTileIcon } from './TerrainTileIcon';

//------------------------------------------------------------------------------------------
export class TerrainTilePalette extends XGameObject {
	public m_name:string;
	public m_size:number;
    public m_terrain:string;
    
    public m_selectedSignal:XSignal;

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

		this.m_name = __params[0];
		this.m_size = __params[1];
		this.m_terrain = __params[2];

		var __numIcons:number = __params[3];

        this.m_selectedSignal = this.createXSignal ();

		var i:number;

		for (i = 0; i < __numIcons; i++) {
			var __terrainTileIcon:TerrainTileIcon = this.addGameObjectAsChild (TerrainTileIcon) as TerrainTileIcon;
			__terrainTileIcon.afterSetup ([this.m_name, this.m_size, this.m_terrain, i]);
			__terrainTileIcon.x = i * (this.m_size + 8);
            __terrainTileIcon.y = 0;
            
            __terrainTileIcon.addMouseDownListener ((__tile:TerrainTileIcon, e:PIXI.InteractionEvent) => {
                this.m_selectedSignal.fireSignal (__tile);
            });
		}

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
        super.cleanup ();
	}
    
//------------------------------------------------------------------------------------------
    public addSelectedListener (__listener:any):number {
        return this.m_selectedSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
}