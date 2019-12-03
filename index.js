let mymap = L.map('mapid').setView([52.359189, 4.899431], 14);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1IjoiZ2lvdmFubmlrYWFpamsiLCJhIjoiY2szcTR0cGJjMDlqcjNpbmpzY3FvNnM2NyJ9.ZjrOail8vBggoDZ6_btYAg'
}).addTo(mymap);


let jsonData = [];
fetch('./map.json')
    .then(res => res.json())
    .then(json => {
        jsonData = json.features;
        console.log(jsonData)
        L.geoJSON(jsonData).addTo(mymap);
        let myStyle = {
            "color": "rgba(255, 0, 0, 1)",
            "fill": "rgba(255, 0, 0, 1)",
            "weight": 1,
            "opacity": 1
        };
        
        L.geoJSON(jsonData, {
            style: myStyle
        }).addTo(mymap);
})

fetch('./toilets.json')
    .then(res => res.json())
    .then(json => {
        jsonData = json.features;
        console.log(jsonData)

        // style: function(feature) {
        //     switch (feature.properties.Soort) {
        //         case 'Amsterdamse krul (m)': return {color: "#ffffff"};
        //         case 'Urilift (m)':   return {color: "#000000"};
        //     }
        // }
        let color = 'steelblue'
        jsonData.forEach(feature => {
            let newFeatureProps = feature.properties
            let newcolor = 'steelblue'
            function switchcolor(){
                switch (newFeatureProps.Soort) {
                    case 'Amsterdamse krul (m)':  { newcolor = "#de2d26"; return newcolor};
                    case "Gewenst toilet":  {newcolor = "#31a354"; return newcolor};
                    case 'Urilift (m)':  {newcolor = "#fdae6b"; return newcolor};
                    case "Openbaar toilet (m/v)": {newcolor = "#addd8e";return newcolor};
                }
            }
            switchcolor()
            newFeatureProps = {
                open: newFeatureProps.Dagen_geopend,
                foto: newFeatureProps.Foto,
                desc: newFeatureProps.Omschrijving,
                open: newFeatureProps.Openingstijden,
                prijs: newFeatureProps.Prijs_per_gebruik,
                selectie: newFeatureProps.SELECTIE,
                soort: newFeatureProps.Soort ? newFeatureProps.Soort : 'none',
                color: newcolor
            }

            console.log(newFeatureProps)
            feature.properties = newFeatureProps
        });
        L.geoJSON(jsonData, {
            pointToLayer: function (feature, latlng) {
                
                var geojsonMarkerOptions = {
                    radius: 8,
                    fillColor: feature.properties.color,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(mymap);
        
        
})

let marker = L.marker([51.5, -0.09]).addTo(mymap);

let circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

let polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

//marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(mymap);
// }

// mymap.on('click', onMapClick);
