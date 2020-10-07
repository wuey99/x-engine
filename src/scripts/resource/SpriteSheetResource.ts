//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';

//------------------------------------------------------------------------------------------
export class SpriteSheetResource extends Resource {

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public setup (__path:string):void {
        super.setup (__path);

        return;

		PIXI.Loader.shared.add (__path).load (() => {
            this.m_loadComplete = true;
        });
    }

    //------------------------------------------------------------------------------------------
    public load ():void {
		PIXI.Loader.shared.add (this.m_path).load (() => {
            console.log (": SpriteSheetResource: loadComplete: ", this);

            this.m_loadComplete = true;
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return PIXI.Loader.shared.resources[this.m_path].spritesheet;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
    }

//------------------------------------------------------------------------------------------
}