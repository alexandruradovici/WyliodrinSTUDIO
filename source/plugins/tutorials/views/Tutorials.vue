<template>
	<v-card class="manager-box emulator-box">
		<v-card-title>
			<span class="headline">Tutorials</span>
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card>
			<v-list three-line>
				<v-list-item
				v-for="tutorial in tutorials"
				:key="tutorial.title"	
				>
					<v-list-item-avatar
					v-if="tutorial.board === 'ESP8266'"
					>
						<v-img src="plugins/tutorials/data/img/esp8266.png"></v-img>
					</v-list-item-avatar>
					<v-list-item-avatar
					v-else
					>
						<v-img src="plugins/tutorials/data/img/esp.png"></v-img>
					</v-list-item-avatar>
					<v-list-item-content >
							<v-list-item-title v-text="tutorial.title"></v-list-item-title>
							<v-list-item-subtitle v-text="tutorial.description"></v-list-item-subtitle>
					</v-list-item-content>
					<v-list-item-avatar
					v-if="tutorial.language === 'python'"
					>
						<v-img src="plugins/tutorials/data/img/python.jpg"></v-img>
					</v-list-item-avatar>
					<v-list-item-avatar
					v-else-if="tutorial.language === 'micropython'"
					>
						<v-img src="plugins/tutorials/data/img/micropython.jpg"></v-img>
					</v-list-item-avatar>
					<v-btn color="primary" @click="createProject(tutorial)">Click</v-btn>
				</v-list-item>
			</v-list>
		</v-card>					
		<v-card-actions> 
			<v-btn text @click="close">CLOSE</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
import axios from 'axios';
//import { js2xml } from 'xml-js';
export default {
	name: 'Tutorials',
	data ()
	{
		return  {
			tutorials: []		
		};
	},
	async created () {
		let response = await axios.get('https://api.github.com/repos/alexandra2607/tutorials-wyliodrin/contents');
		
		let dirs =[];
		for (let list of response.data) {
			if (list.type === 'dir') {
				dirs.push(list.path);
			}
		}
		
		for (let dir of dirs) {
			let tutorialData = await axios.get (`https://raw.githubusercontent.com/alexandra2607/tutorials-wyliodrin/master/${dir}/.project/tutorial.json`);
			let tutorial = tutorialData.data;
			this.tutorials.push(tutorial);
			tutorial['path'] = dir;
		}		
	},
	methods: {	
		close ()
		{
			this.$root.$emit ('submit');
		},
		async createProject(tutorial) {
			let nameProject = await this.studio.workspace.showPrompt('Name your project', 'PROJECT_NAME_PROMPT','','PROJECT_NEW_NAME');

			if (nameProject !== null) 
			{					
				let createProject = await this.studio.projects.createEmptyProject(nameProject, tutorial.language);

				let dirInfos = {};
				await this.getDirListOfFiles(tutorial.path, dirInfos);
								
				for (let key in dirInfos) {
					let folderPath = key.replace(tutorial.path, '');
					if (folderPath !== '') {
						
						await this.studio.projects.newFolder(createProject, folderPath);
					}
					for (let file of dirInfos[key]) {
					
						let filePath = file.replace(tutorial.path, '');
						let fileData = await this.downloadFile(file);
						let fileData2 = new Uint8Array(fileData);
						// let fileData3 = JSON.parse(JSON.stringify(fileData2));
						// var json = await new Response(fileData2).json();
						console.log(key);
						console.log(file);
						console.log("file data:");
						if (!fileData) console.log("nimic");
						if (typeof fileData === 'object') console.log(fileData);
						if (typeof fileData === 'string') console.log(JSON.parse(fileData));
						
						
						//console.log(fileData.toString());
						//console.log(json);
						await this.studio.projects.newFile(createProject, filePath, fileData);
					}
					
				}	 
			}	
		},
		async getDirListOfFiles (path, dirInfos) {
			
			let response = await axios.get ('https://api.github.com/repos/alexandra2607/tutorials-wyliodrin/contents/'+ path);
			// debugger
			// console.log(response);

			for(let item of response.data) {
				if (item.type === 'file') {
					if (dirInfos[path] === undefined) {
						dirInfos[path] = [];
					}
					dirInfos[path].push(item.path);
				}
				else if (item.type === 'dir') {
					await this.getDirListOfFiles(item.path, dirInfos);
				}
			}	
		},
		async downloadFile (path) {
			let file = await axios.get (`https://raw.githubusercontent.com/alexandra2607/tutorials-wyliodrin/master/${path}`, {responseType: 'arraybuffer',});
			return file.data;
		}
	}
};
</script>
