define(['jquery', 'underscore', 'marionette', 'backbone', 'initPT', 'lodash', 'bootstrap', 'postit', 'print'],
	function ($, _, Marionette, Backbone) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/user/tpl/tpl-user.html',
			className: 'home-page ns-full-height animated',
			events: {
				'change #sltProjects': 'showParam',
				'change #sltMemberships': 'feedProjects',
				'click #sendButton': 'feedStories',
				'click input[type=checkbox][id^=check_]': 'getTasks',
				'click input[type=checkbox][id^=checkTask_]': 'validTask',
				'click #validScrum': 'sendStoryPostIt',//Sendd TO postit
				'blur input[type=text][id^=prio_]': 'changePriority',
			},
			ui: {
				sltProjects: '#sltProjects',
				sltMemberships: '#sltMemberships',
				divProjects: '#divProjects',
				diviteration: '#diviteration',
				sendButton: '#sendButton',
				iterationScope: '#iterationScope',
				divStories: '#divStories',
				validScrum: '#validScrum',
			},
			initialize:function(options){
				this.sharedMemory = options.mem;
			},

			onShow: function (options) {
				var _this = this;
				this.$el.i18n();
				this.users = getAllUsers();
				$.each(this.users, function () {
					_this.ui.sltMemberships.append('<option value="' + this.id + '">' + this.name + '</option>');
				});
			},

			//Afficvhe les paramètre de scope
			showParam: function (e) {
				var _this = this;
				this.sharedMemory.memberId = $(_this.ui.sltMemberships).val();
				var tabNameInfo = $(_this.ui.sltMemberships).find(':selected').text().split('-');
				var currentUser = this.users.find(x => x.id == _this.sharedMemory.memberId);
				this.sharedMemory.memberName = currentUser.name;
				this.sharedMemory.memberInitial = currentUser.initials;
				//this.ui.diviteration.removeClass('hidden');
				this.ui.sendButton.removeClass('hidden');
			},

			//Récupère et affiche toutes les stories de la personne pour se projet
			feedStories: function (e) {
				var _this = this;
				var scope = $(_this.ui.iterationScope).children().find('input[type=radio]:checked').val();
				var allStories;
				var userId = _this.ui.sltMemberships.val();
				if ($("#divStories").children().length != 0) {
					$("#divStories").children().remove();
				}
				if (userId != 0) {
					if (scope == "" || scope === undefined) {
						scope = 'current';
						allStories = getStoriesByIteration(_this.ui.sltProjects.val(), userId, scope, _this.user.find(x => x.id == userId).initials, _this.sharedMemory.projectName);
					} else if (_this.ui.iterationScope != 'icebox') {
						allStories = getStoriesByIteration(_this.ui.sltProjects.val(), userId, scope, _this.user.find(x => x.id == userId).initials, _this.sharedMemory.projectName);
					} else {
						//TODO :: getStoriesFromIcebox
					}
				} else {
					allStories = getCurrentStoriesByProject(_this.ui.sltProjects.val(), 'current', _this.user.find(x => x.id == userId).initials, _this.sharedMemory.projectName);
				}
				_this.sharedMemory.relativStories = _this.sharedMemory.relativStories.concat(allStories);
				_this.drawStoriesChoice(allStories);
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
					template: 'app/base/project/tpl/tpl-littleStory.html',
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
					template: 'app/base/project/tpl/tpl-littleTask.html',
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

			//Récupère toutes les taches d'une story ou les effeces si on nes souhaite pas avoir cette stry
			getTasks: function (e) {
				var _this = this;
				var container = $(e.currentTarget).parent();
				var storyId = container.attr("id").split("divStoryContainer_")[1];
				if (container.children().find('div[id^=divTaskContainer_]').length) {
					container.find('div').remove();
					$.each(_this.sharedMemory.relativStories, function () {
						if (this.id == storyId) {
							this.isInSprint = false;
						}
					});
				} else {
					var tasks = getTasksByStory(_this.sharedMemory.projectId, storyId, _this.sharedMemory.memberInitial, _this.sharedMemory.projectName);
					if (tasks.length > 0) {
						$.each(_this.sharedMemory.relativStories, function () {
							if (this.id == storyId) {
								this.tasks = tasks;
								this.isInSprint = true;
							}
						});
						_this.drawTasksChoice(tasks, container);
						if ($("#validScrum").hasClass("hidden")) {
							$("#validScrum").removeClass("hidden");
						}
					} else {
						alert('Toutes les taches on le status complete pour cette story.');
						$(e.currentTarget).removeAttr('checked');
					}
				}
			},

			//Valid ou non la szelection des taches pour cette story
			validTask: function (e) {
				var _this = this;
				var myElem = $("#" + e.currentTarget.id);
				var taskId = myElem.attr('id').split('checkTask_')[1];
				var storyId = myElem.closest('div[id^=divStoryContainer_]').attr('id').split("divStoryContainer_")[1];
				$.each(_this.sharedMemory.relativStories, function () {
					if (this.id == storyId) {
						$.each(this.tasks, function () {
							if (this.id == taskId) {
								if (myElem.is(":checked")) {
									this.isInSprint = true;
								} else {
									this.isInSprint = false;
								}
								return false;
							}
						});
						return false;
					}
				});
			},

			changePriority: function (e) {
				var _this = this;
				var myElem = $("#" + e.currentTarget.id);
				var storyId = myElem.attr('id').split('prio_')[1];
				$.each(_this.sharedMemory.relativStories, function () {
					if (this.id == storyId) {
						this.priority = myElem.val();
						return false;
					}
				});
			},

			getTheSories: function () {
				var allStories;
				if (this.postItMemory.backUpStories.length) {
					allStories = this.postItMemory.backUpStories;
				} else {
					allStories = this.postItMemory.relativStories;
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

			sendStoryPostIt: function(){
				console.log('waneuguenne',Backbone.trigger('getMemory'));
				
				Backbone.trigger('createStoryPostIt');
			},

			feedProjects: function(e){
				var myElem = $("#" + e.currentTarget.id);
				var value = myElem.val();
				var allProjects = this.users.find(x => x.id == value).projects;
				console.log('lesprojets', allProjects);
				var selectProjects = $(this.ui.sltProjects);
				selectProjects.children().remove();

				for(var i in allProjects){
					selectProjects.append('<option value="' + allProjects[i].id + '">' + allProjects[i].name + '</option>');
				}
				var copntainer = $(this.ui.divProjects)
				if(copntainer.hasClass('hidden')){
					copntainer.removeClass('hidden')
				}
			}
		});
	});
