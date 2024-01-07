// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { useSearchParams } from "react-router-dom";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../context/CitiesContexts";
//import { useURLPostion } from "../hooks/useURLPostion";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
function useURLPostion() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  //console.log(lat, lng);
  return [lat, lng];
}
const URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
function Form() {
  const { createCity, isLoading } = useCities();
  const [lat, lng] = useURLPostion();
  //console.log(lat, lng);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [geoCodingError, setGeoCodingError] = useState("");
  const [emoji, setEmoji] = useState();
  useEffect(
    function () {
      if (!lat && !lng) return;
      async function fetchCityDate() {
        try {
          setGeoCodingError("");
          setIsLoadingGeoCoding(true);
          const res = await fetch(`${URL}?latitude=${lat}&longitude=${lng}`);
          const data = await res.json();
          if (!data.countryCode)
            throw new Error(
              "That doesn't seem like a city click somwhere else 😉"
            );
          console.log(data);
          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setGeoCodingError(err.message);
          //alert(err.message);
        } finally {
          setIsLoadingGeoCoding(false);
        }
      }
      fetchCityDate();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji: emoji,
      date,
      notes,
      position: { lat, lng },
    };
    //console.log(newCity);
    await createCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingGeoCoding) {
    return <Spinner />;
  }
  if (!lat && !lng)
    return <Message message="Start by clicking somewhere in the map" />;
  if (geoCodingError) return <Message message={geoCodingError} />;
  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker
          id={date}
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;

//and the url is: http://localhost:5173/app/form?%20lat=43.61327245687446%20lng=0.0048663815801042185
