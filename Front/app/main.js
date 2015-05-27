require.config({ 
	baseUrl: 'app',
	paths : {
		
		'tmp'					: './tmp',
		
		'app'					: 'app',
		'config'				: 'config',
		'router'				: 'router',
		'controller'			: 'controller',
		'models'				: './models',
		'collections'			: './collections',
		'templates'				: '../build/templates',
		'lyt-rootview'			: './base/rootview/lyt-rootview',
		'transition-region'		: './base/transition-region/transition-region',
		'translater'            : 'translater', 
		
		
		/*==========  NS modules  ==========*/
		'ns_modules'			: 'ns_modules',
		'ns_filter'				: 'ns_modules/ns_filter',
		'ns_form'				: 'ns_modules/ns_form',
		'ns_grid'				: 'ns_modules/ns_grid',
		'ns_map'				: 'ns_modules/ns_map',
		'ns_stepper'			: 'ns_modules/ns_stepper',


		/*==========  Bower  ==========*/
		'jquery'				: '../bower_components/jquery/jquery.min',
		'jqueryui'				: '../bower_components/jqueryui/jquery-ui.min',
		'underscore'			: '../bower_components/underscore/underscore',
		'backbone'				: '../bower_components/backbone/backbone',
		'marionette'			: '../bower_components/marionette/lib/core/backbone.marionette',
		'backbone.babysitter'	: '../bower_components/backbone.babysitter/lib/backbone.babysitter',
		'backbone.wreqr'		: '../bower_components/backbone.wreqr/lib/backbone.wreqr',
		'radio'					: '../bower_components/backbone.radio/build/backbone.radio',
		'bootstrap'				: '../bower_components/bootstrap/dist/js/bootstrap',
		'sha1'					: '../bower_components/sha1/bin/sha1',
		
		'requirejs-text'		: '../bower_components/requirejs-text/text',

		
		'i18n'					: '../bower_components/i18n/i18next',
		
	},


	shim : {
		jquery : {
			exports : '$'
		},
		jqueryui: {
			exports: 'ui'
		},
		underscore : {
			exports : '_'
		},
		backbone : {
			deps : ['jquery', 'underscore'],
			exports : 'Backbone'
		},
		marionette : {
			exports : 'Marionette'
		},
		radio : {
			exports : 'Radio'
		},
		bootstrap: {
			deps: ['jquery'],
			exports : 'Bootstrap'
		},
		templates :{
			deps : ['underscore'],
			exports : 'Templates',
		},
		sha1: {
			exports: 'sha1'
		},
		
		i18n : {
			deps: ['jquery'],
			exports : '$'
		},

	},
});

require(['app', 'templates','translater'], function(app,templates,Translater){
		app.start();
		this.translater = Translater.getTranslater();
});
