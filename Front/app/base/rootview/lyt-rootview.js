define(['marionette', 'transition-region', './base/header/lyt-header'],
function(Marionette, TransitionRegion, LytHeader) {
	'use strict';

	return Marionette.LayoutView.extend({
		el: 'body',
		template: 'app/base/rootview/tpl-rootview.html',
		className: 'ns-full-height',

		regions: {
			rgHeader: 'header',

			rgMain: new Marionette.TransitionRegion({
				el: 'main'
			}),
			rgFooter: 'footer'
		},



		render: function(options){
			Marionette.LayoutView.prototype.render.apply(this, options);
			this.rgHeader.show( new LytHeader());
		},

	});
});
