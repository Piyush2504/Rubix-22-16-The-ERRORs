var apiKey = "c74eb5ef64004d9db29411a5af3926da";

lat = 19.0760;
lng = 72.8777;

var isRetina = L.Browser.retina;
var baseUrl =
    "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
var retinaUrl =
    "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";
var map = L.map("map").setView([lat, lng], 13);
L.tileLayer(isRetina ? retinaUrl : baseUrl, {
    attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap <a href="https://www.openstreetmap.org/copyright" target="_blank">contributors</a>',
    apiKey: apiKey,
    maxZoom: 20,
    id: "osm-bright",
}).addTo(map);

function addressAutocomplete(containerElement, callback, options) {
    // create input element
    var inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("placeholder", options.placeholder);
    containerElement.appendChild(inputElement);

    // add input field clear button
    var clearButton = document.createElement("div");
    clearButton.classList.add("clear-button");
    addIcon(clearButton);
    clearButton.addEventListener("click", (e) => {
        e.stopPropagation();
        inputElement.value = '';
        callback(null);
        clearButton.classList.remove("visible");
        closeDropDownList();
    });
    containerElement.appendChild(clearButton);

    /* Current autocomplete items data (GeoJSON.Feature) */
    var currentItems;

    /* Active request promise reject function. To be able to cancel the promise when a new request comes */
    var currentPromiseReject;

    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    var focusedItemIndex;

    /* Execute a function when someone writes in the text field: */
    inputElement.addEventListener("input", function(e) {
        var currentValue = this.value;

        /* Close any already open dropdown list */
        closeDropDownList();

        // Cancel previous request promise
        if (currentPromiseReject) {
            currentPromiseReject({
                canceled: true
            });
        }

        if (!currentValue) {
            clearButton.classList.remove("visible");
            return false;
        }

        // Show clearButton when there is a text
        clearButton.classList.add("visible");

        /* Create a new promise and send geocoding request */
        var promise = new Promise((resolve, reject) => {
            currentPromiseReject = reject;

            var apiKey = "c74eb5ef64004d9db29411a5af3926da";
            var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;

            if (options.type) {
                url += `&type=${options.type}`;
            }

            fetch(url)
                .then(response => {
                    // check if the call was successful
                    if (response.ok) {
                        response.json().then(data => resolve(data));
                    } else {
                        response.json().then(data => reject(data));
                    }
                });
        });

        promise.then((data) => {
            currentItems = data.features;

            /*create a DIV element that will contain the items (values):*/
            var autocompleteItemsElement = document.createElement("div");
            autocompleteItemsElement.setAttribute("class", "autocomplete-items");
            containerElement.appendChild(autocompleteItemsElement);

            /* For each item in the results */
            data.features.forEach((feature, index) => {
                /* Create a DIV element for each element: */
                var itemElement = document.createElement("DIV");
                /* Set formatted address as item value */
                itemElement.innerHTML = feature.properties.formatted;

                /* Set the value for the autocomplete text field and notify: */
                itemElement.addEventListener("click", function(e) {
                    inputElement.value = currentItems[index].properties.formatted;

                    callback(currentItems[index]);

                    /* Close the list of autocompleted values: */
                    closeDropDownList();
                });

                autocompleteItemsElement.appendChild(itemElement);
            });
        }, (err) => {
            if (!err.canceled) {
                console.log(err);
            }
        });
    });

    /* Add support for keyboard navigation */
    inputElement.addEventListener("keydown", function(e) {
        var autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
        if (autocompleteItemsElement) {
            var itemElements = autocompleteItemsElement.getElementsByTagName("div");
            if (e.keyCode == 40) {
                e.preventDefault();
                /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
                focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.keyCode == 38) {
                e.preventDefault();

                /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
                focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.keyCode == 13) {
                /* If the ENTER key is pressed and value as selected, close the list*/
                e.preventDefault();
                if (focusedItemIndex > -1) {
                    closeDropDownList();
                }
            }
        } else {
            if (e.keyCode == 40) {
                /* Open dropdown list again */
                var event = document.createEvent('Event');
                event.initEvent('input', true, true);
                inputElement.dispatchEvent(event);
            }
        }
    });

    function setActive(items, index) {
        if (!items || !items.length) return false;

        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }

        /* Add class "autocomplete-active" to the active element*/
        items[index].classList.add("autocomplete-active");

        // Change input value and notify
        inputElement.value = currentItems[index].properties.formatted;
        callback(currentItems[index]);
    }

    function closeDropDownList() {
        var autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
        if (autocompleteItemsElement) {
            containerElement.removeChild(autocompleteItemsElement);
        }

        focusedItemIndex = -1;
    }

    function addIcon(buttonElement) {
        var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('viewBox', "0 0 24 24");
        svgElement.setAttribute('height', "24");

        var iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        iconElement.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
        iconElement.setAttribute('fill', 'currentColor');
        svgElement.appendChild(iconElement);
        buttonElement.appendChild(svgElement);
    }

    /* Close the autocomplete dropdown when the document is clicked. 
      Skip, when a user clicks on the input field */
    document.addEventListener("click", function(e) {
        if (e.target !== inputElement) {
            closeDropDownList();
        } else if (!containerElement.querySelector(".autocomplete-items")) {
            // open dropdown list again
            var event = document.createEvent('Event');
            event.initEvent('input', true, true);
            inputElement.dispatchEvent(event);
        }
    });

}

