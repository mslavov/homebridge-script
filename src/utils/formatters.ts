// Formatting utilities
import { CONFIGURATION } from '../config';
import type { RamData } from '../api/types';

export function getAsRoundedString(value: number, decimals: number): string {
  const factor = Math.pow(10, decimals);
  return (Math.round((value + Number.EPSILON) * factor) / factor)
    .toString()
    .replace('.', CONFIGURATION.decimalChar);
}

export function getMaxString(arrayOfNumbers: number[], decimals: number): string {
  const factor = Math.pow(10, decimals);
  return (Math.round((Math.max(...arrayOfNumbers) + Number.EPSILON) * factor) / factor)
    .toString()
    .replace('.', CONFIGURATION.decimalChar);
}

export function getMinString(arrayOfNumbers: number[], decimals: number): string {
  const factor = Math.pow(10, decimals);
  return (Math.round((Math.min(...arrayOfNumbers) + Number.EPSILON) * factor) / factor)
    .toString()
    .replace('.', CONFIGURATION.decimalChar);
}

export function formatSeconds(value: number): string {
  if (value > 60 * 60 * 24 * 10) {
    return getAsRoundedString(value / 60 / 60 / 24, 0) + 'd'; // more than 10 days
  } else if (value > 60 * 60 * 24) {
    return getAsRoundedString(value / 60 / 60 / 24, 1) + 'd';
  } else if (value > 60 * 60) {
    return getAsRoundedString(value / 60 / 60, 1) + 'h';
  } else if (value > 60) {
    return getAsRoundedString(value / 60, 1) + 'm';
  } else {
    return getAsRoundedString(value, 1) + 's';
  }
}

export function convertToFahrenheit(temperatureInCelsius: number): number {
  return (temperatureInCelsius * 9) / 5 + 32;
}

export function getTemperatureString(temperatureInCelsius: number | undefined): string | undefined {
  if (temperatureInCelsius === undefined || temperatureInCelsius < 0) return undefined;

  if (CONFIGURATION.temperatureUnitConfig === 'FAHRENHEIT') {
    return getAsRoundedString(convertToFahrenheit(temperatureInCelsius), 1) + '°F';
  } else {
    return getAsRoundedString(temperatureInCelsius, 1) + '°C';
  }
}

export function getUsedRamString(ramData: RamData | undefined): string {
  if (ramData === undefined) return 'unknown';
  return getAsRoundedString(100 - (100 * ramData.mem.available) / ramData.mem.total, 2);
}
