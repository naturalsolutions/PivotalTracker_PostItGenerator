define(['marionette', 'config',
	'./base/project/lyt-project',
	'./base/user/lyt-user',
	'./base/resume/lyt-resume',
	'./base/postit/lyt-postit',
	],function( Marionette, config,
		LytProject,
		LytUser,
		LytResume,
		LytPostit
		){
		'use strict';
		return Marionette.Object.extend({

			sharedMemory: {
				relativStories:[],
				
			},

			initialize: function(){
				this.rgScrum = this.options.app.rootView.rgScrum;
				this.rgPostit = this.options.app.rootView.rgPostit;
				this.rgResume = this.options.app.rootView.rgResume;
				this.rgHeader=this.options.app.rootView.rgHeader;
				this.rgFooter=this.options.app.rootView.rgFooter;
				if (localStorage.getItem('backupedStories') != null) {
					//A supprimer, dev helper
					if (true) {
					//Bonne ligne a conserver
					//if (confirm("Des taches existes voulez vous les conserver?")) {
						this.sharedMemory.relativStories = JSON.parse(localStorage.getItem('backupedStories')).filter(o => !Array.isArray(o));						
					}else{
						//TODO: clean cache
						localStorage.setItem('backupedStories', null);
					}
				} 
			},

			home: function() {
				var _this = this;
				Backbone.history.navigate('');
				this.rgScrum.show(new LytProject({mem : this.sharedMemory}));
				this.rgPostit.show(new LytPostit({mem : this.sharedMemory}));
				this.rgResume.show(new LytResume({mem : this.sharedMemory}));
			},

			project: function(){
				if(this.rgResume.$el.length == 0){
					this.rgResume.show(new LytResume({mem : this.sharedMemory}));					
				}
				if(this.rgPostit.$el.length == 0){
					this.rgPostit.show(new LytPostit({mem : this.sharedMemory}));
				}
				this.rgScrum.show(new LytProject({mem : this.sharedMemory}));				
			},

			user: function(){
				if(this.rgResume.$el.length == 0){
					this.rgResume.show(new LytResume({mem : this.sharedMemory}));					
				}
				if(this.rgPostit.$el.length == 0){
					this.rgPostit.show(new LytPostit({mem : this.sharedMemory}));
				}
				this.rgScrum.show(new LytUser({mem : this.sharedMemory}));				
			},

			resume: function(){
				this.rgResume.show(new LytResume({mem : this.sharedMemory, show: true}));
				if(this.rgPostit.$el.length == 0){
					this.rgPostit.show(new LytPostit({mem : this.sharedMemory}));
				}
			}



	});
});
