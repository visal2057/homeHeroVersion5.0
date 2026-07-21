// Always links to the exact GPS coordinate, not an address-text search, so
// the pin lands precisely where the location was set (profile Primary/
// Secondary, or a dropped pin) rather than wherever Maps guesses the address
// text means.
export function buildGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
