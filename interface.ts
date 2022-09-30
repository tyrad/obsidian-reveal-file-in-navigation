import {TFile, TFolder, View} from 'obsidian';

// refer to : https://github.com/OfficerHalf/obsidian-collapse-all
export interface FileExplorerItem {
	file: TFile | TFolder;
	collapsed?: boolean;
	setCollapsed?: (state: boolean) => void;
}
