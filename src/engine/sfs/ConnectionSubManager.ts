//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XType } from '../../engine/type/XType';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { GUID } from '../../engine/utils/GUID';
import { MessagingManager } from './MessagingManager';
import { ConnectionManager } from './ConnectionManager';

//------------------------------------------------------------------------------------------
export class ConnectionSubManager {
	public m_connectedSignals:Map<number, number>;
    public m_disconnectedSignals:Map<number, number>;
	public m_loggedInToZoneSignals:Map<number, number>;
    public m_loggedOutOfZoneSignals:Map<number, number>;
    public m_errorSignals:Map<number, number>;
	
//------------------------------------------------------------------------------------------	
	constructor () {
		this.m_connectedSignals = new Map<number, number> ();
		this.m_disconnectedSignals = new Map<number, number> ();
		this.m_loggedInToZoneSignals = new Map<number, number> ();
        this.m_loggedOutOfZoneSignals = new Map<number, number> ();
		this.m_errorSignals = new Map<number, number> ();
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        this.removeAllConnectedListeners ();
        this.removeAllDisconnectedListeners ();
        this.removeAllLoggedintoZoneListeners ();
        this.removeAllLoggedOutOfZoneListeners ();
        this.removeAllErrorListeners ();
	}

	//------------------------------------------------------------------------------------------
	public addConnectedListener (__listener:any):number {
		var __id:number = ConnectionManager.instance ().addConnectedListener (__listener);

        this.m_connectedSignals.set (__id, 0);

        return __id;
	}

	//------------------------------------------------------------------------------------------
	public removeConnectedListener (__id:number):void {
        if (this.m_connectedSignals.has (__id)) {
            this.m_connectedSignals.delete (__id);

    		ConnectionManager.instance ().removeConnectedListener (__id);
        }
	}

	//------------------------------------------------------------------------------------------
	public removeAllConnectedListeners ():void {
        XType.forEach (this.m_connectedSignals,
            (__id:number) => {
                this.removeConnectedListener (__id);
            }
        );
	}

	//------------------------------------------------------------------------------------------
	public addDisconnectedListener (__listener:any):number {
		var __id:number = ConnectionManager.instance ().addDisconnectedListener (__listener);

        this.m_disconnectedSignals.set (__id, 0);
        
        return __id;
	}

	//------------------------------------------------------------------------------------------
	public removeDisconnectedListener (__id:number):void {
        if (this.m_disconnectedSignals.has (__id)) {
            this.m_disconnectedSignals.delete (__id);
            
            ConnectionManager.instance ().removeDisconnectedListener (__id);
        }
	}

	//------------------------------------------------------------------------------------------
	public removeAllDisconnectedListeners ():void {
        XType.forEach (this.m_disconnectedSignals,
            (__id:number) => {
                this.removeDisconnectedListener (__id);
            }
        );
	}

	//------------------------------------------------------------------------------------------
	public addLoggedIntoZoneListener (__listener:any):number {
		var __id:number = ConnectionManager.instance ().addLoggedIntoZoneListener (__listener);

        this.m_loggedInToZoneSignals.set (__id, 0);

        return __id;
	}

	//------------------------------------------------------------------------------------------
	public removedLoggedIntoZoneListener (__id:number):void {
        if (this.m_loggedInToZoneSignals.has (__id)) {
            this.m_loggedInToZoneSignals.delete (__id);
          
            ConnectionManager.instance ().removedLoggedIntoZoneListener (__id);
        }
	}

	//------------------------------------------------------------------------------------------
	public removeAllLoggedintoZoneListeners ():void {
        XType.forEach (this.m_loggedInToZoneSignals,
            (__id:number) => {
                this.removedLoggedIntoZoneListener (__id);
            }
        );
	}

	//------------------------------------------------------------------------------------------
	public addLoggedOutOfZoneListener (__listener:any):number {
		var __id:number = ConnectionManager.instance ().addLoggedOutOfZoneListener (__listener);

        this.m_loggedOutOfZoneSignals.set (__id, 0);

        return __id;
	}

	//------------------------------------------------------------------------------------------
	public removeLoggedOutOfZoneListener (__id:number):void {
        if (this.m_loggedOutOfZoneSignals.has (__id)) {
            this.m_loggedOutOfZoneSignals.delete (__id);
          
            ConnectionManager.instance ().removeLoggedOutOfZoneListener (__id);
        }
	}

	//------------------------------------------------------------------------------------------
	public removeAllLoggedOutOfZoneListeners ():void {
        XType.forEach (this.m_loggedOutOfZoneSignals,
            (__id:number) => {
                this.removeLoggedOutOfZoneListener (__id);
            }
        );
	}

	//------------------------------------------------------------------------------------------
	public addErrorListener (__listener:any):number {
		var __id:number = ConnectionManager.instance ().addErrorListener (__listener);

        this.m_errorSignals.set (__id, 0);

        return __id;
	}

	//------------------------------------------------------------------------------------------
	public removeErrorListener (__id:number):void {
        if (this.m_errorSignals.has (__id)) {
            this.m_errorSignals.delete (__id);
         
            ConnectionManager.instance ().removeErrorListener (__id);
        }
	}
	
	//------------------------------------------------------------------------------------------
	public removeAllErrorListeners ():void {
        XType.forEach (this.m_errorSignals,
            (__id:number) => {
                this.removeErrorListener (__id);
            }
        );
	}

//------------------------------------------------------------------------------------------
}