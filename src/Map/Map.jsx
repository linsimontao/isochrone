import React from 'react'
import mapboxgl from 'mapbox-gl'
import './Map.css'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  updateSettings,
  updateCenter
  //fetchIsochrones 
} from "../actions/actions"

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESSTOKEN
let marker = new mapboxgl.Marker({
  color: '#314ccd',
  draggable: true
})

class Map extends React.Component {
  static propTypes = {
    //mapEvents: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    isochronesControls: PropTypes.object.isRequired
  }

  addIsochronesCenter() {
    let lngLat = this.props.isochronesControls.settings.isochronesCenter;
    if(marker) {
      marker.setLngLat(lngLat)
      this.map.flyTo({
        center: [lngLat.lng, lngLat.lat], 
        essential: true
      })
    }
  }
  
  addIsochrones () {
    let geojson = this.props.isochronesControls.isochrones.results
    if (geojson && geojson.features) {
      this.map.getSource('iso').setData(geojson);
      let coordinates = geojson.features[0].geometry.coordinates[0];
      let bounds = coordinates.reduce(
        function (bounds, coord) {
          return bounds.extend(coord);
        }, 
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      this.map.fitBounds(bounds, {
        padding: 20
      });
    }
  }

  componentDidUpdate() {
    this.addIsochronesCenter()
    if (this.map.getSource('iso')) {
      this.addIsochrones()
    }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [139.714, 35.658],
      zoom: 12
    })
    
    const {isochronesControls, dispatch} = this.props;
    this.map.on(
      'load',
      () => {
        let lngLat = isochronesControls.settings.isochronesCenter
        if (Object.keys(lngLat).length === 0) {
          lngLat = {
            lng: 139.714,
            lat: 35.658
          }
          
          dispatch(
            updateCenter({
              isochronesCenter: lngLat
            })
          )
          
          // isochronesControls.settings.isochronesCenter = lngLat;
          // dispatch(
          //   updateSettings({
          //     settings: isochronesControls.settings
          //   })
          // )

        }
        
        marker.setLngLat(lngLat).addTo(this.map)

        function onDragEnd() {
          let lngLat = marker.getLngLat();
          dispatch(
            updateCenter({
              isochronesCenter: marker.getLngLat()
            })
          )
        }
           
        marker.on('dragend', onDragEnd);

        this.map.addSource('iso', {
          type: 'geojson',
          data: {
            'type': 'FeatureCollection',
            'features': []
          }
        });
    
        this.map.addLayer({
          'id': 'isoLayer',
          'type': 'fill',
          // Use "iso" as the data source for this layer
          'source': 'iso',
          'paint': {
            // The fill color for the layer is set to a light purple
            'fill-color': '#5a3fc0',
            'fill-opacity': 0.3
          },
        }, "poi-label");
      }
    )
  }

  render() {
    return (
      <div>
        <div id='map' className='map-container' />
      </div>
    )
  }
}

const mapStateToProps = state => {
  const isochronesControls = state.isochronesControls;
  return {
    isochronesControls
  };
};

export default connect(mapStateToProps)(Map);