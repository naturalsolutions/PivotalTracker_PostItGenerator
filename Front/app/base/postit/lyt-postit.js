define(['jquery', 'underscore', 'marionette', 'backbone', 'bootstrap', 'initPT', 'postit', 'print'],
	function ($, _, Marionette, Backbone) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/postit/tpl/tpl-postit.html',
			className: 'home-page ns-full-height animated',
			events: {
				'click #btStory': 'createStoryPostIt',
				'click #btTache': 'createTachePostIt',
				'click #btPP': 'createTachePPPostIt',
				'click #btPrint': 'printPostIt1',
				'click #btMemo': 'memoriseStory',
				'click #btVisu': 'visualizeMemo',
				'click #btEmpty': 'emptyMemory',
				'click .removeTask': 'removeTask',
				'click .removeStory': 'removeStory',
				'change #themeSelect': 'changeTheme'
			},


			ui: {
				rightHeader: '#rightHeader',
				postItContainer: '#postItContainer',
				btPrint: '#btPrint',
				btMemo: '#btMemo',
				btVisu: '#btVisu',
				btTache: "#btTache",
				btStory: "#btStory",
				btPP: "#btPP",
				icoHasData: "#icoHasData",
				btEmpty: "#btEmpty",
				inputMoreInfo: ".inputLittleTask",
				myThemeSelector: '#themeSelect'
			},
			//Mémoire des infos relative au sprint en cour.
			postItMemory: {
				memberId: '',
				memberName: '',
				memberInitial: '',
				//Contient l'ensemble des story, plus leur taches
				//story.isInSprint -> story a transformer en postIt
				//story.tasks[n].isInSprint -> tache a transformer en postIt
				relativStories: '',
				projectId: '',
				projectName: '',
				projectMember: '',
				backUpStories: []
			},

			initialize: function(options){
				Backbone.on('createStoryPostIt', this.createStoryPostIt, this);
				this.sharedMemory = options.mem;
			},
			
			onShow: function (options) {
				var _this = this;
				this.$el.i18n();	
				if(_this.sharedMemory.relativStories.length > 0){
					_this.ui.btPrint.removeAttr('disabled');
					_this.ui.btVisu.removeAttr('disabled');
					_this.ui.btEmpty.removeAttr('disabled');
					_this.ui.btTache.removeAttr('disabled');
					_this.ui.btStory.removeAttr('disabled');
					_this.ui.btPP.removeAttr('disabled');
				}	
			},

			//Affiche les différentes stories dans des vues avec des checkboxes de selection
			//Panneau gauche
			drawStoriesChoice: function (stories) {
				var StoryModel = Backbone.Model.extend({});
				var StoryColl = Backbone.Collection.extend({
					model: StoryModel
				});

				var StoryChildView = Backbone.Marionette.ItemView.extend({
					tagName: "ul",
					template: 'app/base/postit/tpl/tpl-littleStory.html',
				});

				var StoryCollectionView = Backbone.Marionette.CollectionView.extend({
					childView: StoryChildView,
				});

				var storyColl = new StoryColl(stories);
				var storyCollView = new StoryCollectionView({ collection: storyColl });

				storyCollView.render();
				this.ui.divStories.html(storyCollView.el);
			},
			//Affiche les différentes taches dans des vues avec des checkboxes de selection
			//Panneau gauche
			drawTasksChoice: function (tasks, elt) {
				var TaskModel = Backbone.Model.extend({});
				var TaskColl = Backbone.Collection.extend({
					model: TaskModel
				});

				var TaskChildView = Backbone.Marionette.ItemView.extend({
					tagName: "ul",
					template: 'app/base/postit/tpl/tpl-littleTask.html',
					onRender: function () {
						elt.append(taskCollView.el);
					}
				});

				var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
					childView: TaskChildView,
				});

				var taskColl = new TaskColl(tasks);
				var taskCollView = new TaskCollectionView({ collection: taskColl });

				taskCollView.render();
			},

			//Cré les post it sur l'écran de droite
			createStoryPostIt: function (e) {
				var boolAllElement = true;
				var tabModifToInsert = []
				if ($('.inputLittleTask').length) {
					console.log('on est la ;');
					$('.inputLittleTask').each(function (index, elem) {
						var objMaj = {
							story_id: "0",
							task_id: "0",
							newOwn: "",
							newDur: "",
						}
						if ($(elem).val() == "" || $(elem).val() === undefined) {
							boolAllElement = false;
							return;
						} else {
							var tabInfoNIds = $(elem).attr('id').split('_');
							var infoName = tabInfoNIds[0];
							var tabIds = tabInfoNIds[1].split('&');
							objMaj.story_id = tabIds[1];
							objMaj.task_id = tabIds[0];
							if (infoName == "dur") {
								objMaj.newDur = $(elem).val();
							}
							if (infoName == "own") {
								objMaj.newOwn = $(elem).val();
							}
							tabModifToInsert.push(objMaj);
						}
					});
				}
				if (boolAllElement) {
					var _this = this;
					if (_this.ui.postItContainer.children().length) {
						_this.ui.postItContainer.children().remove();
					}
					_this.ui.rightHeader.children().find('button').removeAttr('disabled');
					_this.ui.btPrint.removeAttr('disabled');
					_this.ui.btVisu.removeAttr('disabled');
					_this.ui.btMemo.removeAttr('disabled');
					_this.ui.btPrint.removeAttr('disabled');
					_this.ui.btVisu.removeAttr('disabled');
					/*var StoryModel = Backbone.Model.extend({});*/
					var selectedSories = [];
					console.log('Schtroudel Before ',_this.sharedMemory.relativStories);
					$.each(_this.sharedMemory.relativStories, function () {
						var story = this;
						if (tabModifToInsert.length) {
							$.each(tabModifToInsert, function (index, obj) {
								if (story.id == obj.story_id) {
									$.each(story.tasks, function (index, value) {
										if (value.id == obj.task_id) {
											if (obj.newOwn != "") {
												value.owner_initial = obj.newOwn;
											}
											if (obj.newDur != "") {
												value.duree = obj.newDur;
												if (obj.newDur == 0) {
													value.addedClass = imgDureeClassObj[0];
												} else if (obj.newDur < 5) {
													value.addedClass = imgDureeClassObj[1];
												} else if (obj.newDur < 9) {
													value.addedClass = imgDureeClassObj[5];
												} else if (obj.newDur < 13) {
													value.addedClass = imgDureeClassObj[9];
												} else if (obj.newDur < 15) {
													value.addedClass = imgDureeClassObj[13];
												} else {
													value.addedClass = imgDureeClassObj[15];
												}
												//TODO : SET Les bonnes images
											}
										}
									})
								}
							});
						}
						if (this.isInSprint) {

							selectedSories.push(this);
							//selectedSories = selectedSories.concat(_this.sharedMemory.relativStories);
						}
					});
					drawStoryPostIt(selectedSories, $("#postItContainer"));
				} else {
					alert("Veuillez remplir les informations manquantes dans le panel de gauche");
				}
			},

			//Cré les post it sur l'écran de droite
			createTachePostIt: function (e) {
				var _this = this;
				if (_this.ui.postItContainer.children().length) {
					_this.ui.postItContainer.children().remove();
				}
				var selectedTasks = [];
				$.each(_this.sharedMemory.relativStories, function () {
					if (this.isInSprint) {
						$.each(this.tasks, function () {
							if (this.isInSprint && !this.isPairProg) {
								selectedTasks.push(this);
							}
						});
					}
				});
				drawTaskPostIt(selectedTasks, $("#postItContainer"));
			},

			createTachePPPostIt: function (e) {
				var _this = this;
				if (_this.ui.postItContainer.children().length) {
					_this.ui.postItContainer.children().remove();
				}
				var selectedTasks = [];
				$.each(_this.sharedMemory.relativStories, function () {
					if (this.isInSprint) {
						$.each(this.tasks, function () {
							if (this.isInSprint && this.isPairProg) {
								selectedTasks.push(this);
							}
						});
					}
				});
				drawTaskPostIt(selectedTasks, $("#postItContainer"));
			},

			printPostIt1: function (e) {
				var _this = this;
				var pageConter = {
					pStory: 0,
					pTask: 0,
					pTaskPP: 0,
				}
				$("#postItContainer").children().remove();
				var allStories = _this.sharedMemory.relativStories;
				console.log("toprint", allStories);
				var infos = runDrawing(allStories, true);
			},

			memoriseStory: function () {
				var _this = this;
				var parsed = JSON.parse(localStorage.getItem('backupedStories'));
				if(parsed != null){
					var temp = parsed.filter(o => !Array.isArray(o));
				}
				if (temp) {
					var backupedStories = temp;
					var tabLsStories = backupedStories.map(o => o.id);				
					var tabRelStories = _this.sharedMemory.relativStories.filter(o => o.isInSprint == true).map(o => o.id);			
					var currTasks = [].concat.apply([],backupedStories.map(o => o.tasks).concat());
					var tabStoriesToMem = tabRelStories.filter(o => tabLsStories.indexOf(o) < 0);
					var tabTasksToUp = [].concat.apply([],_this.sharedMemory.relativStories.filter(o => o.isInSprint == true).map(o => o.tasks)).filter(o => currTasks.indexOf(o.id) >= 0);
					for(var i in tabTasksToUp){
						var index = backupedStories.findIndex(x => x.id == tabTasksToUp[i].story_id);
						for(var j in backupedStories[index].tasks){
							if(backupedStories[index].tasks[j].id == tabTasksToUp[i].id){
								backupedStories[index].tasks[j] = tabTasksToUp[i];
							}
						}
					}
					
					backupedStories = backupedStories.concat(_this.sharedMemory.relativStories.filter(o => tabStoriesToMem.indexOf(o.id) >= 0))
				} else {
					var backupedStories = _this.sharedMemory.relativStories;
				}
				localStorage.setItem('backupedStories', JSON.stringify(backupedStories));
				console.log(backupedStories);
				//TODO : ptete la maj du tableau #resume; depénd de quand il est mis a jour
				_this.ui.btEmpty.removeAttr('disabled');
				alert("Données sauvegardée");
			},

			viewResume: function(){
				//GARDE
				console.log(_.chain(this.sharedMemory.relativStories).map(function(item) { return item.project_id }).uniq().value())
				console.log([].concat.apply([],_.chain(this.sharedMemory.relativStories).map(function(item) { return item.owner_initials }).uniq().value()));
			},

			visualizeMemo: function () {
				$("#postItContainer").children().remove();
				var _this = this;
				var allStories = [];
				if (_this.sharedMemory.backUpStories && _this.sharedMemory.backUpStories.length) {
					allStories =_this.sharedMemory.backUpStories;
				} else {
					allStories =_this.sharedMemory.relativStories;
				}
				var infos = runDrawing(allStories, false);
			},

			emptyMemory: function () {
				var r = confirm("Voulez vous vider le localStorage");
				if (r == true) {
					alert();
					localStorage.clear();
					_this.sharedMemory.backUpStories = [];
				}
			},

			removeTask: function (element) {
				var r = confirm("Voulez vous supprimer la tâche de cette plannification?");
				var theElem = $(element.currentTarget);
				if (r == true) {
					var allStories;
					if (this.sharedMemory.backUpStories.length) {
						allStories = this.sharedMemory.backUpStories;
					} else {
						allStories = this.sharedMemory.relativStories;
					}
					$.each(allStories, function (index, value) {
						var ids = theElem.attr("name").split('&');
						if (value.id == ids[0]) {
							$.each(value.tasks, function (i, v) {
								if (v.id == ids[1]) {
									v.isInSprint = false;
									theElem.closest('.vontainer').remove();
									return;
								}
							});
							return;
						}
					})
				}
			},
			removeStory: function (elem) {
				var r = confirm("Voulez vous supprimer la story et toute ses tâchesde cette plannification?");
				var theElem = $(elem.currentTarget);
				if (r == true) {
					var id = theElem.attr('name');
					var allStories;
					this.deleteNEraseAllTaskById(id);
				}
			},

			getTheSories: function () {
				var allStories;
				if (this.sharedMemory.backUpStories.length) {
					allStories = this.sharedMemory.backUpStories;
				} else {
					allStories = this.sharedMemory.relativStories;
				}
				return allStories;
			},

			deleteNEraseAllTaskById: function (storyId) {
				var stories = this.getTheSories();
				$.each(stories, function (i, v) {
					if (this.id == storyId) {
						this.isInSprint = false;
						$.each(this.tasks, function (it, vt) {
							this.isInSprint = false;
							if ($('i[name^=' + storyId + ']').length) {
								$('i[name^=' + storyId + ']').closest('.vontainer').remove();
							}
						});
						return;
					}
				});
			},

			changeTheme: function (prout, bweuuuh) {
				var classes = $('#postItContainer').attr('class');
				var tabClasses = classes.split(' ');
				tabClasses[1] = this.ui.myThemeSelector.find('option:selected').val();
				$('#postItContainer').attr('class', tabClasses.join(' '));
			}

		});
	});
