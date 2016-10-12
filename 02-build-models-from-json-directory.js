var fs = require('fs');
var path = require('path');
var loopback = require('loopback');
var app = require(path.resolve(__dirname, '../server'));
var modelPath = path.resolve(__dirname, '../../common/models');
var datasource = app.dataSources.postgres;

app.use(loopback.rest());
module.exports = function(app) {
	fs.readdir(modelPath, function (err, files) {
		 if (err)
		    throw err;
		 for (var index in files) {
			var modelObj = JSON.parse(fs.readFileSync(modelPath + "/" + files[index], 'utf8'));
			// console.log(modelObj); 
			var modelName = files[index].split(".json")[0];
		    console.log("Creating model = " + files[index].split(".json")[0]);
		    var model = loopback.createModel(modelObj);
			app.model(model, { dataSource: datasource});
			 console.log("Model Created!");
		 }
	 });
}