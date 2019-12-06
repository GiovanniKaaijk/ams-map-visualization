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
let toiletsKinds = ['Amsterdamse krul (m)','Urilift (m)','Openbaar toilet (m/v)','Openbaar toilet, toegankelijk voor mindervaliden (m/v)','Toilet in parkeergarage (m/v)','Overig'];
var baseMaps = {
    "Zonder context": grayscale,
    "Met context": streets
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
            thisnewcolor = "#31a354";
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
        prijs: newFeatureProps.Prijs_per_gebruik === 0 ? 'gratis' : '50 cent',
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
        let img = '';
        let gratis = '';
        let h2 = '';
        if(feature.properties.soort.includes('Amsterdamse')){
          img = '<img class="icon" src="./images/Iconen/iconen dataweek_Krultoilet.png" alt="">'
          h2 = 'Amsterdams krultoilet'
        } else if (feature.properties.soort.includes('Toilet in parkeergarage')) {
          img = '<img class="icon" src="./images/Iconen/iconen dataweek_WC in parkeergarage.png" alt="">'
          h2 = 'Parkeergarage'
        } else if (feature.properties.soort.includes('Urilift')) {
          img = '<img class="icon" src="./images/Iconen/iconen dataweek_Urilift.png" alt="">'
          h2 = 'Urilift'
        } else if (feature.properties.soort.includes('mindervaliden')) {
          img = '<img class="icon" src="./images/Iconen/iconen dataweek_Invalidetoilet.png" alt="">'
          h2 = 'Mindervalide'
        } else if (feature.properties.soort.includes('Openbaar toilet') || feature.properties.soort.includes('Gewenst toilet') || feature.properties.soort.includes('Seizoen (m/v)')) {
          img = '<img class="icon" src="./images/Iconen/iconen dataweek_Openbare toilet.png" alt="">'
          h2 = 'Openbaar toilet'
        } 
        h2 = '<h2>' + h2 + '</h2>'
        

        if(feature.properties.prijs == 'gratis'){
          gratis = '<img class="icon" src="./images/Iconen/iconen dataweek_Gratis.png" alt="">'
        }
            featureLayer.bindPopup(h2 + '<div>' + img + gratis + '</div>' + feature.properties.desc +'<br>' + feature.properties.soort + '<br>' + 'Open: ' + feature.properties.open + '<br>' + 'Kosten: ' + feature.properties.prijs);
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
        div.innerHTML += "<strong class='camera'>Camera gebieden</strong><i class='circle square' style='background:rgba(255, 0, 0, 1)'></i> <p class='legendItem'>Cameragebied</p><p class='closeLegend'>Sluiten</p>"
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

function filter(invalideFilter) {
    let currentfilter = this.textContent;
    
    if(invalideFilter == 'invalide') {
      currentfilter = 'Openbaar toilet, toegankelijk voor mindervaliden (m/v)';
    }

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
            if(!invalideFilter == 'invalide') { this.classList.add('clicked') }
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


function changePrice(priceFilter) {
    let checker = '';
   checker = this.value;
  if(priceFilter == 'freebutton') {
    checker = 'free'
  }
    allToilets.forEach(toilet => {
        toilet.classList.remove('paidHidden')
    });
    if(checker == 'free'){
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

let legendaBlok = document.querySelector('.leaflet-bottom .leaflet-control.legend');
let showFilter = document.querySelector('.filter')
let closeLegend = document.querySelector('.closeLegend')
showFilter.addEventListener('click', function() {
  showFilter.classList.toggle('hideFilter')
  legendaBlok.classList.toggle('show')
})
closeLegend.addEventListener('click', function() {
  showFilter.classList.toggle('hideFilter')
  legendaBlok.classList.toggle('show')
})

let normalbutton = document.querySelector('.normal');
let invalidebutton = document.querySelector('.invalide');
let gratisbutton = document.querySelector('.freebutton');
let overlay = document.querySelector('.overlay');

normalbutton.addEventListener('click', function() {
  overlay.classList.add('hide')
})

invalidebutton.addEventListener('click', function(){
  filter('invalide')
  overlay.classList.add('hide')
})
gratisbutton.addEventListener('click', function() {
  changePrice('freebutton')
  overlay.classList.add('hide')
})