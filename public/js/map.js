// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM

const Listing = require("../../models/listing");

// https://account.mapbox.com
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // center: [-74.5, 40], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    // center: listing.geometry.coordinates,
    zoom: 9, // starting zoom
});

// console.log(coordinates);
// const marker1 = new mapboxgl.Marker({color: 'red'})
//         .setLngLat(listing.geometry.coordinates)//listing.geometry.coordinates
            // .setPopup(new mapboxgl.Popup({offset: popupOffests}))
            // .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking.</p>`)
//         .addTo(map);