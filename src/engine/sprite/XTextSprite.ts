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
		private m_width:number;
		private m_height:number;
		private m_horizontalAlignment:string;
		private m_verticalAlignment:string;

//------------------------------------------------------------------------------------------
		public constructor (
			__width:number=32,
			__height:number=32,
			__text:string="",
			__fontName:string="Aller",
            __fontSize:number=12,
			__color:number=0x000000,
            __bold:boolean=false,
			__horzAlign:string="left",
			__vertAlign:string="top"
		) {
			super ();
			
			this.setup ();
			
			this.m_width = __width;
			this.m_height = __height;
			this.m_horizontalAlignment = __horzAlign;
			this.m_verticalAlignment = __vertAlign;

			this.m_text = new PIXI.BitmapText (
                __text,
                {
                    fontName: __fontName,
                    fontSize: __fontSize,
                    tint: __color,
                    align: __horzAlign,
                    maxWidth: __width
                }
            );		
				
			this.addChild (this.m_text); this.format ();	
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
		public format ():void {
			switch (this.m_horizontalAlignment) {
				case "center":
					this.m_text.x = (this.m_width - this.m_text.width) / 2;
					break;
				case "right":
					this.m_text.x = (this.m_width - this.m_text.width);
					break;
				default:
					this.m_text.x = 0;
					break;
			}

			switch (this.m_verticalAlignment) {
				case "center":
					this.m_text.y = (this.m_height - this.m_text.height) / 2;
					break;
				case "bottom":
					this.m_text.y = (this.m_height - this.m_text.height);
					break;
				default:
					this.m_text.y = 0;
					break;
			}
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
			this.format ();		
		}
			
//------------------------------------------------------------------------------------------
		public get font ():string {
			return this.m_text.fontName;
		}
		
		public set font (__val:string) {
			this.m_text.fontName = __val; this.format ();		
		}
		
//------------------------------------------------------------------------------------------
		public get size ():number {
			return this.m_text.fontSize;
		}
		
		public set size (__val:number) {
			this.m_text.fontSize = __val; this.format ();	
		}

//------------------------------------------------------------------------------------------
		public get align ():string {
			return this.m_text.align;
		}
		
		public set align (__val:string) {
			this.m_text.align = __val; this.format ();		
		}
		
//------------------------------------------------------------------------------------------
		public get textWidth ():number {
			return this.m_text.maxWidth;
		}
		
		public set textWidth (__val:number) {
            this.m_text.maxWidth = __val; this.format ();	
		}
		
//------------------------------------------------------------------------------------------
        public get textHeight ():number {
            return this.m_text.height;
        }

        public set textHeight (__val:number) {
			this.format ();	
        }

//------------------------------------------------------------------------------------------
		public get letterSpacing ():number {
			return this.m_text.letterSpacing;
		}
		
		public set letterSpacing (__val:number) {
			this.m_text.letterSpacing = __val; this.format ();		
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