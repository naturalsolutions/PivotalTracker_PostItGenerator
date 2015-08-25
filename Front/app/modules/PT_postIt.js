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
	console.log('allTasks',allTasks);
	var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
		childView: TaskChildView,
		childViewContainer: "#allPostIt",
		template: 'app/base/home/tpl/tpl-postItContainer.html',
	});
	var taskColl = new TaskColl(allTasks);
	var taskCollView = new TaskCollectionView({ collection: taskColl  });
	taskCollView.render();
	console.log('taskCollView',taskCollView);
	if(bCompletion){
		$(taskCollView.el).append(createEmptyDivCompletion(allTasks.length));
	}
	destElement.append(taskCollView.el);
}

function createEmptyDivCompletion(iTasksLength){
	var blankDiv = '';
	console.log('iTasksLength', iTasksLength, 12 - iTasksLength % 12)
	for(var i = 0; i<12 - (iTasksLength % 12); i++){
		blankDiv += '<div class="vontainer notToDisplay"><div class="onePostItContainer"></div></div>';
	}
	return blankDiv;
}

function runDrawing(storys, addCompletion){
	var infoConter = {
		nbStories : 0,
		nbTasks : 0,
		nbTasksPP : 0,
	}
	var selectedSories = [];
	$.each(storys, function(){
		if(this.isInSprint){
			selectedSories.push(this);
		}
	});
	infoConter.nbStories = selectedSories.length;
	drawStoryPostIt(selectedSories,$("#postItContainer"),addCompletion);
	var selectedTasks = [];
	$.each(selectedSories, function(){
		if(this.isInSprint){
			$.each(this.tasks,function(){
				if(this.isInSprint && !this.isPairProg){
					selectedTasks.push(this);
				}
			});
		}
	});
	infoConter.nbTasks = selectedTasks.length;
	drawTaskPostIt(selectedTasks,$("#postItContainer > div"),addCompletion);
	selectedTasks = [];
	$.each(selectedSories, function(){
		if(this.isInSprint){
			$.each(this.tasks,function(){
				if(this.isInSprint && this.isPairProg){
					selectedTasks.push(this);
				}
			});
		}
	});
	infoConter.nbTasksPP = selectedTasks.length;
	drawTaskPostIt(selectedTasks,$("#postItContainer > div"),addCompletion);
	return infoConter;
}

