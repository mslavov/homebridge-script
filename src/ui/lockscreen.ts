// Lock screen widget variant
import { CONFIGURATION } from '../config';
import { fetchData } from '../api/client';
import { cpuUrl, ramUrl } from '../api/endpoints';
import type { HomeBridgeStatus, CpuData, RamData } from '../api/types';
import { getAsRoundedString, getTemperatureString, getUsedRamString } from '../utils/formatters';
import { getHbLogo } from '../utils/storage';
import {
  headerFont,
  infoFont,
  updatedAtFont,
  handleSettingOfBackgroundColor,
  addStyledText,
  addStatusInfo,
  setTextColor,
  overwriteSizesForLockScreen,
  verticalSpacerInfoPanel,
} from './styles';
import { getTimeFormatter } from './widget';

let lockScreenTimeFormatter: DateFormatter;

function initializeLockScreenTimeFormatter(): void {
  lockScreenTimeFormatter = new DateFormatter();
  lockScreenTimeFormatter.dateFormat = 'HH:mm:ss';
}

async function buildLockScreenWidgetHeader(widget: ListWidget): Promise<void> {
  const mainStack = widget.addStack();
  const logo = await getHbLogo();
  const imgWidget = mainStack.addImage(logo);
  imgWidget.imageSize = new Size(14, 14);
  addStyledText(mainStack, CONFIGURATION.widgetTitle, headerFont);
}

function buildStatusPanelForLockScreen(verticalStack: WidgetStack, homeBridgeStatus: HomeBridgeStatus): void {
  verticalStack.addSpacer(CONFIGURATION.spacer_beforeFirstStatusColumn);
  const statusInfo = verticalStack.addStack();
  const firstColumn = statusInfo.addStack();
  firstColumn.layoutVertically();
  addStatusInfo(firstColumn, homeBridgeStatus.overallStatus, CONFIGURATION.status_hbRunning);
  firstColumn.addSpacer(verticalSpacerInfoPanel);
  addStatusInfo(firstColumn, homeBridgeStatus.pluginsUpToDate, CONFIGURATION.status_pluginsUtd);

  statusInfo.addSpacer(CONFIGURATION.spacer_betweenStatusColumns);

  const secondColumn = statusInfo.addStack();
  secondColumn.layoutVertically();
  addStatusInfo(secondColumn, homeBridgeStatus.hbUpToDate, CONFIGURATION.status_hbUtd);
  if (CONFIGURATION.showNodeJsStatus) {
    secondColumn.addSpacer(verticalSpacerInfoPanel);
    addStatusInfo(secondColumn, homeBridgeStatus.nodeJsUpToDate, CONFIGURATION.status_nodejsUtd);
  }
}

async function buildCpuRamInfoForLockScreen(verticalStack: WidgetStack): Promise<void> {
  const cpuData = await fetchData<CpuData>(cpuUrl());
  const ramData = await fetchData<RamData>(ramUrl());

  verticalStack.addSpacer(CONFIGURATION.spacer_beforeFirstStatusColumn);
  const statusInfo = verticalStack.addStack();
  const cpuInfos = statusInfo.addStack();

  const cpuFirstColumn = cpuInfos.addStack();
  cpuFirstColumn.layoutVertically();
  addStyledText(cpuFirstColumn, 'CPU:', infoFont);
  cpuInfos.addSpacer(2);

  const cpuSecondColumn = cpuInfos.addStack();
  cpuSecondColumn.layoutVertically();
  addStyledText(cpuSecondColumn, getAsRoundedString(cpuData?.currentLoad || 0, 1) + '%', infoFont);
  cpuSecondColumn.addSpacer(2);

  const temperatureString = getTemperatureString(cpuData?.cpuTemperature.main);
  if (temperatureString) {
    addStyledText(cpuSecondColumn, temperatureString, infoFont);
  }

  cpuInfos.addSpacer(17);

  const usedRamText = getUsedRamString(ramData);

  const ramFirstColumn = cpuInfos.addStack();
  ramFirstColumn.layoutVertically();
  addStyledText(ramFirstColumn, 'RAM:', infoFont);
  cpuInfos.addSpacer(2);
  ramFirstColumn.addSpacer(2);

  const ramSecondColumn = cpuInfos.addStack();
  ramSecondColumn.layoutVertically();
  addStyledText(ramSecondColumn, usedRamText + '%', infoFont);
  ramSecondColumn.addSpacer(5);

  addStyledText(ramSecondColumn, '  t: ' + lockScreenTimeFormatter.string(new Date()), updatedAtFont);
}

async function buildLockScreenWidgetBody(widget: ListWidget, homeBridgeStatus: HomeBridgeStatus): Promise<void> {
  const verticalStack = widget.addStack();
  verticalStack.layoutVertically();
  buildStatusPanelForLockScreen(verticalStack, homeBridgeStatus);
  await buildCpuRamInfoForLockScreen(verticalStack);
}

export async function createAndShowLockScreenWidget(homeBridgeStatus: HomeBridgeStatus): Promise<void> {
  overwriteSizesForLockScreen();
  initializeLockScreenTimeFormatter();

  const widget = new ListWidget();
  handleSettingOfBackgroundColor(widget);
  await buildLockScreenWidgetHeader(widget);
  await buildLockScreenWidgetBody(widget, homeBridgeStatus);

  await widget.presentSmall();
  Script.setWidget(widget);
  Script.complete();
}

export async function showNotAvailableLockScreenWidget(): Promise<void> {
  overwriteSizesForLockScreen();
  initializeLockScreenTimeFormatter();

  const widget = new ListWidget();
  handleSettingOfBackgroundColor(widget);
  await buildLockScreenWidgetHeader(widget);
  widget.addSpacer(2);
  addStyledText(widget, CONFIGURATION.error_noConnectionLockScreenText, updatedAtFont);

  await widget.presentSmall();
  Script.setWidget(widget);
  Script.complete();
}
