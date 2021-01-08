const apiTokenMapbox = 'pk.eyJ1Ijoiam9hb2ZlbGlwZTAyMDIiLCJhIjoiY2tqbjFhc2p1MDkxczJ5cWxhZDZpbG14NCJ9.HUym9p50_VrPqzQ5JGNGfA';
const apiTransitKey = 'cmZaYN5yrwwmepOUIVTd';

const originForm = document.querySelector('.origin-form');
const destinationForm = document.querySelector('.destination-form');
const originsList = document.querySelector('.origins');
const destinationsList = document.querySelector('.destinations');
const myTrip = document.querySelector('.my-trip');
const planTripBtn = document.querySelector('.plan-trip');

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
  let placesInfo = '';
  if (placesList.features.length === 0) {
    resultsList.innerHTML = `<li><div>No search results were found 😢, please try again.</div></li>`;
  } else {
    resultsList.innerHTML = '';
    placesList.features.forEach(place => {
      if (place.properties.address === undefined) {
        place.properties.address = 'Winnipeg, MB';
      }  
      placesInfo += `
        <li data-long="${place.center[0]}" data-lat="${place.center[1]}" class="selected">
          <div class="name">${place.text}</div>
          <div>${place.properties.address}</div>
        </li>`
    })
    resultsList.innerHTML = placesInfo;
  }  
}

const getTrip = () => {
  return fetch(`https://api.winnipegtransit.com/v3/trip-planner.json?api-key=${apiTransitKey}&origin=geo/${originLat},${originLong}&destination=geo/${destinationLat},${destinationLong}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        Promise.reject({response: response.status, response: response.statusText});
      }
    })
    .then(data => {
      planMyTrip(data.plans[0])
    })
}

const planMyTrip = tripData => {
  myTrip.innerHTML = '';
  let tripInfo = '';
  tripData.segments.forEach(trip => {
    if (trip.type === 'walk') {
      const string = `${trip.type} for ${trip.times.durations.total} minutes to ${trip.to.stop ===undefined ? 'destination' : `stop #${trip.to.stop.key} - ${trip.to.stop.name}`}`
      tripInfo += 
      `
      <li>
        <i class="fas fa-walking" aria-hidden="true"></i>${capitalizeFirstLetter(string)}
      </li>`;
    } else if (trip.type === 'ride') {
      const string = `${trip.type} the ${trip.route.name === undefined ? trip.route.number : trip.route.name} for ${trip.times.durations.total} minutes.`
      tripInfo +=
        `
        <li>
          <i class="fas fa-bus" aria-hidden="true"></i>${capitalizeFirstLetter(string)}
        </li>`;
    } else if (trip.type === 'transfer') {
      const string = `${trip.type} from stop #${trip.from.stop.key} - ${trip.from.stop.name} to stop #${trip.from.stop.key} - ${trip.from.stop.name}`
      tripInfo +=
      `
      <li>
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>${capitalizeFirstLetter(string)}
      </li>
      `;
    }
  })
  myTrip.innerHTML = tripInfo;
}

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
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

originsList.addEventListener('click', e => {
  const li = e.target.closest('LI');
  const allLi = document.querySelectorAll('.origins li');
  
  allLi.forEach(liSelected => {
    liSelected.classList.remove('selected');
  })
  li.classList.add('selected');

  originLat = li.dataset.lat;
  originLong = li.dataset.long;
  console.log(originLat);
  console.log(originLong)
})

destinationsList.addEventListener('click', e => {
  const li = e.target.closest('LI');
  const allLi = document.querySelectorAll('.destinations li');
  
  allLi.forEach(liSelected => {
    liSelected.classList.remove('selected');
  })
  li.classList.add('selected');

  destinationLat = li.dataset.lat;
  destinationLong = li.dataset.long;
  console.log(destinationLat);
  console.log(destinationLong)
})

planTripBtn.addEventListener('click', () => {
  getTrip();

  if ((originLat === destinationLat) && (originLong === destinationLong)) {
    const alert = 'Your origin and destination are the same, please change one of them 😃';
    myTrip.innerHTML = `<li>${alert}</li>`;
  }

  if ((originLat === undefined) || (destinationLat === undefined) || (originLong === undefined) || (destinationLong === undefined)) {
    const alert = 'You have to select at least one origin and one destination';
    myTrip.innerHTML = `<li>${alert}</li>`
  }
})