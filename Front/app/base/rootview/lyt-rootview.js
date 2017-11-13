define(['marionette', 'transition-region', './base/header/lyt-header', './base/project/lyt-project', './base/postit/lyt-postit'],
function(Marionette, TransitionRegion, LytHeader, LytProject, LytPostit) {
	'use strict';

	return Marionette.LayoutView.extend({
		el: 'body',
		template: 'app/base/rootview/tpl-rootview.html',
		className: 'ns-full-height',

		regions: {
			rgHeader: 'header',
			rgPostit: '#rgPostit',
			rgScrum: '#rgScrum',
			rgResume: '#rgResume',
			rgMain: new Marionette.TransitionRegion({
				el: 'main'
			}),
			rgFooter: 'footer'
		},

		storedUsers:[],

		initialize: function(){
			
		},

		render: function(options){		
			Backbone.on('setUsers', this.storeUsers, this);
			Backbone.on('getUsers');
			
			Marionette.LayoutView.prototype.render.apply(this, options);
			this.rgHeader.show( new LytHeader());
		},

		setUsers:function(options){
			this.storedUsers = options;
		},	

		getUsers: function(){
			return this.storedUsers;
		}
	});
});
