//------------------------------------------------------------------------------------------
// <$begin$/>
// The MIT License (MIT)
//
// The "X-Engine"
//
// Copyright (c) 2014-2021 Jimmy Huey (wuey99@gmail.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// <$end$/>
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
import { XApp } from "../app/XApp";
import { Resource} from '../resource/Resource';
import { XTask } from '../task/XTask';
import { XType } from '../type/XType';
import { XProjectManager } from '../resource/XProjectManager';
import { Howl, Howler } from 'howler';
import { XPauseManager } from '../state/XPauseManager';
import { XSoundManager } from './XSoundManager';
import { SoundHandle } from './XSoundManager';

//------------------------------------------------------------------------------------------
export class XSoundSubManager {
    public m_soundManager:XSoundManager;
    public m_sounds:Map<number, number>;
    public m_maxChannels:number;
    public m_numChannels:number;
    public m_muted:boolean;

    //------------------------------------------------------------------------------------------		
    constructor (__manager:XSoundManager) {
        this.m_soundManager = __manager;

        this.m_sounds = new Map<number, number> ();

        this.m_maxChannels = 8;
        this.m_numChannels = 0;
        this.m_muted = false;
    }

//------------------------------------------------------------------------------------------
    public setup (__maxChannels:number):void {
        this.m_maxChannels = __maxChannels;
        this.m_numChannels = 0;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        this.removeAllSounds ();
    }

    //------------------------------------------------------------------------------------------	
    public playSoundFromName (
        __resourceName:string,
        __priority:number = 1.0,
        __loops:number = 0,
        __volume:number = 1.0,
        __successListener?:any,
        __completeListener?:any
        ):number {

		if (!this.channelAvailable (__priority)) {
			return -1;
        }
            
        return this.m_soundManager.playSoundFromName (
            __resourceName,
            __priority,
            __loops,
            __volume,
            this.m_muted,
            (__guid:number) => {
                this.m_sounds.set (__guid, __priority);
                this.m_numChannels++;
                
                if (__successListener != null) {
                    __successListener (__guid);
                }	
            },
            (__guid:number) => {
                if (__completeListener != null) {
                    __completeListener (__guid);
                }
                
                if (this.m_sounds.has (__guid)) {
                    this.m_sounds.delete (__guid);	
                    this.m_numChannels--;
                }
            }
        );
    }

//------------------------------------------------------------------------------------------
    public mute (__mute:boolean):void {
        this.m_muted = __mute;

        XType.forEach (this.getSounds (), 
            (__guid:number) => {
                var __soundHandle:SoundHandle = this.getSoundHandle (__guid);
                __soundHandle.sound.mute (__mute, __soundHandle.id);
            }
        );
    }

//------------------------------------------------------------------------------------------
    private channelAvailable (__priority:number):boolean {
        if (this.m_numChannels < this.m_maxChannels) {
            return true;
        }
        
        var __firstChoice:number = -1;
        var __secondChoice:number = -1;
        
        XType.forEach (this.m_sounds, 
            (__targetGuid:number) => {
                var __targetPriority:number = this.m_sounds.get (__targetGuid);
                
                if (__priority > __targetPriority) {
                    __firstChoice = __targetGuid;
                }
                
                if (__priority == __targetPriority) {
                    __secondChoice = __targetGuid;
                }
            }
        );
        
        if (__firstChoice != -1) {
            this.removeSound (__firstChoice);
            
            return true;
        }
        
        if (__secondChoice != -1) {
            this.removeSound (__secondChoice);
            
            return true;
        }
        
        return false;
    }

    //------------------------------------------------------------------------------------------
    public stopSound (__guid:number):void {
        this.removeSound (__guid);
    }
    
    //------------------------------------------------------------------------------------------
     public removeSound (__guid:number):void {
        if (this.m_sounds.has (__guid)) {
            this.m_soundManager.removeSound (__guid);

            this.m_sounds.delete (__guid);
        }
     }

     //------------------------------------------------------------------------------------------
     public removeAllSounds ():void {
        XType.forEach (this.m_sounds, 
            (__guid:number) => {
                this.removeSound (__guid);
            }
        );
     }

     //------------------------------------------------------------------------------------------
     public getSounds ():Map<number, number> {
        return this.m_sounds;
     }

     //------------------------------------------------------------------------------------------
     public getSoundHandle (__guid:number):SoundHandle {
        return this.m_soundManager.getSoundHandle (__guid);
     }

//------------------------------------------------------------------------------------------	
}