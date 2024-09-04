let map = null
// Create Layer Controls
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
});

var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

var Googlesat = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
  attribution: 'Imagery © <a href="http://maps.google.com">Google</a>',
  maxZoom: 25,
  id: 'map' 
});

  map = L.map('map',{
  center: [41.79609233612006, -88.00718145869156],
  zoom: 8,
  minZoom:1,
  maxZoom:17,
  layers: [osm]
});

// define the basemaps
var basemaps = {
  "OpenStreetMap":osm,
  "DarkMatter":CartoDB_DarkMatter,
  "Google Satellite":Googlesat
};

// Add the layer control
var layerControl = L.control.layers(basemaps).addTo(map)


// Create a Custom Marker for Headquarters
const markerIcon = L.icon({
  iconUrl: 'Assets/heart_exclamation.png',
  iconSize: [31, 46], // size of the icon
  iconAnchor: [15.5, 42], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -45] // point from which the popup should open relative to the iconAnchor
});

const wattsOfLove = L.marker([41.79609233612006, -88.00718145869156], {
  icon: markerIcon
}).addTo(map).bindPopup(`
  <div style="text-align:center;">
    <h3>Watts of Love, Chicago</h3>
    <img src="Assets/Office.JPG" alt="Watts of Love" style="width:150px;height:100px;">
    <p>Welcome to Watts of Love!</p>
  </div>
`).openPopup();

// ============================== Load the intervention areas dataset ===============================
let geojsonLayer;
let legend;
let path;  // Define path globally so it can be removed
let allPaths = [];  // Store all vector lines and markers to be removed

function loadGeoJson() {
    document.getElementById('storyLegend').style.display = 'none';
    // Close the watts of love popup
    osm.addTo(map);
    wattsOfLove.closePopup();

    // Remove the Dark Matter base layer if it exists
    if (map.hasLayer(CartoDB_DarkMatter)) {
        map.removeLayer(CartoDB_DarkMatter);
    }

    // Remove any existing vector paths or plane icons (if any)
    if (allPaths.length > 0) {
        allPaths.forEach(function(item) {
            map.removeLayer(item);
        });
        allPaths = []; // Clear the array after removing all items
    }

  
    // Remove the vector path if it exists
    if (path) {
        map.removeLayer(path);
        path = null; // Reset the path variable
    }

    // Remove the points dataset
    if (pointjsonLayer) {
        map.removeLayer(pointjsonLayer);
        // path = null; // Reset the path variable
    }

    
    // Check if the GeoJSON layer already exists on the map
    if (geojsonLayer) {
        return; // If it exists, do nothing and return
    }

    let breaks = [1, 3, 5]; // Breakpoints for 1-2, 3-4, and 5 or more
    let colors = ["#fc8d59", "#e34a33", "#b30000"]; // Light red to dark red for the classes

    function stat_color(d) {
        if (d >= 5) {
            return colors[2]; // Dark red for 5 or more
        }
        if (d >= 3) {
            return colors[1]; // Medium red for 3-4
        }
        if (d >= 1) {
            return colors[0]; // Light red for 1-2
        }
        return "#fef0d9"; // Default fallback color for values below 1
    }

    // Set styling
    function stat_style(feature) {
        return {
            fillColor: stat_color(feature.properties.InterventionInterventions),
            weight: 0.5,
            opacity: 1,
            color: "black",
            fillOpacity: 0.7
        };
    }

    // Fetch and add the GeoJSON layer to the map
    fetch("Assets/World_Interventions.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            geojsonLayer = L.geoJSON(data, {
                style: stat_style,
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(
                        '<div class="popup">' +
                        feature.properties.COUNTRY + "<br>" +
                        '</div>'
                    );
                }
            }).addTo(map);
            map.setView([1.7289059207917585, 11.998027949326737], 1.5);
        });

    // Create and add the legend to the map
    legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        div.innerHTML =
            '<img src="Assets/Legend_Icon.png" class="legend-image" alt="Solar Light"><br>' +
            '<b>Countries Impacted</b><br><i>Number of Impacted Lives</i><br>';

        // Add the legend for each class
        div.innerHTML +=
            '<div style="background-color: ' + colors[0] + '"></div>' +
            '1 - 2<br>' +
            '<div style="background-color: ' + colors[1] + '"></div>' +
            '3 - 4<br>' +
            '<div style="background-color: ' + colors[2] + '"></div>' +
            '5 or more<br>';

        return div;
    };

    legend.addTo(map);
}

// Add event listener to the button
document.getElementById('loadMapBtn').addEventListener('click', loadGeoJson);

