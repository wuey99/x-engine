//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
export class URL  {

	//------------------------------------------------------------------------------------------
	public static getParameterByName (name:string, url:string = window.location.href):string {
		name = name.replace(/[\[\]]/g, '\\$&');

		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),

		results = regex.exec(url);

		if (!results) return null;
		if (!results[2]) return '';
        
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

//------------------------------------------------------------------------------------------
}
