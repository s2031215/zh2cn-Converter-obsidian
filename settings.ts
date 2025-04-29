import ChineseConverterPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

//initialise Setting Page for 異體字轉換 and 自訂轉換詞彙 function
export class SettingTab extends PluginSettingTab {
    plugin: ChineseConverterPlugin;

    constructor(app: App, plugin: ChineseConverterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('異體字轉換')
            .setDesc(
                ' 繁體中文（香港/臺灣）轉換詞彙（例如：自行車 -> 腳踏車）'
            )
            .addDropdown(dropdown => dropdown
                .addOption('twp', '臺灣(tw)')
                .addOption('hk', '香港(hk)')
                .setValue(this.plugin.settings.country)
                .onChange((value) => {
                    this.plugin.settings.country = value;
                    this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("自訂轉換詞彙")
            .setDesc("以「空白」及「|」當作分隔符號 e.g 简 簡|揹 背|擡 台")
            .addTextArea((textArea) => {
                textArea.inputEl.rows = 5;
                textArea.inputEl.cols = 50;
                textArea
                    .setValue(this.plugin.settings.customWord)
                    .onChange((value) => {
                        this.plugin.settings.customWord = value;
                        this.plugin.saveSettings();
                    })
            })
    }
}