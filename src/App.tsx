import React, { useState } from 'react';
import { Search, MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, X } from 'lucide-react';

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  icon: string;
}

interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchCitySuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (response.ok) {
        const citiesData = await response.json();
        setSuggestions(citiesData);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Failed to fetch city suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    fetchCitySuggestions(value);
  };

  const selectSuggestion = (suggestion: CitySuggestion) => {
    const cityName = suggestion.state 
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    setCity(cityName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearSearch = () => {
    setCity('');
    setShowSuggestions(false);
    setSuggestions([]);
    setWeather(null);
    setError('');
  };

  const searchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setShowSuggestions(false);
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch weather data');
      }

      const weatherData = await response.json();
      setWeather(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherBackground = () => {
    if (!weather) return 'from-blue-400 via-blue-500 to-blue-600';
    
    const desc = weather.description.toLowerCase();
    if (desc.includes('clear')) return 'from-yellow-400 via-orange-500 to-red-500';
    if (desc.includes('cloud')) return 'from-gray-400 via-gray-500 to-gray-600';
    if (desc.includes('rain') || desc.includes('drizzle')) return 'from-blue-500 via-blue-600 to-indigo-700';
    if (desc.includes('thunder')) return 'from-purple-500 via-purple-600 to-indigo-800';
    if (desc.includes('snow')) return 'from-blue-100 via-blue-200 to-blue-300';
    return 'from-blue-400 via-blue-500 to-blue-600';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getWeatherBackground()} transition-all duration-1000 p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sun className="h-8 w-8 text-white" />
            <h1 className="text-4xl font-bold text-white">WeatherScope</h1>
          </div>
          <p className="text-white/80 text-lg">Discover weather conditions around the world</p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={searchWeather} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={handleCityInputChange}
                onFocus={() => city.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Enter city name..."
                className="w-full pl-12 pr-16 py-4 rounded-2xl border-0 shadow-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20 text-lg"
                disabled={loading}
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {city && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !city.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-2 rounded-xl text-white font-medium transition-all duration-200 backdrop-blur-sm"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                  {loadingSuggestions ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2"></div>
                      Loading suggestions...
                    </div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-800">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {suggestion.state ? `${suggestion.state}, ${suggestion.country}` : suggestion.country}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white px-6 py-4 rounded-xl">
              <p className="font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Weather Card */}
        {weather && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Location */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-white/80" />
                <h2 className="text-2xl font-bold text-white">
                  {weather.city}, {weather.country}
                </h2>
              </div>

              {/* Main Weather Info */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                    alt={weather.description}
                    className="w-24 h-24"
                  />
                  <div>
                    <div className="text-6xl font-bold text-white mb-2">
                      {Math.round(weather.temperature)}°C
                    </div>
                    <div className="text-xl text-white/80 capitalize">
                      {weather.description}
                    </div>
                  </div>
                </div>
                <div className="text-white/80 text-lg">
                  Feels like {Math.round(weather.feelsLike)}°C
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Droplets className="h-8 w-8 text-white/80 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{weather.humidity}%</div>
                  <div className="text-white/70 text-sm">Humidity</div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Wind className="h-8 w-8 text-white/80 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{Math.round(weather.windSpeed)} km/h</div>
                  <div className="text-white/70 text-sm">Wind Speed</div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Eye className="h-8 w-8 text-white/80 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{Math.round(weather.visibility / 1000)} km</div>
                  <div className="text-white/70 text-sm">Visibility</div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <Gauge className="h-8 w-8 text-white/80 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{weather.pressure} hPa</div>
                  <div className="text-white/70 text-sm">Pressure</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!weather && !loading && !error && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
              <Thermometer className="h-16 w-16 text-white/80 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Search for a city
              </h3>
              <p className="text-white/70">
                Enter a city name above to get current weather conditions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;