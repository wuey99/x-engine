//------------------------------------------------------------------------------------------
import { Howl } from 'howler';
import * as PIXI from 'pixi.js-legacy';
import { XApp } from "../app/XApp";
import { Resource } from './Resource';

//------------------------------------------------------------------------------------------
export class SoundResource extends Resource {
    public m_sound:Howl;

    //------------------------------------------------------------------------------------------		
    constructor () {
        super ();
    }

    //------------------------------------------------------------------------------------------
    public load ():void { 
        this.m_sound = new Howl ({
            src: [this.m_path]
        });

        this.m_sound.on ("load", () => {
            // console.log (": SoundResource: loadComplete: ", this.m_path);

            this.m_loadComplete = true;
        });
    }

    //------------------------------------------------------------------------------------------
    public getResource ():any {
        if (this.getLoadComplete ()) {
            return this.m_sound;
        } else {
            return null;
        }
    }

    //------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();
        
        if (this.getResource () != null) {
            (this.getResource () as Howl).unload ();

            this.m_sound = null;
        } else {
            console.log (": error: ", this.m_path);
        }
    }

//------------------------------------------------------------------------------------------
}