// ================================ Add Travel Map ================================
function loadDestinations() {
    document.getElementById('storyLegend').style.display = 'none';
    wattsOfLove.closePopup();
    // Remove the GeoJSON layer if it exists
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
        geojsonLayer = null; // Reset the geojsonLayer variable
    }

    // Remove the points dataset
    if (pointjsonLayer) {
        map.removeLayer(pointjsonLayer);
    }

    // Remove the legend if it exists
    if (legend) {
        map.removeControl(legend);
        legend = null; // Reset the legend variable
    }

    // Remove any existing vector paths or plane icons (if any)
    if (allPaths.length > 0) {
        allPaths.forEach(function(item) {
            map.removeLayer(item);
        });
        allPaths = []; // Clear the array after removing all items
    }

    // Define map and initialize if needed
    CartoDB_DarkMatter.addTo(map);

    // Coordinates for locations
    const chicagoLatLng = [41.8781, -87.6298];
    const zambiaLatLng = [-13.1339, 27.8493];
    const kenyaLatLng = [-1.2921, 36.8219];

    // Array to store the locations
    let allLatLngs = [chicagoLatLng];

    // Variable to store the currently clicked marker
    let lastClickedMarker = null;

    // Function to create a curve and plane icon
    function createCurvedLine(fromLatLng, toLatLng, countryName, scheduleDate) {
        // Midpoint calculation for placing the plane
        const midLatLng = [
            (fromLatLng[0] + toLatLng[0]) / 2,
            (fromLatLng[1] + toLatLng[1]) / 2
        ];

        // Create the curve using leaflet-curve plugin syntax
        path = L.curve(
            [
                'M', fromLatLng,
                'Q', midLatLng, toLatLng
            ],
            {
                color: '#E22726', // Line color
                weight: 2      // Line thickness
            }
        ).addTo(map);

        // Add plane icon at the endpoint of the curve
        const planeIcon = L.icon({
            iconUrl: 'Assets/Airplane.png',  // Replace with your plane image path
            iconSize: [30, 30],  // Size of the icon
            iconAnchor: [15, 15]  // Anchor point of the icon
        });

        // Create the marker for the plane
        let planeMarker = L.marker(toLatLng, { icon: planeIcon }).addTo(map);

        // Store paths and markers to allPaths array
        allPaths.push(path, planeMarker);

        // Hover event to show the country name and schedule date
        planeMarker.bindTooltip(`
            <div>
                <strong>Country:</strong> ${countryName}<br>
                <strong>Schedule:</strong> ${scheduleDate}
            </div>
        `, { permanent: false, direction: "top", className: "tooltip-custom" });

        // Click event to change the marker's color and reset the last clicked one
        planeMarker.on('click', function() {
            if (lastClickedMarker) {
                // Reset the previous marker to the original plane icon
                lastClickedMarker.setIcon(planeIcon);
            }

            // Change the clicked marker's icon to a different color (red in this case)
            const redPlaneIcon = L.icon({
                iconUrl: 'Assets/red-plane.png',  // Replace with your red plane image path
                iconSize: [30, 30],  // Size of the icon
                iconAnchor: [15, 15]  // Anchor point of the icon
            });
            planeMarker.setIcon(redPlaneIcon);

            // Store this marker as the last clicked marker
            lastClickedMarker = planeMarker;
        });
    }

    // Create curves and markers for each destination
    createCurvedLine(chicagoLatLng, zambiaLatLng, 'Zambia', 'Sep 6, 2024 to Sep 15, 2024');
    createCurvedLine(chicagoLatLng, kenyaLatLng, 'Kenya', 'Mar 13, 2025 to Mar 21, 2025');

    // Adjust map view
    map.setView([1.7289, 11.9980], 1.5);
}

// Call the function to load the destinations when the button is clicked
document.getElementById('loadDestinations').addEventListener('click', loadDestinations);


//================================== Load Stories Section ===================
// Variables to store the geojson layer and story legend control
let pointjsonLayer;
let storyLegend;

// // Function to load stories
// function loadStories() {
//     // Remove the existing GeoJSON layer if it's already added
//     if (pointjsonLayer) {
//         map.removeLayer(pointjsonLayer);
//     }

//     // Remove the GeoJSON layer if it exists
//     if (geojsonLayer) {
//         map.removeLayer(geojsonLayer);
//         geojsonLayer = null; // Reset the geojsonLayer variable
//     }

//     // Remove the Dark Matter base layer if it exists
//     if (map.hasLayer(CartoDB_DarkMatter)) {
//         map.removeLayer(CartoDB_DarkMatter);
//     }

