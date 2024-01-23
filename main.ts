import { App, addIcon, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as OpenCC from './opencc.js';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		addIcon("ZH_icon", `<text x="5" y="75" font-size="90" fill="currentColor">繁</text>`);
		addIcon("CH_icon", `<text x="5" y="75" font-size="90" fill="currentColor">简</text>`);

		async function getobfile(app: App, filename: string, mode: string) {
			try {
				const noteFile = app.vault.getFiles().filter((targerfile: { name: string; }) => targerfile.name == filename)[0] ?? app.workspace.getActiveFile();
				if (noteFile == null) {
					throw new Error('找不到文件!')
				}
				if (!CheckFileType(noteFile.name)) {
					throw new Error(noteFile.name + " 不是文本格式md/txt")
				}
				let text = await app.vault.read(noteFile);
				const result: string = ChineseConverter(text, mode);
				app.vault.modify(noteFile, result)
				new Notice('全文轉換完成');
			}
			catch (e) {
				console.log((e as Error).message);
				new Notice('全文轉換失敗: ' + e.message);
			}
		}

		function ChineseConverter(text: string, mode: string): string {
			if (mode == 'cn') {
				const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
				return converter(text);
			} else {
				const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
				return converter(text);
			}
		}

		function CheckFileType(filename: string): boolean {
			let filetype = filename.split(".")[1] ?? null
			if (filetype == "md") {
				return true
			}
			if (filetype == "txt") {
				return true
			}
			return false
		}

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("全文繁體轉換")
						.setIcon("ZH_icon")
						.onClick(async () => {
							getobfile(this.app, file.name, 'zh')
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("全文简体转换")
						.setIcon("CH_icon")
						.onClick(async () => {
							getobfile(this.app, file.name, 'cn')
						});
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("繁體轉換")
						.onClick(async () => {
							const result: string = ChineseConverter(editor.getSelection(), 'hk');
							editor.replaceSelection(result);
							new Notice("繁體轉換完成");
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("简体转换")
						.onClick(async () => {
							const result: string = ChineseConverter(editor.getSelection(), 'cn');
							editor.replaceSelection(result);
							new Notice("简体转换完成");
						});
				});
			})
		);

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('ZH_icon', '全文繁體轉換', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			getobfile(this.app, "", 'zh')
		});

		this.addRibbonIcon('CH_icon', '全文简体转换', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			getobfile(this.app, "", 'cn')
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
