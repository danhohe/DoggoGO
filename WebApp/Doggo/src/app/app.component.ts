import { Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DogCategoryInfo {
  criteria: string;
  laws: string;
  guidelines: string;
 
}

interface DogCategory {
  name: string;
  info: DogCategoryInfo;
}

// Wetterdaten-Interface
interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  main: string; // Wettertyp für Emoji
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  center: google.maps.LatLngLiteral = { lat: 48.3069, lng: 14.2868 }; // HTL-Leonding
  zoom: number = 15;

  // Marker für eigenen Standort
  userLocationMarker: google.maps.MarkerOptions | null = null;

  dogCategories: DogCategory[] = [
    {
      name: 'Spezielle Hunderassen',
      info: {
        criteria: `Folgende Hunderassen und deren Kreuzungen gelten als speziell:
- Bullterrier
- American Staffordshire Terrier
- Staffordshire Bullterrier
- Dogo Argentino
- American Pit Bull Terrier
- Tosa Inu`,
        laws: `Vorschriften:
- Pflicht zur Alltagstauglichkeitsprüfung (ATP) ab dem 12. Lebensmonat
- Leinen- und Maulkorbpflicht im öffentlichen Raum
- Halter:innen müssen mindestens 16 Jahre alt, sachkundig und verlässlich sein
- Es darf maximal gleichzeitig mit einem weiteren großen, auffälligen oder speziellen Hund spazieren gegangen werden
(Kleine, unauffällige Hunde sind hiervon ausgenommen)`,
        guidelines: `Eigentümer müssen sicherstellen, dass der Hund immer an der Leine geführt wird und einen Maulkorb trägt, wenn sie öffentliche Orte betreten.`,
      }
    },
    {
      name: 'Große Hunde',
      info: {
        criteria: `Definition: Widerristhöhe ≥ 40 cm oder Gewicht ≥ 20 kg`,
        laws: `Vorschriften:
- Sachkunde-Kurs erforderlich
- Alltagstauglichkeitsprüfung (ATP) erforderlich
- Leinen- oder Maulkorbpflicht im Ortsgebiet
- Maximal zwei große Hunde gleichzeitig führen`,
        guidelines: `Besitzer großer Hunde sollten sicherstellen, dass der Hund genug Auslauf bekommt und sich in städtischen Gebieten sicher verhält.`,
      }
    },
    {
      name: 'Auffällige Hunde',
      info: {
        criteria: `Definition: Hunde mit aggressivem Verhalten oder Vorfällen`,
        laws: `Vorschriften:
- Leinen- und Maulkorbpflicht im öffentlichen Raum
- Verhaltensmedizinische Evaluierung + Zusatzausbildung
- Halter:innen müssen mindestens 16 Jahre alt, sachkundig und verlässlich sein
- Nicht gemeinsam mit einem weiteren auffälligen Hund und höchstens mit einem großen Hund führen
(Kleine, unauffällige Hunde sind hiervon ausgenommen)`,
        guidelines: `Wenn ein Hund als auffällig gilt, kann der Besitzer verpflichtet werden, den Hund durch einen Fachmann zu trainieren oder ihn in bestimmten öffentlichen Bereichen zu beschränken.`,
      }
    },
    {
      name: 'Kleine Hunde',
      info: {
        criteria: `Definition: Widerristhöhe < 40 cm und Gewicht < 20 kg`,
        laws: `Vorschriften:
- Sachkunde-Kurs erforderlich
- Leinen- oder Maulkorbpflicht im Ortsgebiet
- Keine Einschränkungen bei Anzahl oder Führung`,
        guidelines: `Kleine Hunde benötigen regelmäßige Bewegung und eine ausgewogene Ernährung, um gesund zu bleiben.`,
      }
    }
  ];

  // Standardmäßig keine Kategorie ausgewählt
  selectedDogCategory: DogCategory | null = null;
  mapHeight = '500px';
  weather: WeatherData | null = null;
  hourlyWeather: Array<{ time: string, temp: number, icon: string, description: string }> = [];
  isNight: boolean = false;
  isRain: boolean = false;
  iconError = false;

  ngOnInit() {
    // Sortiere die Kategorien alphabetisch nach Name
    this.dogCategories.sort((a, b) => a.name.localeCompare(b.name));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.userLocationMarker = {
            position: this.center,
            title: 'Mein Standort',
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(40, 40)
            }
          };
          this.fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          this.userLocationMarker = null;
          this.center = { lat: 48.3069, lng: 14.2868 };
          alert('Dein Standort konnte nicht ermittelt werden. Die Karte zeigt den Standardstandort (Linz).');
          // Wetter für Linz abrufen
          this.fetchWeather(48.3069, 14.2868);
        }
      );
    }
    this.setDayNight();
  }

  setDayNight() {
    const hour = new Date().getHours();
    this.isNight = (hour < 7 || hour >= 20);
  }

  // Wetterdaten von OpenWeatherMap holen
  fetchWeather(lat: number, lon: number) {
    const apiKey = '4ab7376893694f75311f2483b3909aa6';
    this.iconError = false;
    // Aktuelles Wetter
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${apiKey}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.weather = {
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          main: data.weather[0].main // Wettertyp für Emoji
        };
      })
      .catch(() => {
        this.weather = null;
      });
    // Stundenprognose (nächste 8 Stunden)
    const urlHourly = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${apiKey}`;
    fetch(urlHourly)
      .then(res => res.json())
      .then(data => {
        this.hourlyWeather = data.list.slice(0, 8).map((entry: any) => {
          const date = new Date(entry.dt * 1000);
          const hour = date.getHours().toString().padStart(2, '0');
          const min = date.getMinutes().toString().padStart(2, '0');
          return {
            time: `${hour}:${min}`,
            temp: Math.round(entry.main.temp),
            icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`,
            description: entry.weather[0].description
          };
        });
      })
      .catch(() => {
        this.hourlyWeather = [];
      });
  }

  getWeatherEmoji(main: string): string {
    switch ((main || '').toLowerCase()) {
      case 'rain':
      case 'drizzle':
      case 'thunderstorm':
        return '🌧️';
      case 'snow':
        return '❄️';
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'mist':
      case 'fog':
      case 'haze':
        return '🌫️';
      case 'smoke':
        return '💨';
      case 'tornado':
        return '🌪️';
      case 'squall':
        return '💨';
      case 'dust':
      case 'sand':
        return '🌬️';
      default:
        return '🌡️';
    }
  }
}
