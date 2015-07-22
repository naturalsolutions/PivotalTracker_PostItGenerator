/**

	TODO:
	- set login as marionette.application

**/
define(['jquery', 'marionette', 'backbone', 'config'],
	function($, Marionette, Backbone, config){

	'use strict';
	return Marionette.AppRouter.extend({
		appRoutes: {

			'*route(/:page)': 'home',

		},
	});
});
