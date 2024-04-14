const NEW_YORK_GEO_SEARCH = {
  northEastPoint: {
    longitude: -71.3416988598131,
    latitude: 45.10740785825482,
  },
  southWestPoint: {
    longitude: -80.22661564018898,
    latitude: 40.3557236305478,
  },
};

const ATLANTA_GEO_SEARCH = {
  northEastPoint: {
    longitude: -84.289385,
    latitude: 33.868,
  },
  southWestPoint: {
    longitude: -84.418,
    latitude: 33.75,
  },
};

const BOSTON_GEO_SEARCH = {
  northEastPoint: {
    longitude: -71.021,
    latitude: 42.396,
  },
  southWestPoint: {
    longitude: -71.125,
    latitude: 42.33,
  },
};

const CHICAGO_GEO_SEARCH = {
  northEastPoint: {
    longitude: -87.524,
    latitude: 41.91,
  },
  southWestPoint: {
    longitude: -87.65,
    latitude: 41.78,
  },
};

const DALLAS_GEO_SEARCH = {
  northEastPoint: {
    longitude: -96.65,
    latitude: 32.95,
  },
  southWestPoint: {
    longitude: -96.85,
    latitude: 32.75,
  },
};

const LOS_ANGELES_GEO_SEARCH = {
  northEastPoint: {
    longitude: -118.15,
    latitude: 34.15,
  },
  southWestPoint: {
    longitude: -118.4,
    latitude: 33.95,
  },
};

export function getGeoBoundsFromCityName(city: string) {
  switch (city.toLowerCase().replace(/ /g, "").replace(/-/g, "")) {
    case "newyork":
      return NEW_YORK_GEO_SEARCH;
    case "atlanta":
      return ATLANTA_GEO_SEARCH;
    case "boston":
      return BOSTON_GEO_SEARCH;
    case "chicago":
      return CHICAGO_GEO_SEARCH;
    case "dallas":
      return DALLAS_GEO_SEARCH;
    case "losangeles":
      return LOS_ANGELES_GEO_SEARCH;
    default:
      return NEW_YORK_GEO_SEARCH;
  }
}
