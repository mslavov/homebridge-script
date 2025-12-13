// Main widget building functions
import { CONFIGURATION } from '../config';
import { fetchData } from '../api/client';
import { cpuUrl, ramUrl, uptimeUrl } from '../api/endpoints';
import type { HomeBridgeStatus, CpuData, RamData, UptimeData } from '../api/types';
import { getAsRoundedString, getMaxString, getMinString, getTemperatureString, getUsedRamString, formatSeconds } from '../utils/formatters';
import { getHbLogo } from '../utils/storage';
import { LineChart } from './charts';
import {
  maxLineWidth,
  normalLineHeight,
  headerFont,
  infoFont,
  chartAxisFont,
  updatedAtFont,
  verticalSpacerInfoPanel,
  handleSettingOfBackgroundColor,
  addStyledText,
  addStatusInfo,
  setTextColor,
  getChartColorToUse,
  addIcon,
} from './styles';

// Time formatter instance
let timeFormatter: DateFormatter;

export function initializeTimeFormatter(): void {
  timeFormatter = new DateFormatter();
  timeFormatter.dateFormat = CONFIGURATION.dateFormat;
}

export function getTimeFormatter(): DateFormatter {
  return timeFormatter;
}

async function initializeLogoAndHeader(titleStack: WidgetStack): Promise<void> {
  titleStack.size = new Size(maxLineWidth, normalLineHeight);
  const logo = await getHbLogo();
  const imgWidget = titleStack.addImage(logo);
  imgWidget.imageSize = new Size(40, 30);

  const headerText = addStyledText(titleStack, CONFIGURATION.widgetTitle, headerFont);
  (headerText as unknown as { size: Size }).size = new Size(60, normalLineHeight);
}

function buildStatusPanelInHeader(titleStack: WidgetStack, homeBridgeStatus: HomeBridgeStatus): void {
  titleStack.addSpacer(CONFIGURATION.spacer_beforeFirstStatusColumn);
  const statusInfo = titleStack.addStack();
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

  titleStack.addSpacer(CONFIGURATION.spacer_afterSecondColumn);
}

function addChartToWidget(column: WidgetStack, chartData: number[]): void {
  const horizontalStack = column.addStack();
  horizontalStack.addSpacer(5);
  const yAxisLabelsStack = horizontalStack.addStack();
  yAxisLabelsStack.layoutVertically();

  addStyledText(yAxisLabelsStack, getMaxString(chartData, 2) + '%', chartAxisFont);
  yAxisLabelsStack.addSpacer(6);
  addStyledText(yAxisLabelsStack, getMinString(chartData, 2) + '%', chartAxisFont);
  yAxisLabelsStack.addSpacer(6);

  horizontalStack.addSpacer(2);

  const chartImage = new LineChart(500, 100, chartData)
    .configure((ctx, path) => {
      ctx.opaque = false;
      ctx.setFillColor(getChartColorToUse());
      ctx.addPath(path);
      ctx.fillPath();
    })
    .getImage();

  const vertChartImageStack = horizontalStack.addStack();
  vertChartImageStack.layoutVertically();

  const chartImageHandle = vertChartImageStack.addImage(chartImage);
  chartImageHandle.imageSize = new Size(100, 25);

  const xAxisStack = vertChartImageStack.addStack();
  xAxisStack.size = new Size(100, 10);

  addStyledText(xAxisStack, 't-10m', chartAxisFont);
  xAxisStack.addSpacer(75);
  addStyledText(xAxisStack, 't', chartAxisFont);
}

async function getUptimesArray(): Promise<[string, string] | undefined> {
  const uptimeData = await fetchData<UptimeData>(uptimeUrl());
  if (uptimeData === undefined) return undefined;

  return [formatSeconds(uptimeData.time.uptime), formatSeconds(uptimeData.processUptime)];
}