//     // Remove the legend if it exists
//     if (legend) {
//         map.removeControl(legend);
//         legend = null; // Reset the legend variable
//     }

//     // Remove any existing vector paths or plane icons (if any)
//     if (allPaths.length > 0) {
//         allPaths.forEach(function(item) {
//             map.removeLayer(item);
//         });
//         allPaths = []; // Clear the array after removing all items
//     }

//     // Fetch the GeoJSON data
//     fetch('Assets/impact_stories.geojson')
//         .then(response => response.json())
//         .then(data => {

//             // Show the story section when the button is clicked
//             document.getElementById('storyLegend').style.display = 'block';
//             // Create the GeoJSON layer
//             pointjsonLayer = L.geoJSON(data, {
//                 pointToLayer: function (feature, latlng) {
//                     return L.marker(latlng);
//                 },
//                 onEachFeature: function (feature, layer) {
//                     layer.on('click', function () {
//                         // Update the story section with details from the clicked point
//                         updateStorySection(
//                             feature.properties.Country || 'Unknown Country',
//                             feature.properties.Location || 'Unknown Location',
//                             feature.properties.Title || 'No Title',
//                             feature.properties.Story || 'No Story Available',
//                             feature.properties.Image || 'default-image.jpg'
//                         );
//                     });
//                 }
//             }).addTo(map);

//             // Fit the map bounds to the GeoJSON layer
//             map.fitBounds(pointjsonLayer.getBounds());
//         })
//         .catch(error => console.error('Error loading GeoJSON:', error));
// }

// // Function to update the story section inside the "side" container
// function updateStorySection(country, location, title, story, image) {
//     storyLegend = document.getElementById('storyLegend');
//     storyLegend.innerHTML = `
//         <h3>${title}</h3>
//         <p><strong>Country:</strong> ${country}</p>
//         <p><strong>Location:</strong> ${location}</p>
//         <img src="${image}" alt="Impact Story Image">
//         <p>${story}</p>
//     `;
// }

// // Attach the loadStories function to the button click event
// document.getElementById('loadStories').addEventListener('click', loadStories);
// Global variable to keep track of the previously clicked marker
let lastClickedMarker = null;

// Function to load stories
function loadStories() {
    // Remove existing layers and controls
    if (pointjsonLayer) {
        map.removeLayer(pointjsonLayer);
    }
    if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
        geojsonLayer = null;
    }
    if (map.hasLayer(CartoDB_DarkMatter)) {
        map.removeLayer(CartoDB_DarkMatter);
    }
    if (legend) {
        map.removeControl(legend);
        legend = null;
    }
    if (allPaths.length > 0) {
        allPaths.forEach(function(item) {
            map.removeLayer(item);
        });
        allPaths = [];
    }

    // Fetch the GeoJSON data
    fetch('Assets/impact_stories.geojson')
        .then(response => response.json())
        .then(data => {

            // Show the story section when the button is clicked
            document.getElementById('storyLegend').style.display = 'block';

            // Define red icon for clicked marker
            const redIcon = L.icon({
                iconUrl: 'Assets/red_marker.png', 
                iconSize: [40, 40],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            });

            // Define default icon
            const defaultIcon = L.icon({
                iconUrl: 'Assets/blue_marker.png', 
                iconSize: [40, 40],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            });

            // Create the GeoJSON layer
            pointjsonLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, { icon: defaultIcon });
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function () {
                        // Update the story section with details from the clicked point
                        updateStorySection(
                            feature.properties.Country || 'Unknown Country',
                            feature.properties.Location || 'Unknown Location',
                            feature.properties.Title || 'No Title',
                            feature.properties.Story || 'No Story Available',
                            feature.properties.Image || 'default-image.jpg'
                        );

                        // Change the color of the clicked marker
                        if (lastClickedMarker) {
                            lastClickedMarker.setIcon(defaultIcon);
                        }
                        layer.setIcon(redIcon);
                        lastClickedMarker = layer;
                    });
                }
            }).addTo(map);

            // Fit the map bounds to the GeoJSON layer
            map.fitBounds(pointjsonLayer.getBounds());
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
}

// Function to update the story section inside the "side" container
function updateStorySection(country, location, title, story, image) {
    const storyLegend = document.getElementById('storyLegend');
    storyLegend.innerHTML = `
        <h3>${title}</h3>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Location:</strong> ${location}</p>
        <img src="${image}" alt="Impact Story Image" style="width: 100%; height: auto;">
        <p>${story}</p>
    `;
}

// Attach the loadStories function to the button click event
document.getElementById('loadStories').addEventListener('click', loadStories);
