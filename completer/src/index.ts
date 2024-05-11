import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { INotebookTracker } from '@jupyterlab/notebook';

import { CustomCompleterProvider } from './customconnector';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ISettings } from './types';

/**
 * Initialization data for the extension.
 */

const PLUGIN_ID = '@jupyterlab-examples/completer:completer';

const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'JupyterLab extension setting up the completion.',
  autoStart: true,
  requires: [ICompletionProviderManager, INotebookTracker, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    completionManager: ICompletionProviderManager,
    notebooks: INotebookTracker,
    Settings: ISettingRegistry
  ) => {
    const completer = new CustomCompleterProvider();
    completionManager.registerProvider(completer);

    function setCompleterSetting(
      setting: ISettingRegistry.ISettings
    ): void {
      const baseUrl = setting.get("baseUrl").composite as string;
      const charLimit = setting.get("charLimit").composite as number;
      const maxResults = setting.get("maxResults").composite as number;
      const tabNineSetting: ISettings = {
        baseUrl,
        charLimit,
        maxResults,
      };
      completer.settings = tabNineSetting;
    }

    console.log('JupyterLab custom completer extension is activated!');
    app.restored.then(() => {
      console.log('JupyterLab custom completer extension is restored!');
      const completerSettings = Settings.load(PLUGIN_ID);
      completerSettings.then((setting) => {
        setCompleterSetting(setting);
        setting.changed.connect(setCompleterSetting);
        console.log('JupyterLab custom completer extension is loaded!');
      });
    });
  }

};

export default extension;