var from_;
var to_;

addressAutocomplete(document.getElementById("autocomplete-container-city"), (data) => {
    console.log("Selected city: ");
    console.log(data);
    getNearByInfo(data.properties.lat.toFixed(7), data.properties.lon.toFixed(7));
}, {
    placeholder: "Search for City"
});

addressAutocomplete(document.getElementById("autocomplete-container-city1"), (data) => {
    console.log("Selected city: ");
    console.log(data);
    from_ = [data.properties.lat, data.properties.lon];
}, {
    placeholder: "From"
});

addressAutocomplete(document.getElementById("autocomplete-container-city2"), (data) => {
    console.log("Selected city: ");
    console.log(data);
    to_ = [data.properties.lat, data.properties.lon];
}, {
    placeholder: "To"
});

function markPosition(position) {
    lat = position.properties.lat;
    lng = position.properties.lon;
    console.log(`Latitude: ${lat}, longitude: ${lng}`);
    if (marker != null) {
        map.removeLayer(marker);
    }

    map.panTo([lat, lng], 10);

    const markerIcon = L.icon({
        iconUrl: `https://api.geoapify.com/v1/icon/?type=material&color=red&icon=location&iconType=awesome&apiKey=${apiKey}`,
    });

    const MarkerPopup = L.popup().setContent(position.properties.address_line1);
    const marker = L.marker([lat, lng], {
        icon: markerIcon
    }).bindPopup(MarkerPopup).addTo(map);
}
routingControl = null;

function setRoute() {
    if (routingControl != null) {
        map.removeControl(routingControl);
        routingControl = null;
        if (marker != null) {
            map.removeLayer(marker);
        }
    }
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(from_),
            L.latLng(to_)
        ],
        routeWhileDragging: true,
        fitSelectedRoutes: true,
    }).addTo(map);
}

function currentLocation() {
    map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
    var marker;
    map.on('locationfound', function(ev) {
        try {
            map.removeLayer(marker);
        } catch (e) {}
        const userIcon = L.icon({
            iconUrl: `https://api.geoapify.com/v1/icon/?type=circle&color=%230040ff&icon=user&iconType=awesome&noShadow&apiKey=${apiKey}`,
        });
        const userPopup = L.popup().setContent("Current Location");
        const marker = L.marker(ev.latlng, {
            icon: userIcon
        }).bindPopup(userPopup).addTo(map);
    })
}

function getNearByInfo(lat, lng) {
    try {
        if (marker != null) {
            map.removeLayer(marker);
        }
    } catch (e) {}
    map.panTo([lat, lng], 13);

    var requestOptions = {
        method: 'GET',
    };
    console.log(lat, lng);
    console.log(`https://api.geoapify.com/v2/places?categories=tourism&filter=circle:${lng},${lat},5000&limit=20&apiKey=${apiKey}`)
    fetch(`https://api.geoapify.com/v2/places?categories=tourism&filter=circle:${lng},${lat},5000&limit=50&apiKey=${apiKey}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            const markerIcon = L.icon({
                iconUrl: `https://api.geoapify.com/v1/icon/?type=material&color=red&icon=attractions&apiKey=${apiKey}`,
            });
            for (var i = 0; i <= result.features.length; ++i) {
                const MarkerPopup = L.popup().setContent(result.features[i].properties.address_line1);
                const marker = L.marker([result.features[i].properties.lat, result.features[i].properties.lon], {
                    icon: markerIcon
                }).bindPopup(MarkerPopup).addTo(map);
            }
        })
        .catch(error => console.log('error', error));

}

function selectCurrentLocation() {
    map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
    map.on('locationfound', function(ev) {
        try {
            map.removeLayer(marker);
        } catch (e) {}
        const userIcon = L.icon({
            iconUrl: `https://api.geoapify.com/v1/icon/?type=circle&color=%230040ff&icon=user&iconType=awesome&noShadow&apiKey=${apiKey}`,
        });
        const userPopup = L.popup().setContent("Your Location");
        const marker = L.marker(ev.latlng, {
            icon: userIcon
        }).bindPopup(userPopup).addTo(map);
        document.getElementById("autocomplete-container-city1").querySelector('input').value = "Your Location";
        from_ = ev.latlng;
    })
}