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
let toiletsKinds = ['Amsterdamse krul (m)','Urilift (m)','Openbaar toilet (m/v)','Openbaar toilet, toegankelijk voor mindervaliden (m/v)', 'Seizoen (m/v)','Toilet in parkeergarage (m/v)','Overig'];
var baseMaps = {
    "Grayscale": grayscale,
    "Streets": streets
};
L.control.layers(baseMaps).addTo(mymap);
let allToilets = [];
let freeToilets = [];
let paidToilets = [];

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
            thisnewcolor = "#31a354";
          return thisnewcolor;
        }
        case "Openbaar toilet, toegankelijk voor mindervaliden (m/v)": {
            thisnewcolor = "#7fcdbb";
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
        prijs: newFeatureProps.Prijs_per_gebruik === 0 ? 'gratis' : '50cent',
        selectie: newFeatureProps.SELECTIE,
        soort: newFeatureProps.Soort ? newFeatureProps.Soort : "none",
        color: newcolor
      };
      feature.properties = newFeatureProps;
    });
    renderToilets(jsonData)
}



const renderToilets = async (jsonData) => {
    await L.geoJSON(jsonData, {
        pointToLayer: function(feature, latlng) {
          var geojsonMarkerOptions = {
            radius: 8,
            fillColor: feature.properties.color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'marker ' + feature.properties.soort + ' ' + feature.properties.prijs
          };
          return L.circleMarker(latlng, geojsonMarkerOptions);
        }
      , onEachFeature: function(feature, featureLayer) {
            featureLayer.bindPopup(feature.properties.desc +'<br>' + feature.properties.soort + '<br>' + 'Open: ' + feature.properties.open);
    }}).addTo(mymap);
    bindToilets();
}

createToilets()

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
    labels = ['<div class="labels"><strong>Soort toilet</strong><strong class="reset">Reset filters </strong></div>'];
    radio = ['<strong class="price">Gratis?</strong>']
    for (var i = 0; i < toiletsKinds.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getColor(toiletsKinds[i]) + '"></i> ' +
            '<p class="legendItem">' + (toiletsKinds[i] ? toiletsKinds[i] : '+') + '</p>');
        }
        div.innerHTML = labels.join('<br>');
        div.innerHTML += radio
        div.innerHTML += '<input class="priceCalc" type="radio" id="free" name="price" value="free"><label for="free">Gratis</label><br><input class="priceCalc" type="radio" id="notfree" name="price" value="notfree"><label for="notfree">50 Cent</label>'
    return div;
    };
legend.addTo(mymap);

let toilets = {
    amsterdamseKrul: [],
    gewenstToilet: [],
    uriLift: [],
    openBaarToilet: [],
    openBaarMinderValide: [],    
    seizoen: [],
    parkeergarage: [],
    unknown: []
}

function bindToilets() {
    let markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
        let color = marker.attributes.fill.nodeValue; 
        allToilets.push(marker)  
        if(marker.classList.contains('gratis')){
            freeToilets.push(marker)
        } else {
            paidToilets.push(marker)
        }
        switch (color) {
            case "#de2d26": {
                toilets.amsterdamseKrul.push(marker);
              return marker;
            }
            case "#31a354": {
                toilets.openBaarToilet.push(marker);
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
}

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
            let previous = document.querySelector('.clicked')
            previous ? previous.classList.remove('clicked') : null
            this.classList.add('clicked')
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

let radiobuttons = document.querySelectorAll('.priceCalc')

function reset(){
    radiobuttons.forEach(button => {
        button.checked = false;
    })
    allToilets.forEach(toilet => {
        toilet.classList.remove('paidHidden')
    });
    Object.keys(toilets).forEach(toiletCategorie => {
        let filterToilets = (toilets[toiletCategorie])
        filterToilets.forEach(singleToilet => {
            singleToilet.classList.remove('hidden')
        })
    })
}

document.querySelector('.reset').addEventListener('click', reset)


function changePrice() {
    allToilets.forEach(toilet => {
        toilet.classList.remove('paidHidden')
    });
    if(this.value == 'free'){
        paidToilets.forEach(toilet => {
            toilet.classList.add('paidHidden')
        })
    } else {
        freeToilets.forEach(toilet => {
            toilet.classList.add('paidHidden')
        })
    }
}

radiobuttons.forEach(button =>{
    button.addEventListener('click', changePrice)
})
