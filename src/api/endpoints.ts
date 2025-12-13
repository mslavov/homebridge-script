// API Endpoint URL builders
import { CONFIGURATION } from '../config';

export const noAuthUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/auth/noauth';
export const authUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/auth/login';
export const cpuUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/status/cpu';
export const overallStatusUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/status/homebridge';
export const ramUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/status/ram';
export const uptimeUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/status/uptime';
export const pluginsUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/plugins';
export const hbVersionUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/status/homebridge-version';
export const nodeJsUrl = (): string => CONFIGURATION.hbServiceMachineBaseUrl + '/api/status/nodejs';