export async function buildUsualGui(widget: ListWidget, homeBridgeStatus: HomeBridgeStatus): Promise<void> {
  widget.addSpacer(10);
  const titleStack = widget.addStack();
  await initializeLogoAndHeader(titleStack);
  buildStatusPanelInHeader(titleStack, homeBridgeStatus);
  widget.addSpacer(10);

  const cpuData = await fetchData<CpuData>(cpuUrl());
  const ramData = await fetchData<RamData>(ramUrl());
  const usedRamText = getUsedRamString(ramData);
  const uptimesArray = await getUptimesArray();

  if (cpuData && ramData) {
    const mainColumns = widget.addStack();
    mainColumns.size = new Size(maxLineWidth, 77);
    mainColumns.addSpacer(4);

    const cpuColumn = mainColumns.addStack();
    cpuColumn.layoutVertically();
    addStyledText(cpuColumn, CONFIGURATION.title_cpuLoad + getAsRoundedString(cpuData.currentLoad, 1) + '%', infoFont);
    addChartToWidget(cpuColumn, cpuData.cpuLoadHistory);
    cpuColumn.addSpacer(7);

    const temperatureString = getTemperatureString(cpuData?.cpuTemperature.main);
    if (temperatureString) {
      const cpuTempText = addStyledText(cpuColumn, CONFIGURATION.title_cpuTemp + temperatureString, infoFont);
      (cpuTempText as unknown as { size: Size }).size = new Size(150, 30);
      setTextColor(cpuTempText);
    }

    mainColumns.addSpacer(11);

    const ramColumn = mainColumns.addStack();
    ramColumn.layoutVertically();
    addStyledText(ramColumn, CONFIGURATION.title_ramUsage + usedRamText + '%', infoFont);
    addChartToWidget(ramColumn, ramData.memoryUsageHistory);
    ramColumn.addSpacer(7);

    if (uptimesArray) {
      const uptimesStack = ramColumn.addStack();
      const upStack = uptimesStack.addStack();
      addStyledText(upStack, CONFIGURATION.title_uptimes, infoFont);

      const vertPointsStack = upStack.addStack();
      vertPointsStack.layoutVertically();

      addStyledText(
        vertPointsStack,
        CONFIGURATION.bulletPointIcon + CONFIGURATION.title_systemGuiName + uptimesArray[0],
        infoFont
      );
      addStyledText(
        vertPointsStack,
        CONFIGURATION.bulletPointIcon + CONFIGURATION.title_uiService + uptimesArray[1],
        infoFont
      );
    }

    widget.addSpacer(10);

    // Bottom updated text
    const updatedAt = addStyledText(widget, 't: ' + timeFormatter.string(new Date()), updatedAtFont);
    updatedAt.centerAlignText();
  }
}

function speakUpdateStatus(updateAvailable: boolean): void {
  if (CONFIGURATION.enableSiriFeedback) {
    if (updateAvailable) {
      Speech.speak(CONFIGURATION.siri_spokenAnswer_update_available);
    } else {
      Speech.speak(CONFIGURATION.siri_spokenAnswer_all_UTD);
    }
  }
}

function addUpdatableElement(
  stackToAdd: WidgetStack,
  elementTitle: string,
  versionCurrent: string,
  versionLatest: string
): void {
  const itemStack = stackToAdd.addStack();
  itemStack.addSpacer(17);
  addStyledText(itemStack, elementTitle, infoFont);

  const vertPointsStack = itemStack.addStack();
  vertPointsStack.layoutVertically();

  const versionStack = vertPointsStack.addStack();
  addStyledText(versionStack, versionCurrent, infoFont);
  versionStack.addSpacer(3);
  addIcon(versionStack, CONFIGURATION.siriGui_icon_version, new Color(CONFIGURATION.siriGui_icon_version_color));
  versionStack.addSpacer(3);
  addStyledText(versionStack, versionLatest, infoFont);
}

