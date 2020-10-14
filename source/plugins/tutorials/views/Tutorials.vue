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
					v-if="tutorial.language.toString() === 'python'"
					>
						<v-img src="plugins/tutorials/data/img/python.jpg"></v-img>
					</v-list-item-avatar>
					<v-list-item-avatar
					v-else-if="tutorial.language.toString() === 'micropython'"
					>
						<v-img src="plugins/tutorials/data/img/micropython.jpg"></v-img>
					</v-list-item-avatar>
					<v-btn color="primary" @click="createProject(tutorial.title, tutorial.language)">Click</v-btn>
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
			let tutorial = await axios.get (`https://raw.githubusercontent.com/alexandra2607/tutorials-wyliodrin/master/${dir}/.project/tutorial.json`);
			this.tutorials.push(tutorial.data);
		}
		
	},

	methods: {	
		close ()
		{
			this.$root.$emit ('submit');
		},
		async createProject(projectTitle, projectLanguage) {
			console.log('The name of the project is ' + projectTitle);
			let nameProject = await this.studio.workspace.showPrompt('Name your project', 'PROJECT_NAME_PROMPT','','PROJECT_NEW_NAME');

			if (nameProject !== null) 
			{	
				let createProject = await this.studio.projects.createEmptyProject(nameProject.toString(), projectLanguage.toString());
				console.log('project created');
				

				let dirInfos = {};
				await this.getDirListOfFiles(projectTitle.toString(), dirInfos);
				console.log(dirInfos);

				for (let key in dirInfos) {
					let folderPath = key.replace(projectTitle.toString(), '');
					if (folderPath !== '') {
						await this.studio.projects.newFolder(this.name, folderPath);
					}
					for (let file of dirInfos[key]) {
						let filePath = file.replace(projectTitle.toString(), '');
						await createProject.newFile(this.name,filePath, await this.downloadFile(file));
					}
				}	 
			} 
			else 
			{
				console.log('back');
			}
		},
		async getDirListOfFiles (path, dirInfos) {
			let response = await axios.get ('https://api.github.com/repos/alexandra2607/tutorials-wyliodrin/contents/'+ path);
		
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
		
			let file = await axios.get (`https://raw.githubusercontent.com/alexandra2607/tutorials-wyliodrin/master/${path}`);
			return file.data;
		}
	}
};
</script>
