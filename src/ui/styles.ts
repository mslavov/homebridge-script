// Style utilities for colors, gradients, and fonts
import { CONFIGURATION } from '../config';

// Pre-defined gradients
export const purpleBgGradient_light = createLinearGradient('#421367', '#481367');
export const purpleBgGradient_dark = createLinearGradient('#250b3b', '#320d47');
export const blackBgGradient_light = createLinearGradient('#707070', '#3d3d3d');
export const blackBgGradient_dark = createLinearGradient('#111111', '#222222');

// Layout constants
export const maxLineWidth = 300;
export const normalLineHeight = 35;
export let iconSize = 13;
export let verticalSpacerInfoPanel = 5;

// Fonts (initialized later)
export let headerFont: Font;
export let infoFont: Font;
export let chartAxisFont: Font;
export let updatedAtFont: Font;
export let infoPanelFont: Font;

export function initializeFonts(): void {
  headerFont = Font.boldMonospacedSystemFont(CONFIGURATION.headerFontSize);
  infoFont = Font.systemFont(CONFIGURATION.informationFontSize);
  chartAxisFont = Font.systemFont(CONFIGURATION.chartAxisFontSize);
  updatedAtFont = Font.systemFont(CONFIGURATION.dateFontSize);
  infoPanelFont = Font.semiboldMonospacedSystemFont(10);
}

export function overwriteSizesForLockScreen(): void {
  infoFont = Font.systemFont(7);
  infoPanelFont = Font.semiboldMonospacedSystemFont(7);
  iconSize = 8;
  CONFIGURATION.spacer_betweenStatusColumns = 2;
  CONFIGURATION.spacer_beforeFirstStatusColumn = 2;
  verticalSpacerInfoPanel = 1;
  updatedAtFont = Font.systemFont(6);
}

export function createLinearGradient(color1: string, color2: string): LinearGradient {
  const gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color(color1), new Color(color2)];
  return gradient;
}

export function getChartColorToUse(): Color {
  if (CONFIGURATION.adaptToLightOrDarkMode && Device.isUsingDarkAppearance()) {
    return new Color(CONFIGURATION.chartColor_dark);
  }
  return new Color(CONFIGURATION.chartColor_light);
}

export function setTextColor(textWidget: WidgetText): void {
  if (CONFIGURATION.adaptToLightOrDarkMode && Device.isUsingDarkAppearance()) {
    textWidget.textColor = new Color(CONFIGURATION.fontColor_dark);
  } else {
    textWidget.textColor = new Color(CONFIGURATION.fontColor_light);
  }
}

function setGradient(widget: ListWidget, lightOption: LinearGradient, darkOption: LinearGradient): void {
  if (Device.isUsingDarkAppearance()) {
    widget.backgroundGradient = darkOption;
  } else {
    widget.backgroundGradient = lightOption;
  }
}

export function handleSettingOfBackgroundColor(widget: ListWidget): void {
  if (!CONFIGURATION.adaptToLightOrDarkMode) {
    switch (CONFIGURATION.bgColorMode) {
      case 'CUSTOM':
        widget.backgroundGradient = createLinearGradient(
          CONFIGURATION.customBackgroundColor1_light,
          CONFIGURATION.customBackgroundColor2_light
        );
        break;
      case 'BLACK_LIGHT':
        widget.backgroundGradient = blackBgGradient_light;
        break;
      case 'BLACK_DARK':
        widget.backgroundGradient = blackBgGradient_dark;
        break;
      case 'PURPLE_DARK':
        widget.backgroundGradient = purpleBgGradient_dark;
        break;
      case 'PURPLE_LIGHT':
      default:
        widget.backgroundGradient = purpleBgGradient_light;
    }
  } else {
    switch (CONFIGURATION.bgColorMode) {
      case 'CUSTOM':
        setGradient(
          widget,
          createLinearGradient(CONFIGURATION.customBackgroundColor1_light, CONFIGURATION.customBackgroundColor2_light),
          createLinearGradient(CONFIGURATION.customBackgroundColor1_dark, CONFIGURATION.customBackgroundColor2_dark)
        );
        break;
      case 'BLACK_LIGHT':
      case 'BLACK_DARK':
        setGradient(widget, blackBgGradient_light, blackBgGradient_dark);
        break;
      case 'PURPLE_DARK':
      case 'PURPLE_LIGHT':
      default:
        setGradient(widget, purpleBgGradient_light, purpleBgGradient_dark);
    }
  }
}

export function addStyledText(stackToAddTo: WidgetStack | ListWidget, text: string, font: Font): WidgetText {
  const textHandle = stackToAddTo.addText(text);
  textHandle.font = font;
  setTextColor(textHandle);
  return textHandle;
}

export function addIcon(widget: WidgetStack, name: string, color: Color): void {
  const sf = SFSymbol.named(name);
  const iconImage = sf.image;
  const imageWidget = widget.addImage(iconImage);
  imageWidget.resizable = true;
  imageWidget.imageSize = new Size(iconSize, iconSize);
  imageWidget.tintColor = color;
}

export function addStatusIcon(widget: WidgetStack, statusBool: boolean | undefined): void {
  let name: string;
  let color: Color;

  if (statusBool === undefined) {
    name = CONFIGURATION.icon_statusUnknown;
    color = new Color(CONFIGURATION.icon_colorUnknown);
  } else if (statusBool) {
    name = CONFIGURATION.icon_statusGood;
    color = new Color(CONFIGURATION.icon_colorGood);
  } else {
    name = CONFIGURATION.icon_statusBad;
    color = new Color(CONFIGURATION.icon_colorBad);
  }

  addIcon(widget, name, color);
}

export function addStatusInfo(lineWidget: WidgetStack, statusBool: boolean | undefined, shownText: string): void {
  const itemStack = lineWidget.addStack();
  addStatusIcon(itemStack, statusBool);
  itemStack.addSpacer(2);
  const text = itemStack.addText(shownText);
  text.font = infoPanelFont;
  setTextColor(text);
}
