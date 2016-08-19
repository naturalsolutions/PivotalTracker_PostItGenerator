define(['jquery','underscore','marionette', 'backbone', 'bootstrap','../../modules/PT_initHome','../../modules/PT_postIt','print'],
	function($,_,Marionette, Backbone) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/home/tpl/tpl-home.html',
			className: 'home-page ns-full-height animated',
			events: {
				'change #sltProjects' : 'feedMemberShip',
				'change #sltMemberships' : 'showParam',
				'click #sendButton' : 'feedStories',
				'click input[type=checkbox][id^=check_]': 'getTasks',
				'click input[type=checkbox][id^=checkTask_]': 'validTask',
				'click #validScrum' : 'createStoryPostIt',
				'blur input[type=text][id^=prio_]': 'changePriority',
				'click #btStory':'createStoryPostIt',
				'click #btTache':'createTachePostIt',
				'click #btPP':'createTachePPPostIt',
				'click #btPrint':'printPostIt1',
				'click #btMemo':'memoriseStory',
				'click #btVisu':'visualizeMemo',
				'click #btEmpty':'emptyMemory',
				'click .removeTask':'removeTask',
				'click .removeStory':'removeStory',
				'change #themeSelect':'changeTheme'
			},


			ui : {
				sltProjects : '#sltProjects',
				sltMemberships : '#sltMemberships',
				divMembership : '#divMembership',
				diviteration : '#diviteration',
				sendButton : '#sendButton',
				iterationScope : '#iterationScope',
				divStories:'#divStories',
				validScrum:'#validScrum',
				rightHeader:'#rightHeader',
				postItContainer:'#postItContainer',
				btPrint: '#btPrint',
				btMemo: '#btMemo',
				btVisu: '#btVisu',
				btTache: "#btTache",
				btStory: "#btStory",
				btPP: "#btPP",
				icoHasData : "#icoHasData",
				btEmpty : "#btEmpty",
				inputMoreInfo: ".inputLittleTask",
				myThemeSelector: '#themeSelect'
			},
			//Mémoire des infos relative au sprint en cour.
			postItMemory:{
				memberId : '',
				memberName :'',
				memberInitial:'',
				//Contient l'ensemble des story, plus leur taches
				//story.isInSprint -> story a transformer en postIt
				//story.tasks[n].isInSprint -> tache a transformer en postIt
				relativStories : '',
				projectId : '',
				projectName : '',
				projectMember:'',
				backUpStories: []
			},

			onShow : function(options) {
				var _this = this;
				this.$el.i18n();
				var projects = getAllProjects();
				$.each(projects, function(){
					_this.ui.sltProjects.append('<option value="'+this.id+'">'+this.name+'</option>');
				});
				//******************Rapidité a supprimer (code simulant un comportement utilisateur)*****************//
				/*_this.ui.divMembership.removeClass('hidden');
				_this.postItMemory.projectId = 536841;
				_this.postItMemory.projectName = "TRACK";
				var memberships = getMembership(536841);
				_this.postItMemory.projectMember = memberships;
				$.each(memberships, function(){
					_this.ui.sltMemberships.append('<option value="'+this.id+'">'+this.nom+'</option>');
				});
				_this.postItMemory.memberId = 0;
				_this.postItMemory.memberName = "David Lassagne";
				_this.postItMemory.memberInitial = "DL";
				_this.ui.diviteration.removeClass('hidden');
				_this.ui.sendButton.removeClass('hidden');
				var scope = "current";
				var allStories ;
				if(_this.ui.scope == "" || _this.ui.scope === undefined){
					scope = 'current';
					allStories = getStoriesByIteration("536841","1674902",scope, _this.postItMemory.projectMember,_this.postItMemory.projectName);
				}else if(_this.ui.iterationScope != 'icebox'){
					allStories = getStoriesByIteration("536841","1674902",scope, _this.postItMemory.projectMember,_this.postItMemory.projectName);
				}else{
					//TODO :: getStoriesFromIcebox
				}
				_this.postItMemory.relativStories = allStories;
				_this.drawStoriesChoice(allStories);*/
				//Fin de trucs a supprimer
				if(localStorage.getItem('backupedStories') != null){
					_this.postItMemory.relativStories = JSON.parse(localStorage.getItem('backupedStories'));
					_this.ui.btPrint.removeAttr('disabled');
					_this.ui.btVisu.removeAttr('disabled');
					_this.ui.btEmpty.removeAttr('disabled');
					_this.ui.btTache.removeAttr('disabled');
					_this.ui.btStory.removeAttr('disabled');
					_this.ui.btPP.removeAttr('disabled');
				}else{
					_this.postItMemory.relativStories = [];
				}
			},

			//Récupère les membres du projets sélectionner et les affiches dans la list sltMemberships
			feedMemberShip: function(e){
				var _this = this;
				if($(_this.ui.sltProjects).val() != "" && $(_this.ui.sltProjects).val() !== undefined){
					_this.ui.divMembership.removeClass('hidden');
				}

				_this.postItMemory.projectId = $(_this.ui.sltProjects).val();
				_this.postItMemory.projectName = $(_this.ui.sltProjects).find(':selected').text();
				_this.ui.sltMemberships.children().remove();
				_this.ui.sltMemberships.append('<option value=""></option>')
				var memberships = getMembership($(_this.ui.sltProjects).val());
				_this.postItMemory.projectMember = memberships;
				_this.ui.sltMemberships.append('<option value="0">Toutes les tâches</option>');
				$.each(memberships, function(){
					_this.ui.sltMemberships.append('<option value="'+this.id+'">'+this.nom+'-'+this.initials+'</option>');
				});
			},

			//Afficvhe les paramètre de scope
			showParam: function(e){
				var _this = this;
				_this.postItMemory.memberId = $(_this.ui.sltMemberships).val();
				var tabNameInfo = $(_this.ui.sltMemberships).find(':selected').text().split('-');
				_this.postItMemory.memberName = tabNameInfo[0];
				_this.postItMemory.memberInitial = tabNameInfo[1];
				_this.ui.diviteration.removeClass('hidden');
				_this.ui.sendButton.removeClass('hidden');
			},

			//Récupère et affiche toutes les stories de la personne pour se projet
			feedStories: function(e){
				var _this = this;
				var scope = $(_this.ui.iterationScope).children().find('input[type=radio]:checked').val();
				var allStories ;
				if($("#divStories").children().length != 0){
					$("#divStories").children().remove();
				}
				if(_this.ui.sltMemberships.val() != 0){
					if(scope == "" || scope === undefined){
						scope = 'current';
						allStories = getStoriesByIteration(_this.ui.sltProjects.val(),_this.ui.sltMemberships.val(),scope,_this.postItMemory.projectMember,_this.postItMemory.projectName);
					}else if(_this.ui.iterationScope != 'icebox'){
						allStories = getStoriesByIteration(_this.ui.sltProjects.val(),_this.ui.sltMemberships.val(),scope,_this.postItMemory.projectMember,_this.postItMemory.projectName);
					}else{
						//TODO :: getStoriesFromIcebox
					}
				}else{
					allStories = getCurrentStoriesByProject(_this.ui.sltProjects.val(),'current',_this.postItMemory.projectMember,_this.postItMemory.projectName);
				}
				_this.postItMemory.relativStories = _this.postItMemory.relativStories.concat(allStories);
				_this.drawStoriesChoice(allStories);
			},

			//Uselesss
			drawPostIt: function(stories){
				var postit = [{ name: 'moe', age: 44, userid: 'moe1' },
				{ name: 'larry', age: 44, userid: 'larry1' },
				{ name: 'curly', age: 44, userid: 'curly1' }];

				var PostitModel = Backbone.Model.extend({});
				var PostitColl = Backbone.Collection.extend({
					model: PostitModel
				});

				var PostitChildView = Backbone.Marionette.ItemView.extend({
					tagName: "tr",
					template: 'app/base/home/tpl/test.html',
				});

				var PostitCollectionView = Backbone.Marionette.CollectionView.extend({
					tagName: "#divStories table",
					childView: PostitChildView,
				});

				var postitColl = new PostitColl(postit);
				var postitCollView = new PostitCollectionView({ collection: postitColl  });

				postitCollView.render();
				this.ui.postit.html(postitCollView.el);
			},

			//Affiche les différentes stories dans des vues avec des checkboxes de selection
			//Panneau gauche
			drawStoriesChoice: function(stories){
				var StoryModel = Backbone.Model.extend({});
				var StoryColl = Backbone.Collection.extend({
					model: StoryModel
				});

				var StoryChildView = Backbone.Marionette.ItemView.extend({
					tagName: "ul",
					template: 'app/base/home/tpl/tpl-littleStory.html',
				});

				var StoryCollectionView = Backbone.Marionette.CollectionView.extend({
					childView: StoryChildView,
				});

				var storyColl = new StoryColl(stories);
				var storyCollView = new StoryCollectionView({ collection: storyColl  });

				storyCollView.render();
				this.ui.divStories.html(storyCollView.el);
			},
			//Affiche les différentes taches dans des vues avec des checkboxes de selection
			//Panneau gauche
			drawTasksChoice: function(tasks, elt){
				var TaskModel = Backbone.Model.extend({});
				var TaskColl = Backbone.Collection.extend({
					model: TaskModel
				});

				var TaskChildView = Backbone.Marionette.ItemView.extend({
					tagName: "ul",
					template: 'app/base/home/tpl/tpl-littleTask.html',
					onRender: function(){
						elt.append(taskCollView.el);
					}
				});

				var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
					childView: TaskChildView,
				});

				var taskColl = new TaskColl(tasks);
				var taskCollView = new TaskCollectionView({ collection: taskColl  });

				taskCollView.render();
			},

			//Récupère toutes les taches d'une story ou les effeces si on nes souhaite pas avoir cette stry
			getTasks: function(e){
				var _this = this;
				var container = $(e.currentTarget).parent();
				var storyId = container.attr("id").split("divStoryContainer_")[1];
				if(container.children().find('div[id^=divTaskContainer_]').length){
					container.find('div').remove();
					$.each(_this.postItMemory.relativStories,function(){
						if(this.id == storyId){
							this.isInSprint = false;
						}
					});
				}else{
					var tasks = getTasksByStory(_this.postItMemory.projectId,storyId,_this.postItMemory.memberInitial,_this.postItMemory.projectName);
					if(tasks.length >0){
						$.each(_this.postItMemory.relativStories,function(){
							if(this.id == storyId){
								this.tasks = tasks;
								this.isInSprint = true;
							}
						});
						_this.drawTasksChoice(tasks,container);
						if($("#divValid").hasClass("hidden")){
							$("#divValid").removeClass("hidden");
						}
					}else{
						alert('Toutes les taches on le status complete pour cette story.');
						$(e.currentTarget).removeAttr('checked');
					}
				}
			},

			//Cré les post it sur l'écran de droite
			createStoryPostIt: function(e){
				var boolAllElement = true;
				var tabModifToInsert = []
				if($('.inputLittleTask').length){
					$('.inputLittleTask').each(function(index,elem){
						var objMaj = {
							story_id:"0",
							task_id:"0",
							newOwn:"",
							newDur:"",
						}
						if($(elem).val() == "" || $(elem).val() === undefined){
							boolAllElement = false;
							return;
						}else{
							var tabInfoNIds = $(elem).attr('id').split('_');
							var infoName = tabInfoNIds[0];
							var tabIds = tabInfoNIds[1].split('&');
							objMaj.story_id = tabIds[1];
							objMaj.task_id = tabIds[0];
							if(infoName == "dur"){
								objMaj.newDur = $(elem).val();
							}
							if(infoName == "own"){
								objMaj.newOwn = $(elem).val();
							}
							tabModifToInsert.push(objMaj);
						}
					});
				}
				if(boolAllElement){
					var _this = this;
					if(_this.ui.postItContainer.children().length){
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
					console.log('Schtroudel Before ',_this.postItMemory.relativStories);
					$.each(_this.postItMemory.relativStories, function(){
						var story = this;
						if(tabModifToInsert.length){
							$.each(tabModifToInsert,function(index,obj){
								if(story.id == obj.story_id){
									$.each(story.tasks,function(index,value){
										if(value.id == obj.task_id){
											if(obj.newOwn != ""){
												value.owner_initial = obj.newOwn;
											}
											if(obj.newDur != ""){
												value.duree = obj.newDur;
												if(obj.newDur == 0){
													value.addedClass = imgDureeClassObj[0];
												}else if(obj.newDur < 5){
													value.addedClass = imgDureeClassObj[1];
												}else if (obj.newDur < 9){
													value.addedClass = imgDureeClassObj[5];
												}else if (obj.newDur < 13){
													value.addedClass = imgDureeClassObj[9];
												}else if (obj.newDur < 15){
													value.addedClass = imgDureeClassObj[13];
												}else{
													value.addedClass = imgDureeClassObj[15];
												}
												//TODO : SET Les bonnes images
											}
										}
									})
								}
							});
						}
						if(this.isInSprint){

							selectedSories.push(this);
							//selectedSories = selectedSories.concat(_this.postItMemory.relativStories);
						}
					});
					console.log('Schtroudel After',_this.postItMemory.relativStories);
					drawStoryPostIt(selectedSories,$("#postItContainer"));
				}else{
					alert("Veuillez remplir les informations manquantes dans le panel de gauche");
				}
			},

			//Cré les post it sur l'écran de droite
			createTachePostIt: function(e){
				var _this = this;
				if(_this.ui.postItContainer.children().length){
					_this.ui.postItContainer.children().remove();
				}
				var selectedTasks = [];
				$.each(_this.postItMemory.relativStories, function(){
					if(this.isInSprint){
						$.each(this.tasks,function(){
							if(this.isInSprint && !this.isPairProg){
								selectedTasks.push(this);
							}
						});
					}
				});
				drawTaskPostIt(selectedTasks,$("#postItContainer"));
			},

			createTachePPPostIt: function(e){
				var _this = this;
				if(_this.ui.postItContainer.children().length){
					_this.ui.postItContainer.children().remove();
				}
				var selectedTasks = [];
				$.each(_this.postItMemory.relativStories, function(){
					if(this.isInSprint){
						$.each(this.tasks,function(){
							if(this.isInSprint && this.isPairProg){
								selectedTasks.push(this);
							}
						});
					}
				});
				drawTaskPostIt(selectedTasks,$("#postItContainer"));
			},

			//Valid ou non la szelection des taches pour cette story
			validTask: function(e){
				var _this = this;
				var myElem = $("#"+e.currentTarget.id);
				var taskId = myElem.attr('id').split('checkTask_')[1];
				var storyId = myElem.closest('div[id^=divStoryContainer_]').attr('id').split("divStoryContainer_")[1];
				$.each(_this.postItMemory.relativStories,function(){
					if(this.id == storyId){
						$.each(this.tasks, function(){
							if(this.id == taskId){
								if(myElem.is(":checked")){
									this.isInSprint = true;
								}else{
									this.isInSprint = false;
								}
								return false;
							}
						});
						return false;
					}
				});
			},

			changePriority: function(e){
				var _this = this;
				var myElem = $("#"+e.currentTarget.id);
				var storyId = myElem.attr('id').split('prio_')[1];
				$.each(_this.postItMemory.relativStories,function(){
					if(this.id == storyId){
						this.priority = myElem.val();
						return false;
					}
				});
			},

			printPostIt1:function(e){
				var _this = this;
				var pageConter = {
					pStory : 0,
					pTask : 0,
					pTaskPP : 0,
				}
				$("#postItContainer").children().remove();
				var allStories = [];
				if(_this.postItMemory.backUpStories.length){
					alert("c'est pas bon");
					allStories = _this.postItMemory.backUpStories;
				}else{
					allStories = _this.postItMemory.relativStories;
				}
				var infos = runDrawing(allStories, true);
			},

			memoriseStory: function(){
				var _this = this;
				var selectedSories = [];
				var isPresent = false;
				if(JSON.parse(localStorage.getItem('backupedStories'))){
					var backupedStories = JSON.parse(localStorage.getItem('backupedStories'));
				}else{
					var backupedStories = [];
				}
				console.log('_this.postItMemory.backupedStories',backupedStories);
				console.log('_this.postItMemory.relativStories',_this.postItMemory.relativStories);
				$.each(_this.postItMemory.relativStories, function(){
					var story = this;
					if(this.isInSprint){
						isPresent = false;
						$.each(backupedStories,function(){
							if(this.id == story.id){
								isPresent = true;
							}
						});
						if(!isPresent){
							backupedStories.push(this);

						}
					}
				});
				localStorage.setItem('backupedStories',JSON.stringify(backupedStories));
				_this.ui.btEmpty.removeAttr('disabled');
				alert("Données sauvegardée");
			},

			visualizeMemo: function(){
				$("#postItContainer").children().remove();
				var _this = this;
				var allStories = [];
				if(_this.postItMemory.backUpStories.length){
					alert('mesCouilles');
					allStories = _this.postItMemory.backUpStories;
				}else{
					allStories = _this.postItMemory.relativStories;
				}
				var infos = runDrawing(allStories, false);
			},

			emptyMemory: function(){
				var r = confirm("Voulez vous vider le localStorage");
				if (r == true) {
					alert();
					localStorage.clear();
					_this.postItMemory.backUpStories = [];
				}
			},

			removeTask: function(element){
				var r = confirm("Voulez vous supprimer la tâche de cette plannification?");
				var theElem = $(element.currentTarget);
				if(r == true){
					var allStories;
					if(this.postItMemory.backUpStories.length){
						allStories = this.postItMemory.backUpStories;
					}else{
						allStories = this.postItMemory.relativStories;
					}
					$.each(allStories, function(index,value){
						var ids = theElem.attr("name").split('&');
						if(value.id == ids[0]){
							$.each(value.tasks, function(i,v){
								if(v.id == ids[1]){
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
//TODO : Finir!
			removeStory: function(elem){
				var r = confirm("Voulez vous supprimer la story et toute ses tâchesde cette plannification?");
				var theElem = $(elem.currentTarget);
				if(r == true){
					var id = theElem.attr('name');
					var allStories;
					this.deleteNEraseAllTaskById(id);
				}
			},

			getTheSories: function(){
				var allStories;
				if(this.postItMemory.backUpStories.length){
					allStories = this.postItMemory.backUpStories;
				}else{
					allStories = this.postItMemory.relativStories;
				}
				return allStories;
			},

			deleteNEraseAllTaskById : function(storyId){
				var stories = this.getTheSories();
				$.each(stories, function(i,v){
					if(this.id == storyId){
						this.isInSprint = false;
						$.each(this.tasks,function(it,vt){
							this.isInSprint = false;
							if($('i[name^=' + storyId + ']').length){
								$('i[name^=' + storyId + ']').closest('.vontainer').remove();
							}
						});
						return;
					}
				});
			},

			changeTheme:function(prout, bweuuuh){
				var classes = $('#postItContainer').attr('class');
				var tabClasses = classes.split(' ');
				tabClasses[1] = this.ui.myThemeSelector.find('option:selected').val();
				$('#postItContainer').attr('class', tabClasses.join(' '));
			}

		});
});
