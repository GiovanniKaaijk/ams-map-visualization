let mapboxUrl = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
let grayscale = L.tileLayer(mapboxUrl, {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/light-v9",
    accessToken:
      "pk.eyJ1IjoiZ2lvdmFubmlrYWFpamsiLCJhIjoiY2szcTR0cGJjMDlqcjNpbmpzY3FvNnM2NyJ9.ZjrOail8vBggoDZ6_btYAg"
  });
 let streets   = L.tileLayer(mapboxUrl, {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken:
          "pk.eyJ1IjoiZ2lvdmFubmlrYWFpamsiLCJhIjoiY2szcTR0cGJjMDlqcjNpbmpzY3FvNnM2NyJ9.ZjrOail8vBggoDZ6_btYAg"
      });
let mymap = L.map("mapid", {layers: [grayscale]}).setView([52.369189, 4.899431], 14);
let toiletsKinds = ['Amsterdamse krul (m)','Gewenst toilet','Urilift (m)','Openbaar toilet (m/v)','Openbaar toilet, toegankelijk voor mindervaliden (m/v)', 'Onzeker', 'Seizoen (m/v)','Toilet in parkeergarage (m/v)'];
var baseMaps = {
    "Grayscale": grayscale,
    "Streets": streets
};
L.control.layers(baseMaps).addTo(mymap);


let cameraStyle = {
    color: "rgba(255, 0, 0, 1)",
    fill: "rgba(255, 0, 0, 1)",
    weight: 1,
    opacity: 1
  };

function getColor(d) {
let thisnewcolor;
    switch (d) {
        case "Amsterdamse krul (m)": {
            thisnewcolor = "#de2d26";
          return thisnewcolor;
        }
        case "Gewenst toilet": {
            thisnewcolor = "#31a354";
          return thisnewcolor;
        }
        case "Urilift (m)": {
            thisnewcolor = "#fdae6b";
          return thisnewcolor;
        }
        case "Openbaar toilet (m/v)": {
            thisnewcolor = "#addd8e";
          return thisnewcolor;
        }
        case "Openbaar toilet, toegankelijk voor mindervaliden (m/v)": {
            thisnewcolor = "#7fcdbb";
          return thisnewcolor;
        }
        case "Onzeker": {
            thisnewcolor = "#fa9fb5";
          return thisnewcolor;
        }
        case "Seizoen (m/v)": {
            thisnewcolor = "#c51b8a";
          return thisnewcolor;
        }
        case "Toilet in parkeergarage (m/v)": {
            thisnewcolor = "#edf8b1";
          return thisnewcolor;
        }
        default: { 
            thisnewcolor = 'steelblue'
          return thisnewcolor
        }
      }
}

const createMap = async () => {
  let mapJson = await fetchMap();
  rendermap(mapJson);
};

const fetchMap = () => {
  return fetch("./map.json")
    .then(res => res.json())
    .then(json => {
      return json
    });
};

const rendermap = json => {
  L.geoJSON(json.features, {
    style: cameraStyle
  }).addTo(mymap);
};

createMap()

const createToilets = async () => {
    let toiletData = await fetchToilets()
    transformToilets(toiletData)
}

const fetchToilets = () => {
    return fetch("./toilets.json")
    .then(res => res.json())
    .then(json => {
        console.log(json)
        return json;
    });
}

const transformToilets = (json) => {
    let jsonData = json.features;

    jsonData.forEach(feature => {
      let newFeatureProps = feature.properties;
      let newcolor = "steelblue";   
      newcolor = getColor(newFeatureProps.Soort);
      newFeatureProps = {
        open: newFeatureProps.Dagen_geopend,
        foto: newFeatureProps.Foto,
        desc: newFeatureProps.Omschrijving,
        open: newFeatureProps.Openingstijden ? newFeatureProps.Openingstijden : 'Niet bekend',
        prijs: newFeatureProps.Prijs_per_gebruik,
        selectie: newFeatureProps.SELECTIE,
        soort: newFeatureProps.Soort ? newFeatureProps.Soort : "none",
        color: newcolor
      };
      feature.properties = newFeatureProps;
    });

    renderToilets(jsonData)
}



