import React, { useRef, useEffect } from 'react';
import { Container, Input } from 'reactstrap';

const google = window.google;

const App: React.FC = () => {
  const ref = useRef<HTMLInputElement | null>(null);
  const latRef = useRef<HTMLInputElement | null>(null);
  const lngRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = ref.current;
    if (!input) {
      return;
    }
    const options = {
      types: ['(cities)'],
      fields: ['geometry.location'],
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);
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
        latRef.current.value = location.lat().toString()
      }
      if (lngRef.current) {
        lngRef.current.value = location.lng().toString()
      }
    });
  }, []);

  return (
    <div className="App">
      <Container>
        <Input
          type="text"
          innerRef={ref}
          style={{display: 'block', width: '100%'}}
        />

        <Input
          innerRef={latRef}
          placeholder="lat"
          readOnly
        />

        <Input
          innerRef={lngRef}
          placeholder="lat"
          readOnly
        />
        Documentation
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
      </Container>
    </div>
  );
}

export default App;
