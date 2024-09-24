mapboxgl.accessToken = 'pk.eyJ1IjoibnRva296by0yODUzIiwiYSI6ImNtMTh3bTJ4bDE5cXcydHNmZGt3cnJhcHgifQ.i-cqQWtnORllhcF2_kPxWQ';

document.getElementById('Location-Btn').addEventListener('click', getLocation);

function getLocation() {
    //Getting the user's location 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this Browser")
    }

    const mapContainer = document.getElementById('map');
    mapContainer.style.display = 'block';
    mapContainer.scrollIntoView({behavior: 'smooth'});
};

function showPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let locationText = "latitude: " + latitude +  " longitude: " + longitude;
    document.getElementById("your-location").innerHTML = locationText;

    const userLocation = [longitude, latitude];
    map.setCenter(userLocation);
    map.setZoom(14);
    marker.setLngLat(userLocation);
}

function showError(error) {
    //Handling the errors
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denaid the request from Geolocation.")
            break;

        case error.POSITION_UNAVAILABLE:
            alert("location information is unavailable.")
            break;

        case error.TIMEDOUT:
            alert("The request to get loction timed out.")
            break;

        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break;
    }
}

let map, marker;

function initMap() {
    const defaultLocation = [-26.2056, 28.0337];
    const map = new mapboxgl.Map({
        container:'map',
        style:'mapbox://styles/mapbox/streets-v11',
        center: defaultLocation,
        zoom: 6,

    });
    marker = new mapboxgl.Marker().setLngLat(defaultLocation).addTo(map);
}

initMap();

document.addEventListener('DOMContentLoaded', function () {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(function(question) {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
            } else {
                answer.style.display = 'block';
            }
            });
        });
    });