const renderToilets = (jsonData) => {
    L.geoJSON(jsonData, {
        pointToLayer: function(feature, latlng) {
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
      , onEachFeature: function(feature, featureLayer) {
            featureLayer.bindPopup(feature.properties.desc +'<br>' + feature.properties.soort + '<br>' + 'Open: ' + feature.properties.open);
    }}).addTo(mymap);
}

createToilets()

let marker = L.marker([51.5, -0.09]).addTo(mymap);

let circle = L.circle([51.508, -0.11], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500
}).addTo(mymap);

let polygon = L.polygon([
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047]
]).addTo(mymap);

var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(mymap);
// }

// mymap.on('click', onMapClick);


let legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Soort toilet</strong>'];

    for (var i = 0; i < toiletsKinds.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getColor(toiletsKinds[i]) + '"></i> ' +
            '<p class="legendItem">' + (toiletsKinds[i] ? toiletsKinds[i] : '+') + '</p>');

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
legend.addTo(mymap);

let toilets = {
    amsterdamseKrul: [],
    gewenstToilet: [],
    uriLift: [],
    openBaarToilet: [],
    openBaarMinderValide: [],
    onzeker: [],
    seizoen: [],
    parkeergarage: [],
    unknown: []
}

setTimeout(() => {
    let markers = document.querySelectorAll('path');
    markers.forEach(marker => {
        let color = marker.attributes.fill.nodeValue;   
        switch (color) {
            case "#de2d26": {
                toilets.amsterdamseKrul.push(marker);
              return marker;
            }
            case "#31a354": {
                toilets.gewenstToilet.push(marker);
              return marker;
            }
            case "#fdae6b": {
                toilets.uriLift.push(marker);
              return marker;
            }
            case "#addd8e": {
                toilets.openBaarToilet.push(marker)
              return marker;
            }
            case "#7fcdbb": {
                toilets.openBaarMinderValide.push(marker)
              return marker;
            }
            case "#fa9fb5": {
                toilets.onzeker.push(marker)
              return marker;
            }
            case "#c51b8a": {
                toilets.seizoen.push(marker)
              return marker;
            }
            case "#edf8b1": {
                toilets.parkeergarage.push(marker)
              return marker;
            }
            default: { 
                toilets.unknown.push(marker)
              return marker
            }
          }
    });
    console.log(toilets)
}, 1000);

function filter() {

    let currentfilter = this.textContent;
    if(currentfilter == 'Amsterdamse krul (m)'){
        currentfilter = 'amsterdamseKrul';
    } else if (currentfilter == 'Gewenst toilet'){
        currentfilter = 'gewenstToilet'
    } else if (currentfilter == 'Urilift (m)'){
        currentfilter = 'uriLift'
    }else if (currentfilter == 'Openbaar toilet (m/v)'){
        currentfilter = 'openBaarToilet'
    }else if (currentfilter == 'Openbaar toilet, toegankelijk voor mindervaliden (m/v)'){
        currentfilter = 'openBaarMinderValide'
    }else if (currentfilter == 'Onzeker'){
        currentfilter = 'onzeker'
    }else if (currentfilter == 'Seizoen (m/v)'){
        currentfilter ='seizoen'
    }else if (currentfilter == 'Toilet in parkeergarage (m/v)'){
        currentfilter = 'parkeergarage'
    }
    Object.keys(toilets).forEach(toiletCategorie => {
        let filterToilets = (toilets[toiletCategorie])
        filterToilets.forEach(singleToilet => {
            singleToilet.classList.remove('hidden')
        })
        if (currentfilter == toiletCategorie){
            null
        } else {
            filterToilets.forEach(singleToilet => {
                singleToilet.classList.add('hidden')
            })
        }
    })
}

let legenda = document.querySelectorAll('.legendItem')
legenda.forEach(legendaItem => {
    legendaItem.addEventListener('click', filter)
})

