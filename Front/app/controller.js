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

			testPostit: {
				relativStories:[],
				
			},

			initialize: function(){
				this.rgScrum = this.options.app.rootView.rgScrum;
				this.rgPostit = this.options.app.rootView.rgPostit;
				this.rgResume = this.options.app.rootView.rgResume;
				this.rgHeader=this.options.app.rootView.rgHeader;
				this.rgFooter=this.options.app.rootView.rgFooter;
			},

			home: function() {
				var _this = this;
				Backbone.history.navigate('');
				this.rgScrum.show(new LytProject({mem : this.testPostit}));
				this.rgResume.show(new LytResume({mem : this.testPostit}));
				this.rgPostit.show(new LytPostit({mem : this.testPostit}));
			},

			project: function(){
				if(this.rgResume.$el.length == 0){
					this.rgResume.show(new LytResume({mem : this.testPostit}));					
				}
				if(this.rgPostit.$el.length == 0){
					this.rgPostit.show(new LytPostit({mem : this.testPostit}));
				}
				this.rgScrum.show(new LytProject({mem : this.testPostit}));				
			},

			user: function(){
				if(this.rgResume.$el.length == 0){
					this.rgResume.show(new LytResume({mem : this.testPostit}));					
				}
				if(this.rgPostit.$el.length == 0){
					this.rgPostit.show(new LytPostit({mem : this.testPostit}));
				}
				this.rgScrum.show(new LytUser({mem : this.testPostit}));				
			}



	});
});
