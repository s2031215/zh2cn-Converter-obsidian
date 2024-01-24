import { App, addIcon, Editor, Notice, Plugin } from 'obsidian';
import * as OpenCC from './opencc.js';

export default class ChineseConverterPlugin extends Plugin {

	/**
	 * This function returns true if input file type is md or txt 
	 *
	 * @public
	 * @param {string} filename
	 */
	CheckFileType(filename: string): boolean {
		let filetype = filename.split(".")[1] ?? null
		if (filetype == "md") {
			return true
		}
		if (filetype == "txt") {
			return true
		}
		return false
	}

	/**
	 * This function will reture Converted Chinese string in cn or zh mode 
	 *
	 * @public
	 * @param {string} input_text
	 * @param {string} mode
	 */
	ChineseConverter(input_text: string, mode: string): string {
		try {
			let output: string = "";

			if (mode == 'cn') {
				const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
				output = converter(input_text);
			} else {
				const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
				output = converter(input_text);
			}

			//Restore the word for should not be Converter e.g linked filename
			const re = /\!\[\[(.*)\]\]/g
			let match;
			while ((match = re.exec(output)) != null) {
				//console.log(match[0] + " match found at " + match.index);
				output = output.replace(match[0], input_text.substring(match.index, match.index + match[0].length));
			}
			return output

		}
		catch (e) {
			new Notice('轉換失敗: ' + e.message);
			return input_text

		}
	}

	/**
	 * This function Read the text file and convent to Chinese, if filename is not define, it will get the getActiveFile
	 *
	 * @public
	 * @param {string} filename
	 * @param {string} mode
	 */
	async ConvertFile(filename: string, mode: string) {
		try {
			const noteFile = this.app.vault.getFiles().filter((targerfile: { name: string; }) => targerfile.name == filename)[0] ?? this.app.workspace.getActiveFile();
			if (noteFile == null) {
				throw new Error('找不到文件!')
			}
			if (!this.CheckFileType(noteFile.name)) {
				throw new Error(noteFile.name + " 不是文本格式md/txt")
			}
			let text = await this.app.vault.read(noteFile);
			const result: string = this.ChineseConverter(text, mode);
			this.app.vault.modify(noteFile, result)
			if(mode=="zh"){
				new Notice('全文繁體轉換完成');
			}else{
				new Notice('全文简体转换完成');
			}
		}
		catch (e) {
			console.log((e as Error).message);
			new Notice('全文轉換失敗: ' + e.message);
		}
	}

	async onload() {

		addIcon("ZH_icon", `<text x="5" y="75" font-size="90" fill="currentColor">繁</text>`);
		addIcon("CH_icon", `<text x="5" y="75" font-size="90" fill="currentColor">简</text>`);

		// This creates an option in the on top right menu on an editor.
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("全文繁體轉換")
						.setIcon("ZH_icon")
						.onClick(async () => {
							this.ConvertFile(file.name, 'zh')
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("全文简体转换")
						.setIcon("CH_icon")
						.onClick(async () => {
							this.ConvertFile(file.name, 'cn')
						});
				});
			})
		);

		// This creates an selection in the right click menu on editor.
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("繁體轉換")
						.onClick(async () => {
							const result: string = this.ChineseConverter(editor.getSelection(), 'hk');
							editor.replaceSelection(result);
							new Notice("繁體轉換完成");
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("简体转换")
						.onClick(async () => {
							const result: string = this.ChineseConverter(editor.getSelection(), 'cn');
							editor.replaceSelection(result);
							new Notice("简体转换完成");
						});
				});
			})
		);

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('ZH_icon', '全文繁體轉換', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.ConvertFile("", 'zh')
		});

		this.addRibbonIcon('CH_icon', '全文简体转换', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			this.ConvertFile("", 'cn')
		});

		// initialise global command for convert-select-to-zh
		this.addCommand({
			id: "convert-select-to-zh",
			name: "選取文字轉換繁體 convert-to-zh ",
			editorCallback: (editor: Editor) => {
				const result: string = this.ChineseConverter(editor.getSelection(), 'hk');
				editor.replaceSelection(result);
				new Notice("繁體轉換完成");
			},
		});

		// initialise global command for convert-select-to-cn
		this.addCommand({
			id: "convert-select-to-cn",
			name: "選取文字轉換简体 convert-to-cn ",
			editorCallback: (editor: Editor) => {
				const result: string = this.ChineseConverter(editor.getSelection(), 'cn');
				editor.replaceSelection(result);
				new Notice("简体轉換完成");
			},
		});

		// initialise global command for convert-file-to-cn
		this.addCommand({
			id: "convert-file-to-zh",
			name: "全文繁體轉換 full-convert-to-zh",
			callback: () => {
				this.ConvertFile("", 'zh');
			},
		});

		// initialise global command for convert-file-to-cn
		this.addCommand({
			id: "convert-file-to-cn",
			name: "全文简体转换 full-convert-to-cn",
			callback: () => {
				this.ConvertFile("", 'cn');
			},
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));


	}
}
