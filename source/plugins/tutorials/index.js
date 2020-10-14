let studio = null;
let button_toque = {};

import Tutorials from './views/Tutorials.vue';


export function setup(options, imports, register) 
{
	studio = imports;

	studio.workspace.registerToolbarButton ('BUTTON_TOQUE_NAME', 20, 
		() => { 
			studio.workspace.showDialog (Tutorials);
		},

		'plugins/tutorials/data/img/toque.png');
		
	register(null, {
		button_toque: button_toque
	});
	
}