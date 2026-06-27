export function extractErrorMessage(error) {
  const data = error?.response?.data;

  if (data?.details) {
    const firstField = Object.values(data.details)[0];
    if (Array.isArray(firstField) && firstField.length > 0) {
      return firstField[0];
    }
  }

  return data?.message || error?.message || 'Something went wrong. Please try again.';
}
