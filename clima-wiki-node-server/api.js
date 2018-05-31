/*
*
*	@Author: Daniel Victor Freire Feitosa
*	@Version: 1.0.0
*	@License: GNU General Public License v3.0
*
*/
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var translate = require('google-translate-api'); // :)
var app = express();
var port = 666; // Mudou eh cadeia

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // Para retornar sempre como json as respostas
app.use(function(req, res, next) { // Para evitar erros de permissoes
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.post('/temp', (req, res) => { // Handle para o caminho /temp
	var city = req.body.city; // Cidade (ex: Recife)
	var countryCode = req.body.countryCode; // Codigo do pais (ex: br)
	var searchText = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='"+city+", "+countryCode+"')&format=json" // Data query usada para a requisicao na API do yahoo
	request('https://query.yahooapis.com/v1/public/yql?q='+searchText, {json:true}, (err, rs, body) => { // Request na API do yahoo para consultar o clima
		if(err){
			return console.log(err);
		}

		request('https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page='+city, {json:true}, (err__, rs__, body__) => { // API do wikipedia
			var pageId = body__.parse.pageid; // Vai retornar o codigo da pagina que a cidade esta localizada
			request('https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=1&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch='+city+'&format=json', {json:true}, (err_, rs_, body_) => { // API da wikipedia
				var descriptionEN = body_.query.pages[pageId].extract; // Descricao da cidade
				translate(descriptionEN, {from: 'en', to: 'pt'}) // Faz a traducao para portugues
					.then((tlDesc) => {
						var tlDescTxt = tlDesc.text; // Descricao da cidade em portugues
						var result = body.query.results.channel.item.forecast; // Vai retornar o JSON para o AJAX contendo as temperaturas da cidade
						var temp_middle = (parseInt(result[0].high) + parseInt(result[0].low))/2; // Media das temperaturas (alta e baixa)
						var fahrenheit = temp_middle; // Temperatura em fahrenheit padrao
						var celsius = (5*(temp_middle-32))/9; // Temperatura em celsius
						var kelvin = celsius + 273; // Temperatura em kelvin
						var text = result[0].text; // Descricao do clima
						translate(text, {from: 'en', to: 'pt'}) // Traducao da descricao do clima
							.then((tl) => {
								tlTxt = tl.text; // Descricao do clima em portugues
								res.json({ // JSON retornado para a pagina
									fahrenheit: parseInt(fahrenheit),
									celsius: parseInt(celsius),
									kelvin: parseInt(kelvin),
									text: tlTxt,
									description: tlDescTxt
								})
							})
					})
			})
		})

	})
});

app.listen(port, (req, res) => { // Inicia a API na porta padrao
	console.log('Servidor rodando na porta '+port);
})