/*
Fichier d'accès a l'ensemble des données de pivotal tracker.
Tous les ajax on été passé en synchrone pour garantir la cohérence des données
ainsi que l'éxécution en étapes.
Documantation api PT dispo sur : https://www.pivotaltracker.com/help/api/rest/v5
*/

var imgDureeClassObj = {
	0:'durre0',
	1:'durre1_4',
	5:'durre5_8',
	9:'durre9_12',
	13:'durre13_14',
	15:'durre14plus'
}

var themes = {
	0:'meme',
	1:'animaux'
}

///Récupère l'ensemble des membres d'un projet.
///Param : projectId -> id du projet dans PT
///Return : [objects] repésentant les personnes impliquées dans le projet
function getMembership(projectId){
	var myMemberships;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/"+projectId+"/memberships",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			myMemberships = data;
		},
		error: function(){
			alert("Cannot get data");
		}
	});
	var localMember = [];
	$.each(myMemberships,function(){
		localMember.push({id:this.person.id, initials:this.person.initials,nom:this.person.name})
	});
	return localMember;
}

///Récupère l'ensemble des projets de NS via le token de FB.
///Param : none
///Return : [objects] repésentant les projets de NS
function getAllProjects() {
	var myProjects;
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			myProjects = data;
		},
		error: function(){
			alert("Cannot get data");
		}
	});
	return myProjects;
}

///Récupère l'ensemble des des stories d'un projet,
/// N'EST PAS UTILE
///Param : projectId -> id du projet dans PT
///Return : [objects] repésentant les stories pour une personne sur un projet
function getStoriesByProjectAndMember(projectId,member){
	var myStories
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/"+projectId+"/stories",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		data : 'filter=current_state: unstarted',//+member
		success: function (data) {
			myStories = data;
		},
		error: function(){
			alert("Cannot get data");
		}
	});
	return myStories;
}

///Récupère l'ensemble des des stories d'un projet,
///Puis les tris pour ne garder que celles relatives a un user
///Param : projectId -> id du projet dans PT
///			member -> id de la personne
///			iterationScope -> current,icebox,backlog
///Return : [objects] repésentant les stories pour une personne sur un projet
function getStoriesByIteration(projectId,member,iterationScope, members, projectName){
	var myStoriesTemp;
	var myStories = [];
	console.log(arguments);
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/"+projectId+"/iterations",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		data : 'scope=' + iterationScope,//+member
		success: function (data) {
			myStoriesTemp = data;
		},
		error: function(){
			alert("Cannot get data");
		}
	});
	var cptPrio = 1;
	$.each(myStoriesTemp[0].stories, function(){
		if(this.current_state != 'accepted' && this.current_state != 'finished' && this.current_state != 'delivered'){
			if($.inArray(parseInt(member), this.owner_ids) != -1){
				this.isInSprint = false;
				this.owner_initials = convertIdsToMember(this.owner_ids,members);
				this.priority = cptPrio;
				cptPrio ++;
				this.project_name = projectName;
				myStories.push(this);
			}
		}
	});
	return myStories;
}

///Récupère l'ensemble des des stories d'un projet,
///Param : projectId -> id du projet dans PT
///			iterationScope -> current,icebox,backlog
///Return : [objects] repésentant les stories pour une personne sur un projet
function getCurrentStoriesByProject(projectId,iterationScope, members, projectName){
	var myStoriesTemp;
	var myStories = [];
	console.log(arguments);
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/"+projectId+"/iterations",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		data : 'scope=' + iterationScope,//+member
		success: function (data) {
			myStoriesTemp = data;
		},
		error: function(){
			alert("Cannot get data");
		}
	});
	var cptPrio = 1;
	console.log("before bouce",myStoriesTemp);
	$.each(myStoriesTemp[0].stories, function(){
		console.log("in bouce");
		if(this.current_state != 'accepted' && this.current_state != 'finished' && this.current_state != 'delivered'){
				this.isInSprint = false;
				this.owner_initials = convertIdsToMember(this.owner_ids,members);
				this.priority = cptPrio;
				cptPrio ++;
				this.project_name = projectName;
				myStories.push(this);
		}
	});
	return myStories;
}

