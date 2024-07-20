import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix for default marker icon
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

const MapPicker = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const LocationPicker = ({ position, setPosition }) => {
  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} />
      <MapPicker setPosition={setPosition} />
    </MapContainer>
  );
};

export default LocationPicker;