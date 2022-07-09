//map
const mainMap = {
    
    businesses: [],
    coordinates: [],
    map: {},
    markers: {},
    markersList: [],

    //create leaflet map
    buildMap() {
        this.map = L.map("map", {
            center: this.coordinates,
            zoom: 10
        });
        //add tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
            minZoom: 15
        }).addTo(this.map);
        //add geolocation marker
        const marker = L.marker(this.coordinates)
        marker
            .addTo(this.map)
            .bindPopup("<p1><b>You are here</b><br></p1>")
            .openPopup();
    },

    //add business markers
    addMarkers() {
        this.businesses.forEach(business => {
            this.markers = L.marker([business.lat, business.long])
                .bindPopup(`<p1>${business.name}</p1>`)
                .addTo(this.map);
            this.markersList.push(this.markers);
        })
    },

    clearMarkers() {
        this.markersList.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markersList = [];
    }

}

//get current location
async function getCoordinates() {
    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return [position.coords.latitude, position.coords.longitude];
}

//get businesses
async function getBusinesses(business) {
    let limit = 6;
    let lat = mainMap.coordinates[0];
    let long = mainMap.coordinates[1];
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${long}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: "fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8="
        }
    });

    let result = await response.text();
    return JSON.parse(result).results;
}

//process foursquare
function processBusinesses(data) {
    let businesses = data.map((business) => {
        let location = {
            name: business.name,
            lat: business.geocodes.main.latitude,
            long: business.geocodes.main.longitude
        }
        return location;
    });
    return businesses;
}

//window load
window.onload = async () => {
    const coords = await getCoordinates();
    mainMap.coordinates = coords;
    mainMap.buildMap();
}

//submit button
document.getElementById("submit").addEventListener("click", async (e) => {
    e.preventDefault();
    mainMap.clearMarkers();
    let business = document.getElementById("business").value;
    let data = await getBusinesses(business);
    mainMap.businesses = processBusinesses(data);
    mainMap.addMarkers();
})