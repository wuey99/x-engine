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
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { G } from '../../engine/app/G';
import { TerrainTile } from './TerrainTile';

//------------------------------------------------------------------------------------------
export class TerrainMisc extends TerrainTile {

    //------------------------------------------------------------------------------------------
    public getName ():string {
        return "TerrainMisc";
    }

//------------------------------------------------------------------------------------------
    public createBody ():void {   
    }

//------------------------------------------------------------------------------------------
}