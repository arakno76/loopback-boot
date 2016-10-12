var path = require('path');
var fs = require('fs');
var loopback = require('loopback');

var app = require(path.resolve(__dirname, '../server'));
var outputPath = path.resolve(__dirname, '../../common/models');


var datasource = app.dataSources.postgres;
var database = datasource.settings.database;

app.use(loopback.rest());

module.exports = function(app) {
	datasource.discoverModelDefinitions(function (err, models) { 
		if(models.length>0){
			 models.forEach(function (def) {
				// def.name ~ the model name
				 console.log("Auto discovering: " + def.name);
				datasource.discoverSchema(def.name, {relations: true}, function (err, table) {
				if(err){
					console.log(err);
					return;
				}
					 
				 console.log("Auto discovery success: " + table.name);
				 table.plural = table.name; // set the plural equal to table name
	
				 // cambio properties per consentire id autoincrementale in insert
				 if(table.properties.id != undefined &&(table.properties.id.id == true || table.properties.id.id == 1)){
					 table.properties.id.generated = true;
					 table.properties.id.required = false;
					 table.options.idInjection = true;
					 
				 }
				 
				 
				 for (var key in table.properties) {
					 property = table.properties[key];
				//	 console.log(property);
					 if(property.postgresql != undefined && property.postgresql.dataType != undefined && property.postgresql.dataType == "json" ){
						 console.log("changing property type to object for property " + key + " of model " + table.name);
						 property.type =  "Object";			 
					 }
					 
					
				 };
				 
				  var outputName = outputPath + '/' +table.name + '.json';
					fs.writeFile(outputName, JSON.stringify(table, null, 2), function(err) {
					  if(err) {
						console.log(err);
					  } else {
						console.log("JSON saved to " + outputName);
						
					    console.log("Creating model = " + table.name);
					    var model = loopback.createModel(table);
						app.model(model, { dataSource: datasource});
						console.log("Model Created!");
						
					  }
					});
					
				});
				
				
				
			  });
			 
		}
	
	});
	
	
	 datasource.disconnect();
}
