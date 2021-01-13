mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: destination.geometry.coordinates, // starting position [lng, lat]
    zoom: 11 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

var marker = new mapboxgl.Marker({color: 'red'})
    .setLngLat(destination.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25,closeButton:false})
            .setHTML(
                `<h3>${destination.title}</h3><p>${destination.location}</p>`
            )
    )
    .addTo(map);
