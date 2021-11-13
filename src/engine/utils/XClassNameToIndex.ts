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
    import { XSimpleXMLNode } from '../xml/XSimpleXMLNode';

//------------------------------------------------------------------------------------------
// this class maps a list of classNames to unique indexes
//------------------------------------------------------------------------------------------
	export class XClassNameToIndex  {
		private m_classNamesStrings:Array<string>;
		private m_classNamesCounts:Array<number>; 
		private m_freeClassNameIndexes:Array<number>;
		
//------------------------------------------------------------------------------------------	
		public new () {
			this.m_classNamesStrings = new Array<string> ();
			this.m_classNamesCounts = new Array<number> ();
			this.m_freeClassNameIndexes = new Array<number> ();
		}	

//------------------------------------------------------------------------------------------
		public setup ():void {
		}
	
//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}
		
//------------------------------------------------------------------------------------------
// given an index, find its className.
//------------------------------------------------------------------------------------------
		public getClassNameFromIndex (__index:number):string {
			return this.m_classNamesStrings[__index];
		}

//------------------------------------------------------------------------------------------
// given a className assign a unique index to it.
//------------------------------------------------------------------------------------------
		public getIndexFromClassName (__className:string):number {
			var index:number;
			
// look up the index associated with the className
			index = this.m_classNamesStrings.indexOf (__className);
			
// if no index can be found, create a new index
			if (index == -1) {
				
				// create a new className if there are no previously deleted ones
				if (this.m_freeClassNameIndexes.length == 0) {		
					this.m_classNamesStrings.push (__className);
					this.m_classNamesCounts.push (1);
					index = this.m_classNamesStrings.indexOf (__className);
				}
				// reclaim a previously deleted className's index
				else
				{	
					index = this.m_freeClassNameIndexes.pop ();
					this.m_classNamesStrings[index] = __className;	
					this.m_classNamesCounts[index]++;	
				}		
			}
			// increment the className's ref count
			else
			{		
				this.m_classNamesCounts[index]++;
			}
			
			return index;
		}

//------------------------------------------------------------------------------------------
// remove a className from the list
//
// classNames aren't physically removed from the list: the entry is cleared out and the index
// in the Array is made available for reuse.
//------------------------------------------------------------------------------------------
		public removeIndexFromClassNames (__index:number):void {
			this.m_classNamesCounts[__index]--;
			
			if (this.m_classNamesCounts[__index] == 0) {
				this.m_classNamesStrings[__index] = "";
				
				this.m_freeClassNameIndexes.push (__index);
			}
		}
		
//------------------------------------------------------------------------------------------
		public getAllClassNames ():Array<String> {
			var __classNames:Array<string>  = new Array<string> ();
			var i:number;
			
			for (i = 0; i < this.m_classNamesStrings.length; i++) {
				if (this.m_classNamesStrings[i] != "") {
					__classNames.push (this.m_classNamesStrings[i]);
				}
			}
			
			return __classNames;
		}

//------------------------------------------------------------------------------------------
		public getClassNameCount (__index:number):number {
			return this.m_classNamesCounts[__index];
		}
		
//------------------------------------------------------------------------------------------
		public serialize ():XSimpleXMLNode {
			var __xml:XSimpleXMLNode = new XSimpleXMLNode ();
			
			__xml.setupWithParams ("classNames", "", []);
			
			var i:number;
			
			for (i = 0; i < this.m_classNamesStrings.length; i++) {
				var __attribs:Array<any> = [
					"index",		i,
					"name",			this.m_classNamesStrings[i],
					"count",		this.m_classNamesCounts[i]					
				];
				
				var __className:XSimpleXMLNode = new XSimpleXMLNode ();
				
				__className.setupWithParams ("className", "", __attribs);
				
				__xml.addChildWithXMLNode (__className);
			}
			
			return __xml;
		}

//------------------------------------------------------------------------------------------
		public deserialize (__xml:XSimpleXMLNode):void {
			this.m_classNamesStrings = new Array<string> ();
			this.m_classNamesCounts = new Array<number> ();
			this.m_freeClassNameIndexes = new Array<number> ();
			
			console.log (": XClassNameToIndex: deserialize: ");
			
			var __xmlList:Array<XSimpleXMLNode> = __xml.child ("classNames")[0].child ("className");
			
			var i:number;
			var __name:string;
			var __count:number;
			
			for (i = 0; i < __xmlList.length; i++) {
				__name = __xmlList[i].getAttributeString ("name");
				__count = __xmlList[i].getAttributeInt ("count");
				
				console.log (": XClassNameToIndex: deserialize: ", __name, __count);
				
				this.m_classNamesStrings.push (__name);
				
// don't use the count because the rest of the deserialization code is going to add
// the items back to the XMap.
//				m_classNamesCounts.push (__count);
				this.m_classNamesCounts.push (0);
			}
			
			for (i = 0; i < this.m_classNamesStrings.length; i++) {
				if (this.m_classNamesStrings[i] == "") {
					this.m_freeClassNameIndexes.push (i);
				}
			}
		}
		
//------------------------------------------------------------------------------------------	
	}
	
//------------------------------------------------------------------------------------------	
// }
