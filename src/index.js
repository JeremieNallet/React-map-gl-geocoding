import "./styles.css";
import React, { useState, useCallback } from "react";
import ReactDOM from "react-dom";
import ReactMapGl, { FlyToInterpolator } from "react-map-gl";
import Mapbox from "mapbox";

const App = () => {
    const [inputVal, setInputVal] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const accessToken = process.env.REACT_APP_MAPBOX_TOKEN || "YOUR ACCESS TOKEN";
    const mapbox = new Mapbox(accessToken);

    const [viewport, setViewport] = useState({
        latitude: 48.866667,
        longitude: 2.333333,
        zoom: 10,
    });

    const debounce = (fn, delay) => {
        let timeout;
        return function (...args) {
            clearInterval(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    // ! doc : https://docs.mapbox.com/api/search/

    const getResults = useCallback(
        debounce(async (searchValue) => {
            const params = {
                limit: 5,
                // country etc, ...
            };
            if (searchValue) {
                try {
                    setShowResults(true);
                    const { entity } = await mapbox.geocodeForward(searchValue, params);
                    setSearchResults(entity.features);
                } catch (error) {
                    setShowResults(false);
                    console.error(error);
                }
            }
        }, 200),
        []
    );

    const _onChange = async ({ target: { value } }) => {
        setInputVal(value);
        getResults(value);
    };

    const _onClick = (coords) => {
        const [longitude, latitude] = coords;
        const updatedViewport = {
            longitude,
            latitude,
            zoom: 10,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator(),
        };
        setShowResults(false);
        setViewport({ ...updatedViewport });
        console.log(viewport);
    };

    return (
        <>
            <div className="search">
                <div className="search__container">
                    <input
                        className="search__container--input"
                        value={inputVal}
                        onChange={_onChange}
                        onBlur={() => setShowResults(false)}
                        type="text"
                        placeholder="search"
                    />
                    <div className="search__container--results">
                        {searchResults &&
                            showResults &&
                            searchResults.map(({ place_name, center: coords }, i) => (
                                <ul key={i}>
                                    <li onMouseDown={() => _onClick(coords)}>{place_name}</li>
                                </ul>
                            ))}
                    </div>
                </div>
            </div>
            <div className="map">
                <ReactMapGl
                    {...viewport}
                    width="100vw"
                    height="100vh"
                    mapboxApiAccessToken={accessToken}
                    onViewportChange={setViewport}
                />
            </div>
        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
