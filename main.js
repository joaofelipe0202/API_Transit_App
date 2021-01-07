const mapBoxApiKey = `pk.eyJ1Ijoic3VwZXJ4aW4iLCJhIjoiY2thNWlqZHd4MDBpODNnb3owMDA2Y3dnYiJ9.-zciQf0emsOdjhIjB2uoNA`;
const wpgTransitApiKey = `G0ZNynR9C1I5fFkrMET`;
const originForm = document.querySelector(`.origin-form`);
const destinationForm = document.querySelector(`.destination-form`);
const originResultsList = document.querySelector(`.origins`);
const destinationResultsList = document.querySelector(`.destinations`);
const tripPlanEle = document.querySelector(`.my-trip`);
const resultsList = document.querySelectorAll(`ul:not(.my-trip)`);
const btn = document.querySelector(`.plan-trip`);

originForm.addEventListener(`submit`, event => {
  const originInput = originForm.querySelector(`input`);

  if (originInput.value.trim() !== ``) {
    searchLocations(originInput.value, originResultsList);
  }

  originInput.value = ``;
  event.preventDefault();
})

destinationForm.addEventListener(`submit`, event => {
  const destinationInput = destinationForm.querySelector(`input`);

  if (destinationInput.value.trim() !== ``) {
    searchLocations(destinationInput.value, destinationResultsList);
  }

  destinationInput.value = ``;
  event.preventDefault();
})

originResultsList.addEventListener(`click`, event => clickResult(event));

destinationResultsList.addEventListener(`click`, event => clickResult(event));

btn.addEventListener(`click`, () => {
  const selectedResults = document.getElementsByClassName(`selected`);
  if (selectedResults.length === 2) {
    const originCoords = [selectedResults[0].dataset.lat, selectedResults[0].dataset.long];
    const destinationCoords = [selectedResults[1].dataset.lat, selectedResults[1].dataset.long];

    document.querySelectorAll(`.select-alert`).forEach(alert => alert.remove());

    if (originCoords[0] === destinationCoords[0] && originCoords[1] === destinationCoords[1]) {
      alert(`Dude, where do you want to go?`)
    } else {
      fetch(`https://api.winnipegtransit.com/v3/trip-planner.json?origin=geo/${originCoords[0]},${originCoords[1]}&destination=geo/${destinationCoords[0]},${destinationCoords[1]}&api-key=${wpgTransitApiKey}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Fail to get data from API.`);
          }
        })
        .then(data => {
          if (data.plans[0] === undefined) {
            tripPlanEle.innerHTML = `<li>No plans were found.</li>`;
          } else {
            updateTripPlan(data.plans[0].segments);
          }
        });
    }

  } else if (selectedResults.length === 0) {
    resultsList.forEach(list => list.insertAdjacentHTML(`beforebegin`, `<div class="select-alert">Please select one result.</div>`));

  } else {
    resultsList.forEach(list => {
      if (list.querySelector(`.selected`) === null) {
        list.insertAdjacentHTML(`beforebegin`, `<div class="select-alert">Please select one result.</div>`);
      }
    })
  }
})

function searchLocations(keyword, listEle) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${keyword}.json?access_token=${mapBoxApiKey}&limit=10&bbox=-97.325875,49.766204,-96.953987,49.99275`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Fail to get data from API.`);
      }
    })
    .then(data => updateResults(data.features, listEle));
}

function updateResults(locationsList, listEle) {
  if (locationsList.length === 0) {
    listEle.innerHTML = `<div class="no-result">No results were found.</div>`;
  } else {
    let html = ``;

    locationsList.forEach(location => {
      if (location.properties.address === undefined || location.properties.address === ``) {
        location.properties.address = `Winnipeg`;
      }

      html += `   
      <li data-long="${location.center[0]}" data-lat="${location.center[1]}" class="">
        <div class="name">${location.text}</div>
        <div>${location.properties.address}</div>
      </li> 
    `;
    })

    listEle.innerHTML = html;
  }


}

function clickResult(event) {
  if (event.target.closest(`li`) !== null) {
    const results = document.querySelectorAll(`.${event.target.closest(`ul`).className} > li`);

    results.forEach(result => result.classList.remove(`selected`));
    event.target.closest(`li`).classList.add(`selected`);
  }
}

function updateTripPlan(tripPlan) {
  let html = ``;

  tripPlan.forEach((segment, index) => {
    if (segment.type === `walk`) {
      html += `
        <li>
          <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${segment.times.durations.total} minutes to
        `;
      if (index === 0 && tripPlan.length !== 1) {
        html += `
          stop #${segment.to.stop.key} - ${segment.to.stop.name}            </li>
        `;
      } else if (index === tripPlan.length - 1 || tripPlan.length === 1){
        html += `
          your destination
          </li>
        `;
      }
    } else if (segment.type === `ride`) {

      if (segment.route.name === undefined) {
        segment.route.name = segment.route.key;
      } 

      html += `
        <li>
          <i class="fas fa-bus" aria-hidden="true"></i>Ride the ${segment.route.name} for ${segment.times.durations.total} minutes
        </li>
      `;
    } else if (segment.type === `transfer`) {
      html += `
        <li>
          <i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop #${segment.from.stop.key} - ${segment.from.stop.name} to stop #${segment.to.stop.key} - ${segment.to.stop.name}
        </li>
      `;
    }
  })

  tripPlanEle.innerHTML = html;
}