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
import * as Matter from 'matter-js';
import { World, Body, Engine } from 'matter-js';
import { G } from '../app/G';
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