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
import * as SFS2X from "sfs2x-api";
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
export class SFSManager {
    public static self:SFSManager;
    public m_sfs:SFS2X.SmartFox;
    public m_connected:boolean;

    public m_errorSignal:XSignal;

    public m_sfsEvents:Map<any, __SFSListener>;
    
    public static SFS2X_SERVER:string = "45.79.55.202"; // "104.217.137.195";
    
//------------------------------------------------------------------------------------------
	public static instance ():SFSManager {
        if (SFSManager.self == null) {
            SFSManager.self = new SFSManager ();
        }

        return SFSManager.self;
    }
    
//------------------------------------------------------------------------------------------	
	constructor () {
	}
	
//------------------------------------------------------------------------------------------
	public setup ():SFSManager {
        this.m_sfsEvents = new Map<any, __SFSListener> ();

        this.m_sfs = new SFS2X.SmartFox ();

        this.addEventListener (SFS2X.SFSEvent.CONNECTION, this.onConnection.bind (this));
        this.addEventListener (SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost.bind (this));
        this.addEventListener (SFS2X.SFSEvent.CONFIG_LOAD_SUCCESS, this.onConfigLoadSuccess.bind (this));
        this.addEventListener (SFS2X.SFSEvent.CONFIG_LOAD_FAILURE, this.onConfigLoadFailure.bind (this));

        this.m_errorSignal = new XSignal ();

        this.m_connected = false;

        return this;
	}

//------------------------------------------------------------------------------------------
    public connect (__url:string, __port:number, __connected?:any,  __error?:any, __disconnected?:any):SFSManager {
        this.m_sfs.connect (__url, __port);

        if (__connected != null) {
            this.once (SFS2X.SFSEvent.CONNECTION, __connected)
        }

        if (__disconnected != null) {
            this.once (SFS2X.SFSEvent.CONNECTION_LOST, __disconnected)
        }
        
        if (__error != null) {
            this.addErrorListener (() => {
                __error ();
            })
        }

        return this;
    }

//------------------------------------------------------------------------------------------
    public isConnected ():boolean {
        return this.m_connected;
    }

//------------------------------------------------------------------------------------------
    public send (__request:any):SFSManager {
        this.m_sfs.send (__request);

        return this;
    }

//------------------------------------------------------------------------------------------
	public cleanup ():void {
        this.removeAllEventListeners ();

        this.m_errorSignal.removeAllListeners ();
	}
    
//------------------------------------------------------------------------------------------
    public getSFS ():SFS2X.SmartFox {
        return this.m_sfs;
    }

	//------------------------------------------------------------------------------------------
	public addErrorListener (__listener:any):number {
		return this.m_errorSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
    public on (__eventName:string, __listener:any):any {
        this.addEventListener (__eventName, __listener);
    }

//------------------------------------------------------------------------------------------
    public addEventListener (__eventName:string, __listener:any):any {
        var __sfsListener:__SFSListener = new __SFSListener (__eventName, __listener);

        this.m_sfsEvents.set (__listener, __sfsListener);
        
        return __listener;
    }

//------------------------------------------------------------------------------------------
    public once (__eventName:string, __listener:any):any {
        this.addOnceEventListener (__eventName, __listener);
    }

//------------------------------------------------------------------------------------------
    public addOnceEventListener (__eventName:string, __listener:any):any {
        var __sfsListener:__SFSListener = new __SFSOnceListener (__eventName, __listener);

        this.m_sfsEvents.set (__listener, __sfsListener);
        
        return __listener;
    }

//------------------------------------------------------------------------------------------
    public off (__listener:any):any {
        this.removeEventListener (__listener);
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
    public onConnection (evt:SFS2X.SFSEvent):void {
        if (evt.success) {
            console.log ("Connected to SmartFoxServer 2X!");

            this.m_connected = true;

        } else {
            console.log ("Connection failed. Is the server running at all?");

            this.m_connected = false;

            this.m_errorSignal.fireSignal ();
        }
    }

//------------------------------------------------------------------------------------------
    public onConnectionLost (evt:SFS2X.SFSEvent):void {
        console.log ("Connection was lost. Reason: ", evt.params)

        this.m_connected = false;
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

		SFSManager.instance ().getSFS ().addEventListener (__eventName, this.boundListener = this.__listener.bind (this));
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		SFSManager.instance ().getSFS ().removeEventListener (this.m_eventName, this.boundListener);
	}

	//------------------------------------------------------------------------------------------
	public __listener (evt:SFS2X.SFSEvent):void {
		this.m_listener (evt);
	}

//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
class __SFSOnceListener extends __SFSListener {

	//------------------------------------------------------------------------------------------
	public __listener (evt:SFS2X.SFSEvent):void {
        this.m_listener (evt);
        
        SFSManager.instance ().removeEventListener (this.m_listener);
	}

//------------------------------------------------------------------------------------------
}