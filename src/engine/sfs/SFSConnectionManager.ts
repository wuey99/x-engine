//------------------------------------------------------------------------------------------
import * as SFS2X from "sfs2x-api";
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
export class SFSConnectionManager {
    public static self:SFSConnectionManager;
    public m_sfs:SFS2X.SmartFox;
    public m_connected:boolean;

    public m_connectedSignal:XSignal;
    public m_disconnectedSignal:XSignal;
    public m_errorSignal:XSignal;

    public m_sfsEvents:Map<any, __SFSListener>;
    
//------------------------------------------------------------------------------------------
	public static instance ():SFSConnectionManager {
        if (SFSConnectionManager.self == null) {
            SFSConnectionManager.self = new SFSConnectionManager ();
        }

        return SFSConnectionManager.self;
    }
    
//------------------------------------------------------------------------------------------	
	constructor () {
	}
	
//------------------------------------------------------------------------------------------
	public setup ():SFSConnectionManager {
        this.m_connectedSignal = new XSignal ();
        this.m_disconnectedSignal = new XSignal ();
        this.m_errorSignal = new XSignal ();

        this.m_sfsEvents = new Map<any, __SFSListener> ();

        return this;
	}

//------------------------------------------------------------------------------------------
    public connect ():SFSConnectionManager {
        this.m_sfs = new SFS2X.SmartFox ();

        this.addEventListener (SFS2X.SFSEvent.CONNECTION, this.onConnection.bind (this));
        this.addEventListener (SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost.bind (this));
        this.addEventListener (SFS2X.SFSEvent.CONFIG_LOAD_SUCCESS, this.onConfigLoadSuccess.bind (this));
        this.addEventListener (SFS2X.SFSEvent.CONFIG_LOAD_FAILURE, this.onConfigLoadFailure.bind (this));

        this.m_connected = false;

        this.m_sfs.connect ("127.0.0.1", 8080);

        return this;
    }

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        this.removeAllEventListeners ();
    
		this.m_connectedSignal.removeAllListeners ();
        this.m_disconnectedSignal.removeAllListeners ();
        this.m_errorSignal.removeAllListeners ();
	}
    
//------------------------------------------------------------------------------------------
    public getSFS ():SFS2X.SmartFox {
        return this.m_sfs;
    }

//------------------------------------------------------------------------------------------
    public addEventListener (__eventName:string, __listener:any):any {
        var __sfsListener:__SFSListener = new __SFSListener (__eventName, __listener);

        this.m_sfsEvents.set (__listener, __sfsListener);
        
        return __listener;
    }

//------------------------------------------------------------------------------------------
    public removeEventListener (__listener:any):any {
        var __sfsListener:__SFSListener = this.m_sfsEvents.get (__listener);
        __sfsListener.cleanup ();

        this.m_sfsEvents.delete (__listener);
    }

//------------------------------------------------------------------------------------------
    public removeAllEventListeners ():void {
        XType.forEach (this.m_sfsEvents,
            (__listener:any) => {
                this.removeEventListener (__listener);				
            }
        );
    }

//------------------------------------------------------------------------------------------
    public addConnectedistener (__listener:any):number {
        return this.m_connectedSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
    public addDisconnectedistener (__listener:any):number {
        return this.m_disconnectedSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
    public addErrorListener (__listener:any):number {
        return this.m_errorSignal.addListener (__listener);
    }

//------------------------------------------------------------------------------------------
    public onConnection (evt:SFS2X.SFSEvent):void {
        if (evt.success) {
            console.log ("Connected to SmartFoxServer 2X!");

            this.m_connected = true;

            this.m_connectedSignal.fireSignal ();

        } else {
            console.log ("Connection failed. Is the server running at all?");

            this.m_connected = false;

            this.m_errorSignal.fireSignal ();
        }
    }

//------------------------------------------------------------------------------------------
    public onConnectionLost (evt:SFS2X.SFSEvent):void {
        console.log ("Connection was lost. Reason: ", evt.params.reason)

        this.m_connected = false;

        this.m_disconnectedSignal.fireSignal ();
    }

//------------------------------------------------------------------------------------------
    private onConfigLoadSuccess (evt:SFS2X.SFSEvent):void {
        console.log ("Config load success!");

        console.log ("Server settings: ", this.m_sfs.config.host, ":", this.m_sfs.config.port);
    }
     
//------------------------------------------------------------------------------------------
    private onConfigLoadFailure (evt:SFS2X.SFSEvent):void {
        console.log ("Config load failure!!!")
    }

//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
class __SFSListener {
	public m_eventName:string;
	public m_listener:any;
	public boundListener:any;

	//------------------------------------------------------------------------------------------
	constructor (__eventName:string, __listener:any) {
		this.m_eventName = __eventName;
		this.m_listener = __listener;

		SFSConnectionManager.instance ().getSFS ().addEventListener (__eventName, this.boundListener = this.__listener.bind (this));
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		SFSConnectionManager.instance ().getSFS ().removeEventListener (this.m_eventName, this.boundListener);
	}

	//------------------------------------------------------------------------------------------
	private __listener (evt:SFS2X.SFSEvent):void {
		this.m_listener (evt);
	}

//------------------------------------------------------------------------------------------
}