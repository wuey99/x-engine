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
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';

//------------------------------------------------------------------------------------------
export class XPauseManager  {
	public static self:XPauseManager;

    public m_pauseSignal:XSignal;
	public m_resumeSignal:XSignal;
	
	public m_muteMusicSignal:XSignal;
	public m_muteSFXSignal:XSignal;

	//------------------------------------------------------------------------------------------
	public static instance ():XPauseManager {
        if (XPauseManager.self == null) {
            XPauseManager.self = new XPauseManager ();
        }

        return XPauseManager.self;
	}

	//------------------------------------------------------------------------------------------
	constructor () {
        this.m_pauseSignal = new XSignal ();
		this.m_resumeSignal = new XSignal ();
		
        this.m_muteMusicSignal = new XSignal ();
        this.m_muteSFXSignal = new XSignal ();
	}

	//------------------------------------------------------------------------------------------
	private __cleanup ():void {
		this.m_pauseSignal.removeAllListeners ();
		this.m_resumeSignal.removeAllListeners ();
		this.m_muteMusicSignal.removeAllListeners ();
		this.m_muteSFXSignal.removeAllListeners ();
	}

	//------------------------------------------------------------------------------------------
	public static cleanup ():void {
		XPauseManager.instance ().__cleanup ();
	}

	//------------------------------------------------------------------------------------------
	//
	// PAUSE / RESUME
	//
	//------------------------------------------------------------------------------------------

	//------------------------------------------------------------------------------------------
	public static addPauseListener (__listener:any):number {
		return XPauseManager.instance ().__addPauseListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public static removePauseListener (__id:number):void {
		XPauseManager.instance ().__removePauseListener (__id);
	}

	//------------------------------------------------------------------------------------------
	public static addResumeListener (__listener:any):number {
		return XPauseManager.instance ().__addResumeListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public static removeResumeListener (__id:number):void {
		XPauseManager.instance ().__removeResumeListener (__id);
	}

	//------------------------------------------------------------------------------------------
	public static firePauseSignal ():void {
		XPauseManager.instance ().__firePauseSignal ();
	}

	//------------------------------------------------------------------------------------------
	public static fireResumeSignal ():void {
		XPauseManager.instance ().__fireResumeSignal ();
    }
    
	//------------------------------------------------------------------------------------------
	private __firePauseSignal ():void {
        this.m_pauseSignal.fireSignal ();
	}

	//------------------------------------------------------------------------------------------
	private __fireResumeSignal ():void {
        this.m_resumeSignal.fireSignal ();
	}

	//------------------------------------------------------------------------------------------
	private __addPauseListener (__listener:any):number {
        return this.m_pauseSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	private __removePauseListener (__id:number):void {
        this.m_pauseSignal.removeListener (__id);
	}

	//------------------------------------------------------------------------------------------
	private __addResumeListener (__listener:any):number {
        return this.m_resumeSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	private __removeResumeListener (__id:number):void {
        this.m_resumeSignal.removeListener (__id);
	}

	//------------------------------------------------------------------------------------------
	//
	// MUTE / UNMUTE
	//
	//------------------------------------------------------------------------------------------`

	//------------------------------------------------------------------------------------------
	public static addMuteMusicListener (__listener:any):number {
		return XPauseManager.instance ().__addMuteMusicListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public static removeMuteMusicListener (__id:number):void {
		XPauseManager.instance ().__removeMuteMusicListener (__id);
	}

	//------------------------------------------------------------------------------------------
	public static addMuteSFXListener (__listener:any):number {
		return XPauseManager.instance ().__addMuteSFXListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	public static removeMuteSFXListener (__id:number):void {
		XPauseManager.instance ().__removeMuteSFXListener (__id);
	}

	//------------------------------------------------------------------------------------------
	public static fireMuteMusicSignal (__mute:boolean):void {
		XPauseManager.instance ().__fireMuteMusicSignal (__mute);
	}

	//------------------------------------------------------------------------------------------
	public static fireMuteSFXSignal (__mute:boolean):void {
		XPauseManager.instance ().__fireMuteSFXSignal (__mute);
    }
    
	//------------------------------------------------------------------------------------------
	private __fireMuteMusicSignal (__mute:boolean):void {
        this.m_muteMusicSignal.fireSignal (__mute);
	}

	//------------------------------------------------------------------------------------------
	private __fireMuteSFXSignal (__mute:boolean):void {
        this.m_muteSFXSignal.fireSignal (__mute);
	}

	//------------------------------------------------------------------------------------------
	private __addMuteMusicListener (__listener:any):number {
        return this.m_muteMusicSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	private __removeMuteMusicListener (__id:number):void {
        this.m_muteMusicSignal.removeListener (__id);
	}

	//------------------------------------------------------------------------------------------
	private __addMuteSFXListener (__listener:any):number {
        return this.m_muteSFXSignal.addListener (__listener);
	}

	//------------------------------------------------------------------------------------------
	private __removeMuteSFXListener (__id:number):void {
        this.m_muteSFXSignal.removeListener (__id);
	}
}
