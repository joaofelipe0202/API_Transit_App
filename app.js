const apiTokenMapbox = 'pk.eyJ1Ijoiam9hb2ZlbGlwZTAyMDIiLCJhIjoiY2tqbjFhc2p1MDkxczJ5cWxhZDZpbG14NCJ9.HUym9p50_VrPqzQ5JGNGfA';
const apiTransitKey = 'cmZaYN5yrwwmepOUIVTd';

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const originsList = document.querySelector('.origins');
const destinationsList = document.querySelector('.destinations');
const myTrip = document.querySelector('.my-trip');

let originLat, originLong, destinationLat, destinationLong;

const getLocations = (query, resultsList) => {
  return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${apiTokenMapbox}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        Promise.reject({response: response.status, response: response.statusText});
      }
    })
    .then(data => renderLocations(data, resultsList))
}

const renderLocations = (placesList, resultsList) => {
  const noResults = 'Could not find any result for your search. Check the input and try again.'
  if (placesList.length === 0) {
    resultsList.innerHTML = `<div>${noResults}</div>`;
  } else {
    let placesInfo = '';
    resultsList.innerHTML = '';
    placesList.features.forEach(place => {
      placesInfo += `
        <li data-long="${place.center[0]}" data-lat="${place.center[1]}" class="selected">
          <div class="name">${place.text}</div>
          <div>${place.properties.address}</div>
        </li>`
    })
    resultsList.innerHTML = placesInfo;
  }
  
}

const getStops = () => {
  return fetch(`https://api.winnipegtransit.com/v3/trip-planner.json?api-key=${apiTransitKey}&origin=geo/${originCordLat},${originCordLong}&destination=geo/${destinationCordLat},${destinationCordLong}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        Promise.reject({response: response.status, response: response.statusText});
      }
    })
}

const planMyTrip = tripData => {
  let tripInfo = '';
  tripData.segments.forEach(trip => {
    if (trip.type === 'walk') {
      tripInfo = 
      `
      <li>
        <i class="fas fa-walking" aria-hidden="true"></i>${trip.type} for ${trip.times.durations.total} minutes to ${trip.to.stop ===undefined ? 'destination' : `stop #${trip.to.stop.key} - ${trip.to.stop.name}`}
      </li>`;
    } else if (trip.type === 'ride') {
      tripInfo =
        `
        <li>
          <i class="fas fa-bus" aria-hidden="true"></i>${trip.type} the ${trip.route.name === undefined ? trip.route.number : trip.route.name} for ${trip.times.durations.total} minutes.
        </li>`;
    } else if (trip.type === 'transfer') {
      tripInfo =
      `
      <li>
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>${trip.type} from stop #${trip.from.stop.key} - ${trip.from.stop.name} to stop #${trip.from.stop.key} - ${trip.from.stop.name}
      </li>
      `;
    }
    myTrip.insertAdjacentHTML('afterbegin', tripInfo);
  })
}

originForm.addEventListener('submit', e => {
  const originInput = document.querySelector('.origin-value');
  let originInputValue = originInput.value;
  
  if (originInputValue !== '') {
    getLocations(originInputValue, originsList);
  }
  
  originInput.value = '';
  e.preventDefault();
})

destinationForm.addEventListener('submit', e => {
  const destinationInput = document.querySelector('.destination-value');
  let destinationInputValue = destinationInput.value;
  
  if (destinationInputValue !== '') {
    getLocations(destinationInputValue, destinationsList);
  }
  
  destinationInput.value = '';
  e.preventDefault();
})