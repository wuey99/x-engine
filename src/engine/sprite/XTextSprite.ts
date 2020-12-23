//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
	
//------------------------------------------------------------------------------------------
	export class XTextSprite extends XSprite {
		private m_text:PIXI.BitmapText;

//------------------------------------------------------------------------------------------
		public constructor (
			__width:number=32,
			__height:number=32,
			__text:string="",
			__fontName:string="Aller",
            __fontSize:number=12,
			__color:number=0x000000,
            __bold:boolean=false,
            __align:string="left"
		) {
			super ();
			
			this.setup ();
            
			this.m_text = new PIXI.BitmapText (
                __text,
                {
                    fontName: __fontName,
                    fontSize: __fontSize,
                    tint: __color,
                    align: __align,
                    maxWidth: __width
                }
            );		
				
			this.addChild (this.m_text);
		}

//------------------------------------------------------------------------------------------
		public setup ():void {
			super.setup ();
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup ();
		}
		
//------------------------------------------------------------------------------------------
		public getBitmapText ():PIXI.BitmapText {
			return this.m_text;
		}
		
//------------------------------------------------------------------------------------------
		public get text ():string {
			return this.m_text.text;
		}
		
		public set text (__text:string) {
			this.m_text.text = __text;
		}

//------------------------------------------------------------------------------------------
		public get color ():number {
			return this.m_text.tint;
		}
		
		public set color (__color:number) {
			this.m_text.tint = __color;		
		}
		
//------------------------------------------------------------------------------------------
		public get bold ():boolean {
			return true;
		}
		
		public set bold (__val:boolean) {			
		}
			
//------------------------------------------------------------------------------------------
		public get font ():string {
			return this.m_text.fontName;
		}
		
		public set font (__val:string) {
			this.m_text.fontName = __val;			
		}
		
//------------------------------------------------------------------------------------------
		public get size ():number {
			return this.m_text.fontSize;
		}
		
		public set size (__val:number) {
			this.m_text.fontSize = __val;		
		}

//------------------------------------------------------------------------------------------
		public get align ():string {
			return this.m_text.align;
		}
		
		public set align (__val:string) {
			this.m_text.align = __val;		
		}
		
//------------------------------------------------------------------------------------------
		public get textWidth ():number {
			return this.m_text.maxWidth;
		}
		
		public set textWidth (__val:number) {
            this.m_text.maxWidth = __val;
		}
		
//------------------------------------------------------------------------------------------
        public get textHeight ():number {
            return this.m_text.height;
        }

        public set textHeight (__val:number) {
        }

//------------------------------------------------------------------------------------------
		public get letterSpacing ():number {
			return this.m_text.letterSpacing;
		}
		
		public set letterSpacing (__val:number) {
			this.m_text.letterSpacing = __val;		
		}

//------------------------------------------------------------------------------------------
		public get selectable ():boolean {
			return true;
		}
		
		public set selectable (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
		public get multiline ():boolean {
			return true;
		}
		
		public set multiline (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
		public get wordWrap ():boolean {
			return true;
		}
		
		public set wordWrap (__val:boolean) {		
		}

//------------------------------------------------------------------------------------------
		public get italic ():boolean {
			return true;
		}
		
		public set italic (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------	
		public get kerning ():boolean {
			return true;
		}
		
		public set kerning (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
		public get underline ():boolean {
			return true;
		}
		
		public set underline (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }