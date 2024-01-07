import styles from "./CountryList.module.css";
//import CityItem from "./CityItem";
import Spinner from "./Spinner";
import Message from "./Message";
import CountryItem from "./CountryItem";
import { useCities } from "../context/CitiesContexts";
function CityList() {
  const { cities, isLoading } = useCities();
  if (isLoading) {
    return <Spinner />;
  }
  if (!cities.length) {
    return <Message message={"Add you first city by clicking on the map"} />;
  }
  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country)) {
      return [...arr, { country: city.country, emoji: city.emoji }];
    } else {
      return arr;
    }
  }, []);

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem country={country} key={country.country} />
      ))}
    </ul>
  );
}

export default CityList;
