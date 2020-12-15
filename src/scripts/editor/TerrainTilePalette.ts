//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
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
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { TerrainTileIcon } from './TerrainTileIcon';

//------------------------------------------------------------------------------------------
export class TerrainTilePalette extends XGameObject {
	public m_name:string;
	public m_size:number;
    public m_world:string;
    
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
		this.m_world = __params[2];
		var __numIcons:number = __params[3];
		var __xoffset:number = __params[4];
		var __scaleFactor:number = __params[5];

        this.m_selectedSignal = this.createXSignal ();

		var i:number;

		for (i = 0; i < __numIcons; i++) {
			var __terrainTileIcon:TerrainTileIcon = this.addGameObjectAsChild (TerrainTileIcon, this.getLayer (), this.getDepth ()) as TerrainTileIcon;
			__terrainTileIcon.afterSetup ([this.m_name, this.m_size, this.m_world, i]);
			__terrainTileIcon.x = i * (this.m_size + __xoffset);
			__terrainTileIcon.y = 0;
			__terrainTileIcon.scale.x = __terrainTileIcon.scale.y = __scaleFactor;
            
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