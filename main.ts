import {
	WorkspaceLeaf,
	Notice,
	Plugin,
	TFolder
} from 'obsidian';
import {FileExplorerItem} from "./interface";

const REVEAL_FILE_ICON =
	'<svg t="1664520498493" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1866" data-spm-anchor-id="a313x.7781069.0.i5" width="200" height="200"><path fill="currentColor" stroke="currentColor" d="M512.000512 65.300238c-246.715031 0-446.674179 200.01236-446.674179 446.729437 0 246.716055 199.959148 446.671109 446.674179 446.671109 246.716055 0 446.672132-199.956078 446.672132-446.672132C958.672644 265.311575 758.716566 65.300238 512.000512 65.300238zM553.880341 900.627135 553.880341 749.337453l-55.837726 0 0 153.273872c-195.056488-6.880711-354.169345-157.369144-374.642632-348.705913l151.264099 0 0-55.837726L121.414769 498.067686c7.211239-204.479091 172.175361-369.46675 376.626823-376.679012l0 153.330154 55.837726 0L553.879318 123.372865c191.335746 20.478404 341.823156 179.613774 348.703867 374.694821L749.311359 498.067686l0 55.837726 151.289682 0C881.109104 736.025263 736.000192 881.135198 553.880341 900.627135z" p-id="1867"></path></svg>';

const REVEL_BUTTON_CLASS = 'x-reveal-file-button';

export default class MyPlugin extends Plugin {
	private get leaves(): WorkspaceLeaf[] {
		return this.app.workspace.getLeavesOfType('file-explorer');
	}

	private getRevealButton(leaf: WorkspaceLeaf): NodeListOf<HTMLDivElement> {
		return leaf.view.containerEl.querySelectorAll(
			`.${REVEL_BUTTON_CLASS}`
		);
	}

	/**
	 * refer to : https://github.com/OfficerHalf/obsidian-collapse-all
	 * Ensures given explorer item is a folder and not the root or a note
	 */
	private explorerItemIsFolder(item: FileExplorerItem): boolean {
		return (
			item.file instanceof TFolder &&
			item.file.path !== '/' &&
			item.collapsed !== undefined
		);
	}

	async onload() {

		const showFileLocation = () => {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice("No active file");
				return;
			}
			const relativePath = activeFile.path;
			this.leaves.forEach((leaf) => {
				// get all file aside
				const items = Object.values((leaf.view as any).fileItems) as FileExplorerItem[];
				items.forEach((item) => {
					// expand folder
					if (item && this.explorerItemIsFolder(item) && item.collapsed !== false && relativePath.includes(item.file.path)) {
						console.log('item path:', item.file.path)
						item.setCollapsed && item.setCollapsed(false);
					}
				});
			})
			let targetElement = document.querySelector(`div[data-path="${relativePath}"]`);
			if (targetElement) {
				targetElement.scrollIntoView();
			}
		}

		this.app.workspace.onLayoutReady(() => {
			this.leaves.forEach((leaf) => {
				const container = leaf.view.containerEl as HTMLDivElement;
				const navContainer = container.querySelector('div.nav-buttons-container');
				if (!navContainer) {
					return null;
				}
				// check button existed
				const existingButton = this.getRevealButton(leaf)[0]
				if (existingButton) {
					return;
				}
				const button = document.createElement('div');
				button.innerHTML = REVEAL_FILE_ICON;
				button.setAttribute(
					'aria-label',
					'Show opened file'
				);
				button.className = `nav-action-button ${REVEL_BUTTON_CLASS}`;
				navContainer.appendChild(button);
				this.registerDomEvent(button, 'click', showFileLocation);
			})
		});

		// add command
		this.addCommand({
			id: 'reveal file in navigation',
			name: 'Reveal file in navigation',
			callback: showFileLocation
		});
	}

	onunload() {
		// remove added buttons
		this.leaves.forEach((leaf) => {
			const revealButton = this.getRevealButton(leaf);
			revealButton.forEach(button => {
				button.remove();
			})
		})
	}
}
