import React, { useRef, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button, Input, message } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import ReactDOM from 'react-dom';

const google = window.google;

const App: React.FC = () => {
  const inputRef = useRef<Input | null>(null);
  const textareaRef = useRef<TextArea | null>(null);
  const latRef = useRef<Input | null>(null);
  const lngRef = useRef<Input | null>(null);
  const [latLng, setLatLng] = useState<{lat: number, lng: number}>();
  const [details, setDetails] = useState('Details');

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const options = {
      fields: ['name', 'formatted_address', 'geometry.location', 'url', 'place_id'],
    };

    const autocomplete = new google.maps.places.Autocomplete(input.input, options);
    // const placesService = new google.maps.places.PlacesService(input);

    navigator.geolocation.getCurrentPosition((position) =>  {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle(
        {
          center: geolocation,
          radius: position.coords.accuracy,
        },
      );
      autocomplete.setBounds(circle.getBounds());
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const geometry = place.geometry;
      if (!geometry) {
        return;
      }

      const location = geometry.location;
      if (!location) {
        return;
      }

      if (latRef.current) {
        latRef.current.input.value = location.lat().toString()
      }
      if (lngRef.current) {
        lngRef.current.input.value = location.lng().toString()
      }
        debugger;
      setLatLng({
        lat: location.lat(),
        lng: location.lng(),
      });

      setDetails(`${place.name}\n${place.formatted_address}\n${place.url}`);
      if (textareaRef.current) {
        const textarea = ReactDOM.findDOMNode(textareaRef.current) as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }

      // if (!place.place_id) {
      //   return;
      // }

      // placesService.getDetails(
      //   {
      //     placeId: place.place_id,
      //     fields: ['url'],
      //   },
      //   (details) => {
      //   }
      // )
    });
  }, []);

  const googleMaps = latLng
    ? 
      <Button href={`https://www.google.com/maps/?q=${latLng.lat},${latLng.lng}`}>
        Open Google Maps
      </Button>
    : null;

  return (
    <div className="App">
      <div className="mt-2">
        <div className="mb-2">
          <Input
            type="text"
            ref={inputRef}
            allowClear
            className="mb-1"
          />

          <Input
            ref={latRef}
            value={latLng?.lat}
            placeholder="lat"
            readOnly
            className="mb-1"
          />

          <Input
            ref={lngRef}
            value={latLng?.lng}
            placeholder="lng"
            readOnly
            className="mb-1"
          />

          <TextArea
            value={details}
            ref={textareaRef}
            style={{resize: 'none'}}
            readOnly
          />
          <Button
            icon="copy"
            onClick={() => {
              if (!textareaRef.current) {
                return;
              }
              copy(textareaRef.current.resizableTextArea.textArea.value);
              message.success('Copied!')
            }}
            >
            Copy
          </Button>
        </div>

        {googleMaps}

        <h1>Documentation</h1>

        <ul>
          <li>
            <a href="https://developers.google.com/maps/documentation/javascript/places-autocomplete">
              Places Autocomplete
            </a>
          </li>
          <li>
            <a href="https://developers.google.com/maps/documentation/javascript/reference/places-widget">
              API Reference
            </a>
          </li>
          <li>
            <a href="https://developers.google.com/places/web-service/usage-and-billing">
              Usage and Billing
            </a>
          </li>
        </ul>
        Google Cloud Platform:
        <ul>
          <li>
            <a href={`https://console.cloud.google.com/apis/credentials?supportedpurview=project&project=${process.env.REACT_APP_PROJECT}`}>
              API Credentials
            </a>
          </li>
          <li>
            <a href={`https://console.cloud.google.com/google/maps-apis/apis/maps-backend.googleapis.com/metrics?supportedpurview=project&project=${process.env.REACT_APP_PROJECT}`}>
              Manage Maps JavaScript API
            </a>
          </li>
          <li>
            <a href={`https://console.cloud.google.com/google/maps-apis/apis/places-backend.googleapis.com/metrics?supportedpurview=project&project=${process.env.REACT_APP_PROJECT}`}>
              Manage Places API
            </a>
          </li>
          <li>
            <a href={`https://console.cloud.google.com/billing/linkedaccount?supportedpurview=project&project=${process.env.REACT_APP_PROJECT}`}>
              Billing
            </a>
          </li>
        </ul>
        Error Messages:
        <ul>
          <li>
            <a href="https://developers.google.com/maps/documentation/javascript/error-messages#api-not-activated-map-error">
              Google Maps JavaScript API error: ApiNotActivatedMapError
            </a>
          </li>
          <li>
            <p>
              You have exceeded your daily request quota for this API. If you did not set a custom daily request quota, verify your project has an active billing account: <a href="http://g.co/dev/maps-no-account ">http://g.co/dev/maps-no-account</a>
            </p>
            <p>
              For more information on usage limits and the Google Maps JavaScript API services please see: <a href="https://developers.google.com/maps/documentation/javascript/usage">https://developers.google.com/maps/documentation/javascript/usage</a>
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
