define(['jquery','underscore','marionette', 'backbone', 'i18n','bootstrap','../../modules/PT_initHome','print'],
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
				btPrint: '#btPrint'
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
				projectMember:''
			},


/*			animateIn: function() {
				this.$el.removeClass('zoomOutDown');
				this.$el.addClass('zoomInDown');
				this.$el.animate(
					{ opacity: 1 },
					500,
					_.bind(this.trigger, this, 'animateIn')
					);
			},

			animateOut: function() {
				this.$el.removeClass('zoomInUp');
				this.$el.animate(
					{ opacity : 0 },
					500,
					_.bind(this.trigger, this, 'animateOut')
					);
			},
			*/




			onShow : function(options) {
				var _this = this;
				this.$el.i18n();
				var projects = getAllProjects();
				$.each(projects, function(){
					_this.ui.sltProjects.append('<option value="'+this.id+'">'+this.name+'</option>');
				});
				//Rapidité a supprimer
				_this.ui.divMembership.removeClass('hidden');
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
					allStories = getStoriesByIteration("536841","1674902",scope, _this.postItMemory.projectMember);
				}else if(_this.ui.iterationScope != 'icebox'){
					allStories = getStoriesByIteration("536841","1674902",scope, _this.postItMemory.projectMember);
				}else{
					//TODO :: getStoriesFromIcebox
				}
				_this.postItMemory.relativStories = allStories;
				_this.drawStoriesChoice(allStories);
				//Fin de trucs a supprimer
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
				var memberships = getMembership($(_this.ui.sltProjects).val());
				_this.postItMemory.projectMember = memberships;
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
				if(scope == "" || scope === undefined){
					scope = 'current';
					allStories = getStoriesByIteration(_this.ui.sltProjects.val(),_this.ui.sltMemberships.val(),scope,_this.postItMemory.projectMember);
				}else if(_this.ui.iterationScope != 'icebox'){
					allStories = getStoriesByIteration(_this.ui.sltProjects.val(),_this.ui.sltMemberships.val(),scope,_this.postItMemory.projectMember);
				}else{
					//TODO :: getStoriesFromIcebox
				}
				_this.postItMemory.relativStories = allStories;
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
					tagName: "tr",
					template: 'app/base/home/tpl/tpl-littleStory.html',
				});

				var StoryCollectionView = Backbone.Marionette.CollectionView.extend({
					tagName: "table",
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
					tagName: "tr",
					template: 'app/base/home/tpl/tpl-littleTask.html',
				});

				var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
					tagName: "table",
					childView: TaskChildView,
				});

				var taskColl = new TaskColl(tasks);
				var taskCollView = new TaskCollectionView({ collection: taskColl  });

				taskCollView.render();
				elt.append(taskCollView.el);
			},

			//Récupère toutes les taches d'une story ou les effeces si on nes souhaite pas avoir cette stry
			getTasks: function(e){
				var _this = this;
				var container = $(e.currentTarget).parent().parent();
				var storyId = container.attr("id").split("divStoryContainer_")[1];
				if(container.children().find('div[id^=divTaskContainer_]').length){
					container.children().find('div[id^=divTaskContainer_]').remove();
					$.each(_this.postItMemory.relativStories,function(){
						if(this.id == storyId){
							this.isInSprint = false;
						}
					});
				}else{
					var tasks = getTasksByStory(_this.postItMemory.projectId,storyId);
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
				var _this = this;
				if(_this.ui.postItContainer.children().length){
					_this.ui.postItContainer.children().remove();
				}
				_this.ui.rightHeader.children().find('button').removeAttr('disabled');
				_this.ui.btPrint.removeAttr('disabled');
				var StoryModel = Backbone.Model.extend({});
				var selectedSories = [];
				$.each(_this.postItMemory.relativStories, function(){
					if(this.isInSprint){
						selectedSories.push(this);
					}
				});
				var StoryColl = Backbone.Collection.extend({
					model: StoryModel,
				});

				var StoryChildView = Backbone.Marionette.ItemView.extend({
					//tagName: "div",
					template: 'app/base/home/tpl/tpl-postItStory.html',

					serializeData : function() {

						var modelSerialized = this.model.toJSON();
						//	Add extra option
						modelSerialized['owner_initial'] = _this.postItMemory.memberInitial;
						modelSerialized['project_name'] = _this.postItMemory.projectName;
						return modelSerialized;
					},
					onRender:function(){
						this.$el.addClass('col-md-4');
					}

				});

				var StoryCollectionView = Backbone.Marionette.CollectionView.extend({
					//tagName: 'div',
					childView: StoryChildView,
					childViewContainer: "#allPostIt",
					template: 'app/base/home/tpl/tpl-postItContainer.html'
				});
				var storyColl = new StoryColl(selectedSories);
				var storyCollView = new StoryCollectionView({ collection: storyColl  });

				storyCollView.render();
				$("#postItContainer").append(storyCollView.el);
			},

			//Cré les post it sur l'écran de droite
			createTachePostIt: function(e){
				var _this = this;
				if(_this.ui.postItContainer.children().length){
					_this.ui.postItContainer.children().remove();
				}
				var TaskModel = Backbone.Model.extend({});
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
				var TaskColl = Backbone.Collection.extend({
					model: TaskModel,
				});

				var TaskChildView = Backbone.Marionette.ItemView.extend({
					//tagName: "div",
					template: 'app/base/home/tpl/tpl-postItTache.html',
					serializeData : function() {

						var modelSerialized = this.model.toJSON();
						//	Add extra option
						modelSerialized['owner_initial'] = _this.postItMemory.memberInitial;
						modelSerialized['project_name'] = _this.postItMemory.projectName;
						console.log(this.model.collection.length);
						modelSerialized['FirstPostion'] = this.model.get('position') % 3 == 1;
						return modelSerialized;
					},
					onRender:function(){
						this.$el.addClass('col-md-4');
					}
				});

				var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
					//tagName: 'div',
					childView: TaskChildView,
					childViewContainer: "#allPostIt",
					template: 'app/base/home/tpl/tpl-postItContainer.html',
					onRender:function(){
						this.$el.addClass('row');
					}
				});
				var taskColl = new TaskColl(selectedTasks);
				var taskCollView = new TaskCollectionView({ collection: taskColl  });

				taskCollView.render();
				$("#postItContainer").append(taskCollView.el);
			},

			createTachePPPostIt: function(e){
				var _this = this;
				if(_this.ui.postItContainer.children().length){
					_this.ui.postItContainer.children().remove();
				}
				var TaskModel = Backbone.Model.extend({});
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
				var TaskColl = Backbone.Collection.extend({
					model: TaskModel,
				});

				var TaskChildView = Backbone.Marionette.ItemView.extend({
					//tagName: "div",
					template: 'app/base/home/tpl/tpl-postItTache.html',
					serializeData : function() {

						var modelSerialized = this.model.toJSON();
						//	Add extra option
						modelSerialized['project_name'] = _this.postItMemory.projectName;

						modelSerialized['FirstPostion'] = this.model.get('position') % 3 == 1;

						return modelSerialized;
					},
					onRender:function(){
						this.$el.addClass('col-md-4');
					}
				});
				var TaskCollectionView = Backbone.Marionette.CollectionView.extend({
					//tagName: 'div',
					childView: TaskChildView,
					childViewContainer: "#allPostIt",
					template: 'app/base/home/tpl/tpl-postItContainer.html',
					onRender:function(){
						this.$el.addClass('row');
					}
				});
				var taskColl = new TaskColl(selectedTasks);
				var taskCollView = new TaskCollectionView({ collection: taskColl  });

				taskCollView.render();
				$("#postItContainer").append(taskCollView.el);
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
				_this.ui.postItContainer.children().print({stylesheet:'app/styles/externalCssPrintable.css'});
			}

		});
});
