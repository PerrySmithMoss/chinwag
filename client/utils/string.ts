export function truncateString(input: string, maxLength: number) {
  if (input.length > maxLength) {
    return input.substring(0, maxLength) + "...";
  } else {
    return input;
  }
}
