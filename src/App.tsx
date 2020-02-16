import React, { useRef, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button, Input, message } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

const CheckboxGroup = Checkbox.Group;

const google = window.google;

const App: React.FC = () => {
  const inputRef = useRef<Input | null>(null);
  const textareaRef = useRef<TextArea | null>(null);
  const latRef = useRef<Input | null>(null);
  const lngRef = useRef<Input | null>(null);
  const [latLng, setLatLng] = useState<{lat: number, lng: number}>();
  const [place, setPlace] = useState<google.maps.places.PlaceResult | undefined>();

  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([])
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

  const checkedListSet = new Set(checkedList);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const options = {
      fields: ['name', 'formatted_address', 'geometry.location', 'url', 'place_id'],
    };

    const autocomplete = new google.maps.places.Autocomplete(input.input, options);

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
        setPlace(undefined);
        return;
      }

      const location = geometry.location;
      if (!location) {
        setPlace(undefined);
        return;
      }

      if (latRef.current) {
        latRef.current.input.value = location.lat().toString()
      }
      if (lngRef.current) {
        lngRef.current.input.value = location.lng().toString()
      }

      setLatLng({
        lat: location.lat(),
        lng: location.lng(),
      });

      setPlace(place);
      if (place.place_id && checkedListSet.has('opening_hours/weekday_text')) {
        let placesServicesFields = [];

        if (checkedListSet.has('opening_hours/open_now') ||
            checkedListSet.has('opening_hours/weekday_text')) {
          placesServicesFields.push("opening_hours");
        }

        if (checkedListSet.has('website')) {
          placesServicesFields.push("website");
        }

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails(
          {
            placeId: place.place_id,
            fields: placesServicesFields,
          },
          (newPlace) => {
            setPlace({...newPlace, ...place})
          }
        );
      }
    });
  }, [checkedList, checkedListSet]);

  let details = null;
  if (place) {
    const nit = [
      place.name,
      place.formatted_address,
      place.url,
    ];

    if (place.opening_hours) {
      if (place.opening_hours.open_now) {
        nit.push("Open Now")
      } else {
        nit.push("Closed");
      }

      if (place.opening_hours.weekday_text) {
        nit.push(
          "Hours",
          place.opening_hours?.weekday_text.join("\n")
        );
      } else {
        nit.push("Unknown hours");
      }
    }

    details = nit.filter(detail => detail?.length).join("\n");
  }

  const googleMaps = latLng
    ? <>
        <Button href={place?.url}>
          Open {place?.name} in Google Maps
        </Button>
        {' '}
        <Button href={`https://www.google.com/maps/?q=${latLng.lat},${latLng.lng}`}>
          Open Coordinates in Google Maps
        </Button>
      </>
    : null;

  return (
    <div className="App">
      <div className="mt-2">
        <div className="mb-2">
          <div>
            <div style={{ borderBottom: '1px solid #E9E9E9' }}>
              <Checkbox
                indeterminate={indeterminate}
                checked={checkAll}
                onChange={(e) => {
                  setCheckedList(e.target.checked ? ['opening_hours/weekday_text', 'website'] : []);
                  setIndeterminate(false);
                  setCheckAll(e.target.checked);
                }}
              >
                Check all
              </Checkbox>
            </div>
            <br />
            <CheckboxGroup
              options={[
                { label: 'Opening Hours', value: 'opening_hours/weekday_text' },
                { label: 'Website', value: 'website' },
              ]}
              value={checkedList}
              onChange={(newCheckedList) => {
                setCheckedList(newCheckedList)
                setIndeterminate(!newCheckedList.length && newCheckedList.length < 2)
                setCheckAll(newCheckedList.length === 2)
              }}
            />
          </div>

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
            value={details ?? ''}
            ref={textareaRef}
            style={{resize: 'none'}}
            readOnly
            autoSize
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
            Copy Details
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
