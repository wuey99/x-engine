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
import { TerrainContainer } from '../terrain/TerrainContainer';
import { GolfGameInstance } from './GolfGameInstance';
import { G } from '../../engine/app/G';
import { GolfGame } from './GolfGame';
import { HorizontalBorder } from './HorizontalBorder';

//------------------------------------------------------------------------------------------
export class TopBorder extends HorizontalBorder {

//------------------------------------------------------------------------------------------
    public setCollisions ():void {
        (G.appX as GolfGameInstance).getTopCollisionList ().addCollision (0, this, this.getPos (), this.getCX ());
    }

//------------------------------------------------------------------------------------------
}