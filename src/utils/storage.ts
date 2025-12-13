// File storage utilities for iCloud/local persistence
import { CONFIGURATION, CONFIGURATION_JSON_VERSION, setConfiguration } from '../config';
import type { ConfigurationType } from '../config';

let fileManager: FileManager;

export function initializeFileManager(): FileManager {
  fileManager = CONFIGURATION.fileManagerMode === 'LOCAL' ? FileManager.local() : FileManager.iCloud();
  return fileManager;
}

export function getFileManager(): FileManager {
  return fileManager;
}

export function getFilePath(fileName: string): string {
  const dirPath = fileManager.joinPath(fileManager.documentsDirectory(), 'homebridgeStatus');
  if (!fileManager.fileExists(dirPath)) {
    fileManager.createDirectory(dirPath);
  }
  return fileManager.joinPath(dirPath, fileName);
}

export function persistObject<T>(object: T, path: string): void {
  const raw = JSON.stringify(object, null, 2);
  fileManager.writeString(path, raw);
}

export async function getPersistedObject<T extends { jsonVersion?: number }>(
  path: string,
  versionToCheckAgainst: number,
  initialObjectToPersist: T,
  createIfNotExisting: boolean
): Promise<T> {
  if (fileManager.fileExists(path)) {
    const fileDownloaded = await fileManager.isFileDownloaded(path);
    if (!fileDownloaded) {
      await fileManager.downloadFileFromiCloud(path);
    }

    let raw: string;
    let persistedObject: T | undefined;
    try {
      raw = fileManager.readString(path);
      persistedObject = JSON.parse(raw);
    } catch {
      // file corrupted -> remove it
      fileManager.remove(path);
    }

    if (
      persistedObject &&
      (persistedObject.jsonVersion === undefined || persistedObject.jsonVersion < versionToCheckAgainst)
    ) {
      log(
        'Unfortunately, the configuration structure changed and your old config is not compatible anymore. It is now renamed, marked as deprecated and a new one is created with the initial configuration.'
      );
      persistObject(persistedObject, getFilePath('DEPRECATED_' + CONFIGURATION.configurationFileName));
      fileManager.remove(path);
      const migratedConfig = { ...initialObjectToPersist, ...persistedObject };
      (migratedConfig as { jsonVersion: number }).jsonVersion = CONFIGURATION_JSON_VERSION;
      persistObject(migratedConfig, path);
      return migratedConfig;
    } else if (persistedObject) {
      return persistedObject;
    }
  }

  if (createIfNotExisting) {
    persistObject(initialObjectToPersist, path);
  }
  return initialObjectToPersist;
}

export async function loadImage(imgUrl: string): Promise<Image> {
  const req = new Request(imgUrl);
  req.timeoutInterval = CONFIGURATION.requestTimeoutInterval;
  return await req.loadImage();
}

export async function getHbLogo(): Promise<Image> {
  const path = getFilePath(CONFIGURATION.hbLogoFileName);
  if (fileManager.fileExists(path)) {
    const fileDownloaded = await fileManager.isFileDownloaded(path);
    if (!fileDownloaded) {
      await fileManager.downloadFileFromiCloud(path);
    }
    return fileManager.readImage(path);
  } else {
    // logo did not exist -> download it and save it for next time
    const logo = await loadImage(CONFIGURATION.logoUrl);
    fileManager.writeImage(path, logo);
    return logo;
  }
}

export async function handleConfigPersisting(
  usePersistedConfiguration: boolean,
  overwritePersistedConfig: boolean
): Promise<void> {
  if (usePersistedConfiguration || overwritePersistedConfig) {
    log(
      'The valid configuration ' +
        CONFIGURATION.configurationFileName +
        ' has been saved. Changes can only be applied if overwritePersistedConfig is set to true. Should be set to false after applying changes again!'
    );
    persistObject(CONFIGURATION, getFilePath(CONFIGURATION.configurationFileName));
  }
}

export async function loadPersistedConfiguration(configFileName: string): Promise<ConfigurationType> {
  const config = await getPersistedObject<ConfigurationType>(
    getFilePath(configFileName),
    CONFIGURATION_JSON_VERSION,
    CONFIGURATION,
    false
  );
  setConfiguration(config);
  log('Configuration ' + configFileName + ' is used! Trying to authenticate...');
  return config;
}
