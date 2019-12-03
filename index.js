let mymap = L.map("mapid").setView([52.359189, 4.899431], 14);
let cameraStyle = {
    color: "rgba(255, 0, 0, 1)",
    fill: "rgba(255, 0, 0, 1)",
    weight: 1,
    opacity: 1
  };


L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken:
      "pk.eyJ1IjoiZ2lvdmFubmlrYWFpamsiLCJhIjoiY2szcTR0cGJjMDlqcjNpbmpzY3FvNnM2NyJ9.ZjrOail8vBggoDZ6_btYAg"
  }
).addTo(mymap);
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
        return json;
    });
}

const transformToilets = (json) => {
    let jsonData = json.features;

    jsonData.forEach(feature => {
      let newFeatureProps = feature.properties;
      let newcolor = "steelblue";   
      newcolor = switchcolor(newFeatureProps);
      newFeatureProps = {
        open: newFeatureProps.Dagen_geopend,
        foto: newFeatureProps.Foto,
        desc: newFeatureProps.Omschrijving,
        open: newFeatureProps.Openingstijden,
        prijs: newFeatureProps.Prijs_per_gebruik,
        selectie: newFeatureProps.SELECTIE,
        soort: newFeatureProps.Soort ? newFeatureProps.Soort : "none",
        color: newcolor
      };
      feature.properties = newFeatureProps;
    });

    renderToilets(jsonData)
}

const switchcolor = (feature) => {
    switch (feature.Soort) {
      case "Amsterdamse krul (m)": {
        newcolor = "#de2d26";
        return newcolor;
      }
      case "Gewenst toilet": {
        newcolor = "#31a354";
        return newcolor;
      }
      case "Urilift (m)": {
        newcolor = "#fdae6b";
        return newcolor;
      }
      case "Openbaar toilet (m/v)": {
        newcolor = "#addd8e";
        return newcolor;
      }
      default: { 
        newcolor = 'steelblue'
        return newcolor
      }
    }
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
      }).addTo(mymap);
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

//marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(mymap);
// }

// mymap.on('click', onMapClick);
