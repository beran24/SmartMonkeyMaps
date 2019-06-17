import React, { Component, Fragment } from "react";
import { Map, TileLayer, Marker, Polyline } from "react-leaflet";
import { decode } from "@mapbox/polyline";
import L from "leaflet";
import axios from "axios";

const url =
  "https://services.smartmonkey.io/api/v1/optimize?key=R0ZiNUNnYW9QRE91cDU2dmFZVWhhL0loWFhlSWZZOGhGcXFRTEJaRVo4SVJ2dGpRaGlpWkNJeVdSQ2VVbVM2Rk5kYmtBVXVZbkxmSDAwWWRkQk5za3c9PQ==";
export default class MapExample extends Component {
  state = {
    center: {
      lat: 41.3887901,
      lng: 2.1589899
    },
    zoom: 12,
    draggable: true,
    markerData: [],
    route: undefined
  };

  addMarker = event => {
    const { markerData } = this.state;
    const coords = event.latlng;
    this.setState({
      markerData: [...markerData, coords]
    });
  };

  updateMarker = event => {
    console.log(this.state.markerData);
    const latLng = event.target.getLatLng(); //get marker LatLng
    const markerIndex = event.target.options.marker_index; //get marker index
    //update
    this.setState(
      prevState => {
        const markerData = [...prevState.markerData];
        markerData[markerIndex] = latLng;
        return { markerData: markerData };
      },
      () => this.onClickBtn()
    );
  };

  onClickBtn = () => {
    console.log(this.state);
    axios
      .post(url, {
        services: this.state.markerData.map((marker, i) => ({
          id: i.toString(),
          location: {
            lat: marker.lat,
            lng: marker.lng
          }
        })),
        vehicles: [{ id: "vehicle1" }]
      })
      .then(response => {
        console.log(response);
        this.setState({
          route: decode(response.data.solution.routes[0].geometry).map(c => ({
            lat: c[0],
            lng: c[1]
          }))
        });
      })
      .catch(error => console.log(error));
  };

  render() {
    const { route } = this.state;
    return (
      <Fragment>
        <button onClick={this.onClickBtn}>Send</button>
        <Map
          center={this.state.center}
          zoom={this.state.zoom}
          onClick={this.addMarker}
        >
          <TileLayer
            attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {this.state.markerData.map((element, index) => (
            <Marker
              key={index}
              marker_index={index}
              customized={"test" + index}
              position={element}
              draggable={this.state.draggable}
              onDragend={this.updateMarker}
            />
          ))}
          {route && <Polyline positions={route} />}
        </Map>
      </Fragment>
    );
  }
}
