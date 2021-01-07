const apiTokenMapbox = 'pk.eyJ1Ijoiam9hb2ZlbGlwZTAyMDIiLCJhIjoiY2tqbjFhc2p1MDkxczJ5cWxhZDZpbG14NCJ9.HUym9p50_VrPqzQ5JGNGfA';
const apiKeyTransit = 'cmZaYN5yrwwmepOUIVTd';

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const originsList = document.querySelector('.origins');
const destinationsList = document.querySelector('.destinations');

const showSearchResults = query => {
  return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${apiTokenMapbox}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        Promise.reject({response: response.status, response: response.statusText});
      }
    })
    .then(data => renderLocations(data))
}

const renderLocations = placesList => {
  let resultsList = '';
  placesList.features.forEach(place => {
    const placesInfo = `
      <li data-long="${place.center[0]}" data-lat="${place.center[1]}" class="selected">
        <div class="name">${place.text}</div>
        <div>${place.properties.address === undefined ? place.context[2].text : place.properties.address}</div>
      </li>`
  resultsList.innerHTML = placesInfo;
  })
}

showSearchResults('fairbanks, alaska')
  .then(data => console.log(data))