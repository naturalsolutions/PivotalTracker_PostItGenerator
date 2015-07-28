/*
Fichier d'accès a l'ensemble des données de pivotal tracker.
Tous les ajax on été passé en synchrone pour garantir la cohérence des données
ainsi que l'éxécution en étapes.
Documantation api PT dispo sur : https://www.pivotaltracker.com/help/api/rest/v5
*/


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
	//On assigne les différentes informations aux taches (durée et éxecutant)
	$.each(myTempTasks,function(){
		if(!this.complete){
			this.isInSprint = true;
			var regexPP = /\d(\+\d)+$/;
			if(this.description.match(regexPP)){
				var tabDureeBrut = regexPP.exec(this.description);
				var tabDuree = tabDureeBrut[0].split('+');
				var duree = 0;
				$.each(tabDuree,function(index,value){
					duree += parseInt(value);
				});
				this.duree = duree;
				regexPP = /[A-Z]{2}(\+[A-Z]{2})+/;
				var ownerBrut = regexPP.exec(this.description);
				var owners = []
				if(ownerBrut != null){
					var owners = ownerBrut[0].split("+");
				}
				this.owner_initial = owners;
				this.isPairProg = true;
			}else{
				regexPP = /[A-Z]{2}(\+[A-Z]{2})+$/;
				if(this.description.match(regexPP)){
					var ownerBrut = regexPP.exec(this.description);
					var owners = ownerBrut[0].split("+");
					this.owner_initial = owners;
					regexPP = /\d(\+\d)+/;
					var tabDureeBrut = regexPP.exec(this.description);
					var tabDuree = tabDureeBrut[0].split('+');
					var duree = 0;
					$.each(tabDuree,function(index,value){
						duree += parseInt(value);
					});
					this.duree = duree;
					this.isPairProg = true;
				}else{
					regexPP = /(\d)+$/;
					var tabDureeBrut = regexPP.exec(this.description);
					this.duree = regexPP.exec(this.description)[0];
					this.owner_initial = memberInitial;
					this.isPairProg = false;
				}
			}
			this.project_name = projectName;
			mytasks.push(this);
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