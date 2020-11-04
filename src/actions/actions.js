export const UPDATE_TEXTINPUT = "UPDATE_TEXTINPUT";
export const RECEIVE_GEOCODE_RESULTS = "RECEIVE_GEOCODE_RESULTS";
export const REQUEST_GEOCODE_RESULTS = "REQUEST_GEOCODE_RESULTS";
export const UPDATE_CENTER = "UPDATE_CENTER";
export const UPDATE_SETTINGS = "UPDATE_SETTINGS";
export const RECEIVE_ISOCHRONES_RESULTS = "RECEIVE_ISOCHRONES_RESULTS";
export const REQUEST_ISOCHRONES_RESULTS = "REQUEST_ISOCHRONES_RESULTS";

export const fetchGeocode = payload => dispatch => {
  // It dispatches a further action to let our state know that requests are about to be made
  dispatch(requestGeocodeResults());

  let url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${payload.inputValue}.json/`)
  let params = {
    access_token: process.env.REACT_APP_MAPBOX_ACCESSTOKEN,
    country: 'jp'
  };

  url.search = new URLSearchParams(params);

  // we use the fetch API to call HERE MAps with our parameters
  return (
    fetch(url)
      // when a response is returned we extract the json data
      .then(response => response.json())
      // and this data we dispatch for processing in processGeocodeResponse
      .then(data => dispatch(processGeocodeResponse(data)))
      .catch(error => console.error(error))
  );
};

const processGeocodeResponse = json => dispatch => {
  const results = parseGeocodeResponse(json);
  dispatch(receiveGeocodeResults(results));
};

const parseGeocodeResponse = (json) => {
  // parsing the response, just a simple example
  if (json && json.features.length > 0) {
    let processedResults = [];

    for (const item of json.features) {
      processedResults.push({
        title: item.text,
        displayposition: {
          lng: item.center[0],
          lat: item.center[1]
        }
      });
    }
    return processedResults;
  }
};

export const receiveGeocodeResults = payload => ({
  type: RECEIVE_GEOCODE_RESULTS,
  results: payload
});

export const requestGeocodeResults = payload => ({
  type: REQUEST_GEOCODE_RESULTS,
  ...payload
});

export const updateTextInput = payload => ({
  type: UPDATE_TEXTINPUT,
  payload
});

export const updateCenter = payload => ({
  type: UPDATE_CENTER,
  ...payload
});

export const updateSettings = payload => ({
  type: UPDATE_SETTINGS,
  ...payload
});

export const fetchIsochrones = payload => dispatch => {
  dispatch(requestIsochronesResults());

  let url = new URL(
    `https://api.mapbox.com/isochrone/v1/mapbox/${payload.settings.mode}/${payload.settings.isochronesCenter.lng},${payload.settings.isochronesCenter.lat}`
  )
  let params = {
    access_token: process.env.REACT_APP_MAPBOX_ACCESSTOKEN,
    contours_minutes: payload.settings.range.value,
    polygons: true
  }
  url.search = new URLSearchParams(params);

  return fetch(url)
    .then(response => response.json())
    .then(data => dispatch(processIsochronesResponse(data)))
    .catch(error => console.error(error));
};

const processIsochronesResponse = json => dispatch => {
  dispatch(receiveIsochronesResults(json));
};

export const receiveIsochronesResults = results => ({
  type: RECEIVE_ISOCHRONES_RESULTS,
  results: results
});

export const requestIsochronesResults = () => ({
  type: REQUEST_ISOCHRONES_RESULTS
});
