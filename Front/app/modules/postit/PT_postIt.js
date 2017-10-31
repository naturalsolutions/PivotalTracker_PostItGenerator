var printParams = {
	//Limite actuel de pages
	pageLimit: 5,
	elementPerPage: 12
};



function drawPostIt(allStories, destElement) {
	// var exit = false;
	//for(var h = 0; h < printParams.elementPerPage; h++){
	/*init des limites*/

	printParams.pageLimit = 5;           // init sinon garde la derniere valeur de pagelimit en mémoire
	printParams.elementPerPage = 12;     //
			
	if (allStories.length < 60) {
		printParams.pageLimit = Math.ceil(allStories.length / printParams.elementPerPage);
	}	
	for (var h = 0; h < printParams.pageLimit; h++) {
		for (var i = 0; i < printParams.elementPerPage; i++) {
			var cursor = (i * printParams.pageLimit) + h;			
			if (cursor >= allStories.length) {				
				if (i < printParams.elementPerPage) {
					drawEmptyPostIt($("#postItContainer"));
				}
			} else if (allStories[(i * printParams.pageLimit) + h].story_id) {
				drawTaskPostIt(allStories[(i * printParams.pageLimit) + h], $("#postItContainer"))
			} else {
				drawStoryPostIt(allStories[(i * printParams.pageLimit) + h], $("#postItContainer"), false);
			}
		}
	}
}

function drawStoryPostIt(allStories, destElement, drawChildren) {
	var StoryModel = Backbone.Model.extend({});

	var StoryColl = Backbone.Collection.extend({
		model: StoryModel,
	});
	var model;
	var StoryChildView = Backbone.Marionette.ItemView.extend({
		template: 'app/base/postit/tpl/tpl-postItStory.html',

		serializeData: function () {
			//Inject Data here
			var modelSerialized = this.model.toJSON();
			return modelSerialized;
		},
		onRender: function () {
			this.$el.addClass('vontainer');
			model = this.model;

			destElement.append(storyCollView.el);
		}
	});

	var StoryCollectionView = Backbone.Marionette.CollectionView.extend({
		childView: StoryChildView,
		//className: "onePostItContainer",
		childViewContainer: "#allPostIt",
		template: 'app/base/postit/tpl/tpl-postItContainer.html'
	});
	var storyColl = new StoryColl(allStories);
	var storyCollView = new StoryCollectionView({ collection: storyColl });

	storyCollView.render();
	if (drawChildren) {
		drawTaskPostIt(model.get('tasks'), $("#postItContainer > div"));
	}
	//destElement.append(storyCollView.el);
}

function drawTaskPostIt(allTasks, destElement) {
	var TaskModel = Backbone.Model.extend({});

	var TaskColl = Backbone.Collection.extend({
		model: TaskModel,
	});

	var TaskChildView = Backbone.Marionette.ItemView.extend({
		template: 'app/base/postit/tpl/tpl-postItTache.html',
		onRender: function () {
			this.$el.addClass('vontainer');

			destElement.append(taskCollView.el);
		}
	});
	var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
		childView: TaskChildView,
		childViewContainer: "#allPostIt",
		template: 'app/base/home/tpl/tpl-postItContainer.html',
	});
	var taskColl = new TaskColl(allTasks);
	var taskCollView = new TaskCollectionView({ collection: taskColl });
	taskCollView.render();

}

function drawEmptyPostIt(destElement) {
	var TaskModel = Backbone.Model.extend({});

	var TaskColl = Backbone.Collection.extend({
		model: TaskModel,
	});

	var TaskChildView = Backbone.Marionette.ItemView.extend({
		template: 'app/base/postit/tpl/tpl-postItEmpty.html',
		onRender: function () {
			this.$el.addClass('vontainer hiddenCompletionDiv');

			destElement.append(taskCollView.el);
		}
	});
	var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
		childView: TaskChildView,
		childViewContainer: "#allPostIt",
		template: 'app/base/postit/tpl/tpl-postItContainer.html',
	});
	var taskColl = new TaskColl({});
	var taskCollView = new TaskCollectionView({ collection: taskColl });
	taskCollView.render();

}


function createEmptyDivCompletion(iTasksLength) {
	var blankDiv = '';
	for (var i = 0; i < 12 - (iTasksLength % 12); i++) {
		blankDiv += '<div class="vontainer notToDisplay"><div class="onePostItContainer"></div></div>';
	}
	return blankDiv;
}