///Récupère l'ensemble des des stories d'un projet,
///Puis les tris pour ne garder que celles relatives a un user
///Param : projectId -> id du projet dans PT
///			storyId -> id de la story dans pt
///Return : [objects] repésentant les tache pour une story
function getTasksByStory(projectId,storyId, memberInitial, projectName){
	var mytasks = [];
	$.ajax({
		url: "https://www.pivotaltracker.com/services/v5/projects/"+projectId+"/stories/"+storyId+"/tasks",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('X-TrackerToken', 'b4a752782f711a7c564221c2b0c2d5dc');
		},
		async: false,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		processData: false,
		success: function (data) {
			myTempTasks = data;
		},
		error: function(){
			alert("Cannot get data");
		}
	});
	//On assigne les différentes informations aux taches (durée, éxecutant, imgCllass)
	$.each(myTempTasks,function(){
		if(!this.complete){
			this.isInSprint = true;
			var regexPP = /\d(\+\d)+$/;
			var regexPP2 = /[A-Z]{2}(\+[A-Z]{2})+$/;
			//Taches PairPro sans noms
			var tabDescrInfo = this.description.split('.-');
			if(tabDescrInfo.length > 1){
				if(this.description.trim().match(regexPP) || this.description.trim().match(regexPP2)){
					regexPP2 = /[A-Z]{2}(\+[A-Z]{2})/;
					if(this.description.trim().match(regexPP2)){
						var ownerBrut = regexPP2.exec(this.description.trim());
						var owners = ownerBrut[0].split("+");
						this.owner_initial = owners;
						this.description = this.description.trim().replace(regexPP2, "");
						regexPP = /\d(\+\d)/;
						if(this.description.trim().match(regexPP)){
							var duree = regexPP.exec(this.description.trim())[0];
							this.duree = duree;
							this.description = this.description.trim().replace(regexPP, "");
						}else{
							this.duree = null;
						}
						this.isPairProg = true;
					}else{
						//Suite a une demande les taches paiProg sans ressources ne sont pas affichées
						this.isInSprint = false;
					}
					// console.log("Etat 1 descr : ", this.description);
					// var tabDureeBrut = regexPP.exec(this.description.trim());
					// var tabDuree = tabDureeBrut[0].split('+');
					// var duree = 0;
					// $.each(tabDuree,function(index,value){
					// 	duree += parseInt(value);
					// });
					// this.duree = duree;
					// regexPP = /[A-Z]{2}(\+[A-Z]{2})+/;
					// var ownerBrut = regexPP.exec(this.description.trim());
					// this.description = this.description.trim().replace(regexPP, "");
					// var owners = []
					// if(ownerBrut != null){
					// 	var owners = ownerBrut[0].split("+");
					// }
					// this.owner_initial = owners;
					// this.isPairProg = true;


				}else{
					regexPP = /[A-Z]{2}(\+[A-Z]{2})+$/;
					//Tache Pair programmin
					// if(this.description.trim().match(regexPP)){
					// 	console.log("Etat 2.1 descr : ", this.description);
					// 	var ownerBrut = regexPP.exec(this.description.trim());
					// 	var owners = ownerBrut[0].split("+");
					// 	this.owner_initial = owners;
					// 	this.description = this.description.trim().replace(regexPP, "");
					// 	regexPP = /\d(\+\d)+$/;
					// 	if(this.description.trim().match(regexPP)){
					// 		var duree = regexPP.exec(this.description.trim())[0];
					// 		this.duree = duree;
					// 		this.description = this.description.trim().replace(regexPP, "");
					// 	}else{
					// 		this.duree = null;
					// 	}
					// 	// var tabDureeBrut = regexPP.exec(this.description.trim());
					// 	// this.description = this.description.trim().replace(regexPP, "");
					// 	// var tabDuree = tabDureeBrut[0].split('+');
					// 	// var duree = 0;
					// 	// $.each(tabDuree,function(index,value){
					// 	// 	duree += parseInt(value);
					// 	// });
					// 	// this.duree = duree;
					// 	this.isPairProg = true;
					// }else{
						//if()
						console.log("Etat 2.2 descr : ", this.description);
						regexPP = /(\d)+$/;
						//Tahe (simple) avec horaires sans Initial
						if(this.description.trim().match(regexPP)){
							console.log("Etat 2.2.1  descr : ", this.description);
							var tabDureeBrut = regexPP.exec(this.description.trim());
							this.duree = regexPP.exec(this.description.trim())[0];
							this.description = this.description.trim().replace(regexPP, "");
							regexPP = /([A-Z]{2})/;
							if(this.description.trim().match(regexPP)){
								var taskMemeber  = regexPP.exec(this.description.trim())[0];
								this.owner_initial = taskMemeber;
								this.description = this.description.trim().replace(regexPP, "");
							}else if(memberInitial || taskMemeber){
								this.owner_initial = (memberInitial ? memberInitial : taskMemeber);
							}else{
								this.owner_initial = null
							}
							this.isPairProg = false;
							console.log("la tache timelending", this);
						//TacheSimple avec temps et intital
						}else if(this.description.trim().match(/([A-Z]{2})+$/)){
							console.log("Etat 2.2.2 descr : ", this.description);
							regexPP = /([A-Z]{2})+$/;
							if(this.description.trim().match(regexPP)){
								var taskMemeber  = regexPP.exec(this.description.trim())[0];
								this.owner_initial = taskMemeber;
								this.description = this.description.trim().replace(regexPP, "");
							}else if(memberInitial || taskMemeber){
								this.owner_initial = (memberInitial ? memberInitial : taskMemeber);
							}else{
								this.owner_initial = null;
							}
							regexPP = /(\d)+$/;
							var tabDureeBrut = regexPP.exec(this.description.trim());
							if(regexPP.exec(this.description.trim())){
								this.duree = regexPP.exec(this.description.trim())[0];
								this.description = this.description.trim().replace(regexPP, "");
							}else{
								this.duree = null;
							}
							// this.description = this.description.trim().replace(regexPP, "");
							this.isPairProg = false;
							console.log("la tache initialending", this);
						}else{
							this.description = this.description.trim();
							this.isPairProg = false;
							this.owner_initial = (memberInitial ? memberInitial : null);
							this.duree = null;
							console.log("la tache pourris 2", this);
						}
					// }
				}
				regexPP = /\s*\-$/;
				this.description = this.description.trim().replace(regexPP, "");
				var newClass = '';
				console.log('this.duree',this.duree);
				//TODO: Themes switcer
				if(this.duree == 0){
					newClass = imgDureeClassObj[0];
				}else if(this.duree < 5){
					newClass = imgDureeClassObj[1];
				}else if (this.duree < 9){
					newClass = imgDureeClassObj[5];
				}else if (this.duree < 13){
					newClass = imgDureeClassObj[9];
				}else if (this.duree < 15){
					newClass = imgDureeClassObj[13];
				}else{
					newClass = imgDureeClassObj[15];
				}
			}else{
				this.description = this.description.trim();
				this.isPairProg = false;
				this.owner_initial = (memberInitial ? memberInitial : null);
				this.duree = null;
							console.log("la tache pourris 1", this);
			}
			regexPP = /\Wforfait\W/;
			if(this.description.trim().toLowerCase().match(regexPP) != null){
				this.isForfait = true;
			}else{
				this.isForfait = false;
			}
			this.addedClass = newClass;
			//TODO: Theme switcher
			this.addedTheme = 'theme_' + '0';

			this.project_name = projectName;
			if(this.isInSprint){
				mytasks.push(this);
			}
		}
	});
	return mytasks;
}

//Convertis une liste d'id de person en liste d'initial
//Param : ids [id] provenant story.owners_id
//			members contenus dans _this.postItMemory.projectsMemebers
function convertIdsToMember(ids,members){
	var tabInitials = [];
	console.log(ids);
	$.each(ids,function(iIndex,iValue){
		$.each(members,function(mIndex,mValue){
			if(iValue == mValue.id){
				tabInitials.push(mValue.initials);
			}
		});
	});
	return tabInitials;
}