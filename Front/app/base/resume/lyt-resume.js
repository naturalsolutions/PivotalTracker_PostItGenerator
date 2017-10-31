define(['jquery', 'underscore', 'marionette', 'backbone', 'bootstrap'],
	function ($, _, Marionette, Backbone) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/resume/tpl/tpl-resume.html',
			className: 'home-page ns-full-height animated',
			events: {

			},

			ui: {
				tab: '#resumeTab'
			},

			initialize:function(options){
				this.sharedMemory = options.mem;
				console.log('Zbleh',this.sharedMemory)
				Backbone.on('tasksAdded', this.manageResume, this);
				if(this.sharedMemory.relativStories.length > 0){
					this.addProjectLines()
				}
			},

			onShow: function (options) {

			},
			
			parseExisting: function(){
				
			},

			addProjectLines: function(){
				console.log('bleh', this.sharedMemory.projects)
				for(var i in this.sharedMemory.projects){
					$(this.ui.tab).append('<tr id="'+this.sharedMemory.projects[i].id+'"><th scope="row">'+this.sharedMemory.projects[i].id+'</th></tr>')
				}
			}
		});
	});