function runDrawing(stories, forPrint) {
	var listStoriesWeight = [];
	var limiteStoriyTaskLength = 0;

	for (var i = 0; i < stories.length; i++) {
		var cpt = 1;
		if (stories[i].isInSprint) {
			cpt += stories[i].tasks.length;
			listStoriesWeight.push({ id: stories[i].id, cpt: cpt, storie: stories[i] });
			limiteStoriyTaskLength++;
		}
	}
	while (listStoriesWeight.length > 0) {
		var tempTabToPrint = [];
		var bestWeigth = 0;
		limiteStoriyTaskLength = listStoriesWeight.length;
		var bestSolution = [];
		var i = 0;
		while (i < limiteStoriyTaskLength && bestWeigth < 60) {
			var weigthTmp = 0;
			var solutionTmp = [];

			for (var j = i; j < limiteStoriyTaskLength && weigthTmp <= 60; j++) {
				if (weigthTmp + listStoriesWeight[j].cpt <= 60) {
					solutionTmp.push([listStoriesWeight[j].id, j]);
					weigthTmp += listStoriesWeight[j].cpt;

				}
			}
			if (bestWeigth < weigthTmp) {
				bestWeigth = weigthTmp;
				bestSolution = solutionTmp;
			}
			i++;
		}
		var tempImpress = [];
		for (var z = 0; z < bestSolution.length; z++) {

			//drawPostIt(listStoriesWeight[bestSolution[z][1]].storie,$("#postItContainer"),true);
			if (forPrint) {
				tempTabToPrint.push(listStoriesWeight[bestSolution[z][1]].storie);
			}
			//drawTaskPostIt(listStoriesWeight[bestSolution[z][1]].storie.tasks,$("#postItContainer > div"),addCompletion);
		}
		for (var i = 0; i < bestSolution.length; i++) {
			for (var j = 0; j < listStoriesWeight.length; j++) {
				if (bestSolution[i][0] == listStoriesWeight[j].id) {
					listStoriesWeight.splice(j, 1);
				}
			}
		}
		var finalSolution = [];

		for (var j = 0; j < tempTabToPrint.length; j++) {
			finalSolution.push(tempTabToPrint[j]);

			for (var k = 0; k < tempTabToPrint[j].tasks.length; k++) {
				finalSolution.push(tempTabToPrint[j].tasks[k]);
			}
		}
		console.log("nb postit", finalSolution.length);
		drawPostIt(finalSolution);
	}
	if (forPrint) {
		setTimeout(function () {
			$("#postItContainer").print({ stylesheet: 'app/styles/externalCssPrintable.css' });
		}, 0);

	}
}

function runDrawingOld(stories, forPrint) {
	var listStoriesWeight = [];
	var limiteStoriyTaskLength = 0;

	for (var i = 0; i < stories.length; i++) {
		var cpt = 1;
		if (stories[i].isInSprint) {
			cpt += stories[i].tasks.length;
			listStoriesWeight.push({ id: stories[i].id, cpt: cpt, storie: stories[i] });
			limiteStoriyTaskLength++;
		}
	}
	var tempTabToPrint = [];
	while (listStoriesWeight.length > 0) {
		var bestWeigth = 0;
		limiteStoriyTaskLength = listStoriesWeight.length;
		var bestSolution = [];
		var i = 0;
		while (i < limiteStoriyTaskLength && bestWeigth < 60) {
			var weigthTmp = 0;
			var solutionTmp = [];

			for (var j = i; j < limiteStoriyTaskLength && weigthTmp <= 60; j++) {
				if (weigthTmp + listStoriesWeight[j].cpt <= 60) {
					solutionTmp.push([listStoriesWeight[j].id, j]);
					weigthTmp += listStoriesWeight[j].cpt;

				}
			}
			if (bestWeigth < weigthTmp) {
				bestWeigth = weigthTmp;
				bestSolution = solutionTmp;
			}
			i++;
		}
		var tempImpress = [];
		for (var z = 0; z < bestSolution.length; z++) {

			drawStoryPostIt(listStoriesWeight[bestSolution[z][1]].storie, $("#postItContainer"), true);
			if (forPrint) {
				tempTabToPrint.push(listStoriesWeight[bestSolution[z][1]].storie);
			}
			//drawTaskPostIt(listStoriesWeight[bestSolution[z][1]].storie.tasks,$("#postItContainer > div"),addCompletion);
		}
		for (var i = 0; i < bestSolution.length; i++) {
			for (var j = 0; j < listStoriesWeight.length; j++) {
				if (bestSolution[i][0] == listStoriesWeight[j].id) {
					listStoriesWeight.splice(j, 1);
				}
			}
		}
	}
	if (forPrint) {
		$("#postItContainer").print({ stylesheet: 'app/styles/externalCssPrintable.css' });
	}
	//console.log("tout propre", tempTabToPrint);
}

// function runDrawingOld(storys, addCompletion){
// 	var infoConter = {
// 		nbStories : 0,
// 		nbTasks : 0,
// 		nbTasksPP : 0,
// 	}
// 	var selectedSories = [];
// 	$.each(storys, function(){
// 		if(this.isInSprint){
// 			selectedSories.push(this);
// 		}
// 	});
// 	infoConter.nbStories = selectedSories.length;
// 	drawStoryPostIt(selectedSories,$("#postItContainer"),addCompletion);
// 	var selectedTasks = [];
// 	$.each(selectedSories, function(){
// 		if(this.isInSprint){
// 			$.each(this.tasks,function(){
// 				if(this.isInSprint && !this.isPairProg){
// 					selectedTasks.push(this);
// 				}
// 			});
// 		}
// 	});
// 	infoConter.nbTasks = selectedTasks.length;
// 	drawTaskPostIt(selectedTasks,$("#postItContainer > div"),addCompletion);
// 	selectedTasks = [];
// 	$.each(selectedSories, function(){
// 		if(this.isInSprint){
// 			$.each(this.tasks,function(){
// 				if(this.isInSprint && this.isPairProg){
// 					selectedTasks.push(this);
// 				}
// 			});
// 		}
// 	});
// 	infoConter.nbTasksPP = selectedTasks.length;
// 	drawTaskPostIt(selectedTasks,$("#postItContainer > div"),addCompletion);
// 	return infoConter;
// }

function getTheSories(scope) {
	if (scope.postItMemory.backUpStories.length) {
		allStories = scope.postItMemory.backUpStories;
	} else {
		allStories = scope.postItMemory.relativStories;
	}
	return allStories;
}


function deleteNEraseAllTaskById(storyId) {
	var stories = getTheSories();
	$.each(stories, function (i, v) {
		if (this.id == storyId) {
			$.each(this.tasks, function (it, vt) {
				this.isInSprint = false;
				if ($('i[name=' + storyId + '&' + taskId + ']').length) {
					$('i[name=' + storyId + '&' + taskId + ']').closest('.vontainer').remove();
				}
			});
			return;
		}
	});
}
