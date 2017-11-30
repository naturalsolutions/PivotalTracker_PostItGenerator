define(['jquery', 'underscore', 'marionette', 'backbone', 'bootstrap', 'lodash'],
	function ($, _, Marionette, Backbone) {
		'use strict';

		return Marionette.LayoutView.extend({
			template: 'app/base/resume/tpl/tpl-resume.html',
			className: 'home-page ns-full-height animated',
			events: {

			},

			ui: {
				tab: '#resumeTab'
			},

			currentTotal: {
				byProject: [],
				byUser: []
			},

			initialize: function (options) {
				this.sharedMemory = options.mem;
				this.show = options.show;
			},

			onShow: function (options) {
				Backbone.on('tasksAdded', this.manageResume, this);
				if (this.sharedMemory.projects && this.sharedMemory.projects.length > 0) {
					this.addProjectLines()
				} else if (this.sharedMemory.relativStories && this.sharedMemory.relativStories.length > 0) {
					console.log('dfafd', this.sharedMemory.relativStories)
					var users = [].concat.apply([], this.sharedMemory.relativStories
						.map(o => o.owner_initials))
						.filter((value, index, self) => self.indexOf(value) === index);
						console.log(users, this.sharedMemory.relativStories);
					users = _.chain(users.concat.apply([], this.sharedMemory.relativStories.map(o => o.tasks)).map(o => o.owner_initial)).uniq().value();
					var projects = [].concat.apply([], this.sharedMemory.relativStories
						.map(function (o) {
							return { id: o.project_id, name: o.project_name }
						}))
					projects = _.uniq(projects,
						function (e) {
							return JSON.stringify(e);
						})
					this.users = users;
					console.log("showtime", this.users)
					this.projects = projects;
					this.addProjectLines();
					this.addUsersColumns();
					this.printRelativ();
					this.updateTotals();
				}
				if (options.show) {
					$('#rgResume').toggleClass('hidden');
				}
			},

			parseExisting: function () {

			},

			addUsersColumns: function () {
				var usersTitle = "<th></th>";
				var usershtml = "";
				var botLineTotal = '<tr class="lineProject" id="total"><th scope="row">total</th>';
				for (var i in this.users) {
					usersTitle += '<th>' + this.users[i] + '</th>';
					usershtml += '<td id="' + this.users[i] + '" class="userTd"></td>';
					botLineTotal += '<td id="total_' + this.users[i] + '"></td>';
				}
				usersTitle += '<th>total</th>';
				botLineTotal += '<td id="total_total"></td></tr>'
				$(this.ui.tab).prepend(usersTitle);
				var lines = $('.lineProject');
				for (var i in lines) {
					if (lines[i].outerHTML) {
						$(lines[i]).append(usershtml + '<td id="total_' + $(lines[i]).attr('id') + '"></td>');
					}
				}
				$(this.ui.tab).append(botLineTotal)
			},

			addProjectLines: function () {
				for (var i in this.projects) {
					$(this.ui.tab).append('<tr class="lineProject" id="' + this.projects[i].id + '"><th scope="row">' + this.projects[i].name + '</th></tr>')
				}
			},

			printRelativ: function () {
				for (var i in this.sharedMemory.relativStories) {
					this.calcStory(this.sharedMemory.relativStories[i]);
				}
			},

			calcStory: function (story) {
				var tempSum = [];
				for (var i in story.tasks) {
					if (!story.tasks[i].isPairProg) {
						var userIndex = tempSum.findIndex(x => x.user == story.tasks[i].owner_initial);
						if (userIndex != -1) {
							tempSum[userIndex].hours += parseInt(story.tasks[i].duree);
						} else {
							tempSum.push({ user: story.tasks[i].owner_initial, hours: parseInt(story.tasks[i].duree) })
						}
					}
				}
				for (var i in tempSum) {
					this.setCell(story.project_id, tempSum[i].user, tempSum[i].hours)
				}
			},

			setCell: function (projectId, owner, hours) {
				var row = $(this.ui.tab).find('#' + projectId);
				var cell = $(row).find('#' + owner);
				var newHours = 0;
				if ($(cell).html() != "") {
					newHours = parseInt($(cell).html()) + hours;
				} else {
					newHours = hours
				}
				$(cell).html(newHours);
			},

			updateTotals: function () {
				var _this = this;
				var rows = $(this.ui.tab).find('tr.lineProject');
				for (var i in rows) {
					var tempProjectHours = 0;
					if (rows[i].className == "lineProject") {
						var cols = $(rows[i]).find('td.userTd').each(function () {
							if (this.className == "userTd") {
								var userIndex = _this.currentTotal.byUser.findIndex(x => x.user == $(this).attr('id'));
								if (!isNaN(parseInt($(this).html()))) {
									if (userIndex == -1) {
										_this.currentTotal.byUser.push({ user: $(this).attr('id'), hours: parseInt($(this).html()) });
									} else {
										_this.currentTotal.byUser[userIndex].hours += parseInt($(this).html());
									}
									tempProjectHours += parseInt($(this).html());
								}
							}
						});
						if ($(rows[i]).attr('id') != 'total') {
							var projIndex = _this.currentTotal.byProject.findIndex(x => x.id == $(rows[i]).attr('id'));
							if (projIndex == -1) {
								_this.currentTotal.byProject.push({ id: $(rows[i]).attr('id'), hours: tempProjectHours });
							} else {
								_this.currentTotal.byProject[projIndex].hours = tempProjectHours;
							}
						} else {
							var sum = _this.currentTotal.byProject.map(o => o.hours).reduce((a, b) => a + b, 0)
							var projIndex = _this.currentTotal.byProject.findIndex(x => x.id == $(rows[i]).attr('id'));
							if (projIndex == -1) {
								_this.currentTotal.byProject.push({ id: $(rows[i]).attr('id'), hours: sum });
							} else {
								_this.currentTotal.byProject[projIndex].hours = sum;
							}
						}
					}
				}
				for(var k in _this.currentTotal.byProject){
					$('#total_' + _this.currentTotal.byProject[k].id).html(_this.currentTotal.byProject[k].hours)	
				}
				for(var l in _this.currentTotal.byUser){
					$('#total_' + _this.currentTotal.byUser[l].user).html(_this.currentTotal.byUser[l].hours)	
				}
			}


		});
	});
