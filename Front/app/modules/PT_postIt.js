function drawStoryPostIt(allStories,destElement,bCompletion){
	var StoryModel = Backbone.Model.extend({});

	var StoryColl = Backbone.Collection.extend({
		model: StoryModel,
	});

	var StoryChildView = Backbone.Marionette.ItemView.extend({
		template: 'app/base/home/tpl/tpl-postItStory.html',

		serializeData : function() {
			//Inject Data here
			var modelSerialized = this.model.toJSON();
			return modelSerialized;
		},
		onRender:function(){
			this.$el.addClass('vontainer');
		}
	});

	var StoryCollectionView = Backbone.Marionette.CollectionView.extend({
		childView: StoryChildView,
		childViewContainer: "#allPostIt",
		template: 'app/base/home/tpl/tpl-postItContainer.html'
	});
	var storyColl = new StoryColl(allStories);
	var storyCollView = new StoryCollectionView({ collection: storyColl  });

	storyCollView.render();
	if(bCompletion){
		$(storyCollView.el).append(createEmptyDivCompletion(allStories.length));
	}
	destElement.append(storyCollView.el);
}

function drawTaskPostIt(allTasks,destElement,bCompletion){
	var TaskModel = Backbone.Model.extend({});

	var TaskColl = Backbone.Collection.extend({
		model: TaskModel,
	});

	var TaskChildView = Backbone.Marionette.ItemView.extend({
		template: 'app/base/home/tpl/tpl-postItTache.html',
		onRender:function(){
			this.$el.addClass('vontainer');
		}
	});

	var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
		childView: TaskChildView,
		childViewContainer: "#allPostIt",
		template: 'app/base/home/tpl/tpl-postItContainer.html',
	});
	var taskColl = new TaskColl(allTasks);
	var taskCollView = new TaskCollectionView({ collection: taskColl  });
	taskCollView.render();
	if(bCompletion){
		$(taskCollView.el).append(createEmptyDivCompletion(allTasks.length));
	}
	destElement.append(taskCollView.el);
}

function createEmptyDivCompletion(iTasksLength){
	var blankDiv = ''
	for(var i = 0; i<12 - (iTasksLength % 12); i++){
		blankDiv += '<div class="vontainer"><div class="onePostItContainer"></div></div>';
	}
	return blankDiv;
}

