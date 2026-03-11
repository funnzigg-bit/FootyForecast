// FootyForecast — League Configuration

export const LEAGUES = [
  { id: 39, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 2, name: "Champions League", country: "Europe", flag: "🏆" },
  { id: 3, name: "Europa League", country: "Europe", flag: "🏆" },
  { id: 848, name: "Conference League", country: "Europe", flag: "🏆" },
  { id: 140, name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { id: 78, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { id: 135, name: "Serie A", country: "Italy", flag: "🇮🇹" },
];

export const LEAGUE_IDS = LEAGUES.map(l => l.id);
export const LEAGUE_NAMES = LEAGUES.map(l => l.name);