export async function buildSiriGui(widget: ListWidget, homeBridgeStatus: HomeBridgeStatus): Promise<void> {
  widget.addSpacer(10);
  const titleStack = widget.addStack();
  await initializeLogoAndHeader(titleStack);
  buildStatusPanelInHeader(titleStack, homeBridgeStatus);
  widget.addSpacer(10);

  const mainColumns = widget.addStack();
  mainColumns.size = new Size(maxLineWidth, 100);

  const verticalStack = mainColumns.addStack();
  verticalStack.layoutVertically();

  const nodeJsUpdateAvailable = CONFIGURATION.showNodeJsStatus && homeBridgeStatus.nodeJsVersionInfos?.updateAvailable;
  if (
    homeBridgeStatus.hbVersionInfos?.updateAvailable ||
    homeBridgeStatus.pluginVersionInfos?.updateAvailable ||
    nodeJsUpdateAvailable
  ) {
    speakUpdateStatus(true);
    addStyledText(verticalStack, CONFIGURATION.siriGui_title_update_available, infoFont);

    if (homeBridgeStatus.hbVersionInfos?.updateAvailable) {
      verticalStack.addSpacer(5);
      addUpdatableElement(
        verticalStack,
        CONFIGURATION.bulletPointIcon + (homeBridgeStatus.hbVersionInfos.name || 'Homebridge') + ': ',
        homeBridgeStatus.hbVersionInfos.installedVersion || '',
        homeBridgeStatus.hbVersionInfos.latestVersion || ''
      );
    }

    if (homeBridgeStatus.pluginVersionInfos?.updateAvailable) {
      for (const plugin of homeBridgeStatus.pluginVersionInfos.plugins) {
        if (CONFIGURATION.pluginsOrSwUpdatesToIgnore.includes(plugin.name)) {
          continue;
        }
        if (plugin.updateAvailable) {
          verticalStack.addSpacer(5);
          addUpdatableElement(
            verticalStack,
            CONFIGURATION.bulletPointIcon + plugin.name + ': ',
            plugin.installedVersion,
            plugin.latestVersion
          );
        }
      }
    }

    if (nodeJsUpdateAvailable && homeBridgeStatus.nodeJsVersionInfos) {
      verticalStack.addSpacer(5);
      addUpdatableElement(
        verticalStack,
        CONFIGURATION.bulletPointIcon + homeBridgeStatus.nodeJsVersionInfos.name + ': ',
        homeBridgeStatus.nodeJsVersionInfos.currentVersion,
        homeBridgeStatus.nodeJsVersionInfos.latestVersion
      );
    }
  } else {
    speakUpdateStatus(false);
    verticalStack.addSpacer(30);
    addStyledText(verticalStack, CONFIGURATION.siriGui_title_all_UTD, infoFont);
  }
}

export function addNotAvailableInfos(widget: ListWidget, titleStack: WidgetStack): ListWidget {
  const statusInfo = titleStack.addText('                                                 ');
  setTextColor(statusInfo);
  (statusInfo as unknown as { size: Size }).size = new Size(150, normalLineHeight);

  const errorText = widget.addText(CONFIGURATION.error_noConnectionText);
  (errorText as unknown as { size: Size }).size = new Size(410, 130);
  errorText.font = infoFont;
  setTextColor(errorText);

  widget.addSpacer(15);
  const updatedAt = widget.addText('t: ' + timeFormatter.string(new Date()));
  updatedAt.font = updatedAtFont;
  setTextColor(updatedAt);
  updatedAt.centerAlignText();

  return widget;
}

export async function showNotAvailableWidget(): Promise<void> {
  const widget = new ListWidget();
  handleSettingOfBackgroundColor(widget);
  const mainStack = widget.addStack();
  await initializeLogoAndHeader(mainStack);
  addNotAvailableInfos(widget, mainStack);
  await finalizeAndShowWidget(widget);
}

export async function finalizeAndShowWidget(widget: ListWidget): Promise<void> {
  if (!config.runsInWidget) {
    await widget.presentMedium();
  }
  Script.setWidget(widget);
  Script.complete();
}

export async function createAndShowWidget(homeBridgeStatus: HomeBridgeStatus): Promise<void> {
  const widget = new ListWidget();
  handleSettingOfBackgroundColor(widget);

  if (!config.runsWithSiri) {
    await buildUsualGui(widget, homeBridgeStatus);
  } else {
    await buildSiriGui(widget, homeBridgeStatus);
  }

  await finalizeAndShowWidget(widget);
}
