//------------------------------------------------------------------------------------------
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';

//------------------------------------------------------------------------------------------
export class XPauseManager  {
	public static self:XPauseManager;

    public m_pauseSignal:XSignal;
    public m_resumeSignal:XSignal;

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
	}

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
}
