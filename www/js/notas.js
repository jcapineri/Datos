var app = {
	
	model: {
		"notas": [{"titulo": "Comprar Pan", "contenido": "Oferta en la panaderia de la esquina"}]
	},
	
	firebaseConfig: {
		apiKey: "AIzaSyD_n0V-AFbWddiXLGHqw_-xDHvbBgLNUR4",
		authDomain: "notas-39df1.firebaseapp.com",
		databaseURL: "https://notas-39df1.firebaseio.com",
		projectId: "notas-39df1",
		storageBucket: "notas-39df1.appspot.com",
		messagingSenderId: "589967759589"		
	},
		
	inicio: function(){
		this.iniciaFastClick()
		this.iniciarFirebase();
		this.iniciaBotones();
		this.refrescarLista();
	},
	
	iniciaFastClick: function(){
		FastClick.attach(document.body);
	},
	
	iniciarFirebase: function(){
		firebase.initializeApp(this.firebaseConfig);
	},
	
	iniciaBotones: function(){
		var salvar = document.querySelector('#salvar');
		var agregar = document.querySelector('#agregar');
			
		agregar.addEventListener('click', this.mostrarEditor, false);
		salvar.addEventListener('click', this.salvarNota, false);
	},
	
	mostrarEditor: function(){
		document.getElementById('titulo').value = "";
		document.getElementById('comentario').value = "";
		document.getElementById("note-editor").style.display = "block";
		document.getElementById('titulo').focus();
	},
	
	salvarNota: function(){
		app.construirNota();
		app.ocultarEditor();
		app.refrescarLista();
		app.grabarDatos();
	},
	
	grabarDatos: function(){
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.gotFS, this.fail);
	},
	
	gotFS: function(fileSystem){
		fileSystem.getFile("files/" + "model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
	},
	
	gotFileEntry: function(fileEntry){
		fileEntry.createWriter(app.gotFileWriter, app.fail);
	},
	
	gotFileWriter: function(writer){
		writer.onwriteend = function(evt){
			console.log('Datos Grabados en la externalApplicationStorageDirectory');
			if(app.hayWifi()){
				app.salvarFireBase();
			}
		};
		writer.write(JSON.stringify(app.model));
	},
	
	hayWifi: function(){
		return navigator.connection.type==='wifi';
	},
	
	salvarFireBase: function() {
		var ref = firebase.storage().ref('model.json');
		ref.putString(JSON.stringify(app.model));
	},
	
	construirNota: function() {
		var notas = app.model.notas;
		notas.push({"titulo": app.extraerTitulo(), "contenido": app.extraerComentario()});
	},
	
	extraerTitulo: function(){
		return document.getElementById('titulo').value;
	},
	
	extraerComentario: function(){
		return document.getElementById('comentario').value;		
	},
	
	ocultarEditor: function(){
		document.getElementById("note-editor").style.display = "none";
	},
	
	refrescarLista: function() {
		var div = document.getElementById('notes-list');
		div.innerHTML = this.agregarNotasALista();
	},
	
	agregarNotasALista: function(){
		var notas = this.model.notas;
		var notasDivs = '';
		for(var i in notas) {
			var titulo = notas[i].titulo;
			notasDivs = notasDivs + this.agregarNota(i, titulo);
		}
		return notasDivs;
	},
	
	agregarNota: function(id, titulo){
		return "<div class='note-item' id='notas[" + id + "]'>" + titulo + "</div>";
	},
	
	leerDatos: function(){
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, app.obtenerFS, app.fail);
	},
	
	obtenerFS: function(fileSystem){
		fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.fail);	
	},
	
	obtenerFileEntry: function(fileEntry){
		fileEntry.file(app.leerFile, app.fail);
	},
	
	leerFile: function(file){
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			var data = evt.target.result;
			app.model = JSON.parse(data);
			app.inicio();
		};
		reader.readAsText(file);
	},

	fail: function(error){
		if (error.code === 1) {
			app.grabarDatos();
			setTimeout(app.leerDatos, 0);
		}
	},
	
};

if('addEventListener' in document){
	document.addEventListener('deviceready', function(){
		app.leerDatos();
	}, false);
}
