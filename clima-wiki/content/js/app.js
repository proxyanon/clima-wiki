/*
*
*	@Author: Daniel Victor Freire Feitosa
*	@Version: 1.0.0
*	@License: GNU General Public License v3.0
*
*/
$(document).ready(function(){
	var geo_location_api = "http://ip-api.com/json"; // API para obter a geo-localização
	var image_path = '/content/img/site/'; // PATH das imagens do site
	var images = ['desert.jpg', 'cold.jpg', 'cloudy.jpg']; // Array das imagens da pasta

	$('#refresh').click(() => { // Bota de refresh
		document.location.reload();
	});

	function getTemp(city, countryCode){ // Funcao que retorna as temperaturas e o resultado do wikipedia
		$.ajax({
			method: 'POST',
			url: 'http://localhost:666/temp', // API do node.js
			data:{
				city: city, // Cidade retornada pela geo localizacao (ex: Recife)
				countryCode: countryCode // Codigo do pais retornado pela geo localizao (ex: BR)
			},
			beforeSend: () => {
				$('#load').show(); // Antes de enviar a requisicao ele mostra o loading
			},
			success: (data) =>{
				$('#load').toggle('slow'); // Para de mostrar o loading
				
				var celsius = data.celsius; // Temperatura retornada em Celsius
				var fahrenheit = data.fahrenheit; // Temperatura retornada em Fahrenheit
				var kelvin = data.kelvin; // Temperatura retornada em Kelvin
				var text = data.text; // Descricao do clima
				var description = data.description; // Decricao da cidade no wikipedia

				//console.log(image_path+images[0]);


				// Esepeculativo / (PODE TIRAR)
				if(celsius >= 21){
					$('body').css('background-image', 'url("'+image_path+images[0]+'")');
				}else if(celsius <= 20 && celsius >= 18){
					$('body').css('background-image', 'url("'+image_path+images[2]+'")');
				}else if(celsius < 18){
					$('body').css('background-image', 'url("'+image_path+images[1]+'")');
				}

				$('#temp').text(celsius+" C°"); // A temperatura padrao em Celsius
				$('#text').text(text); // Descricao do clima
				$('#description').text(description); // Pesquisa no wikipedia
						
				$('#celsius').click(() => { // Botao para converter em celsius
					$('#temp').text(celsius+" C°");
				});

				$('#fahrenheit').click(() => { // Botao para converter em fahrenheit
					$('#temp').text(fahrenheit+" F°");
				});

				$('#kelvin').click(() => { // Botao para converter em kelvin
					$('#temp').text(kelvin+" K°");
				});

			},
			error: (err) => { // auto-explicativo
				console.log(err);
			}
		})
	}

	$.ajax({ // AJAX na api que vai retornar a geo localizacao
		method: 'GET',
		url: geo_location_api,
		success: (data) => {
			var city = data.city; // Cidade
			var countryCode = data.countryCode; // Codigo do pais
			var region = data.region; // Regiao
			$('#geo-info').text(city + " - " + region); // Coloca a cidade e a regiao na div
			getTemp(city, countryCode.toLocaleLowerCase()); // Roda a funcao que vai retornar a porra toda
		},
		error: (err) =>{ // auto-explicativo 
			console.log('ERROR: '+err);
		}
	})
})
