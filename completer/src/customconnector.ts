// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Modified from jupyterlab/packages/completer/src/contextconnector.ts

import {
  CompletionHandler,
  ICompletionContext,
  ICompletionProvider
} from '@jupyterlab/completer';
import { AutocompleteResult, ISettings } from './types';
import { BASE_URL, CHAR_LIMIT, MAX_RESULTS } from './consts';
import icon from './icon';

const DEFAULT_SETTINGS: ISettings = {
  baseUrl: BASE_URL,
  charLimit: CHAR_LIMIT,
  maxResults: MAX_RESULTS,
}
  
/**
 * A custom connector for completion handlers.
 */
export class CustomCompleterProvider implements ICompletionProvider {
  /**
   * The context completion provider is applicable on all cases.
   * @param context - additional information about context of completion request
   */
  readonly identifier = 'CompletionProvider:custom';
  readonly renderer = null;

  // constructor (settings: ISettings) {
  //     this._settings = settings
  // }

  async isApplicable(context: ICompletionContext): Promise<boolean> {
    return true;
  }

  async fetch(request: CompletionHandler.IRequest, context: ICompletionContext): Promise<CompletionHandler.ICompletionItemsReply> {
    try {
      const completions = await this.completionHint(request, context);
      return completions;
    } catch (error) {
      console.error('Error fetching completions:', error);
      throw error;  // Rethrow or handle as needed
    }
  }

  set settings(settings: ISettings) {
    console.log("reset TabNine settings...");
    this._settings = settings;
  }


  async completionHint(
    request: CompletionHandler.IRequest,
    context: ICompletionContext,
  ): Promise<CompletionHandler.ICompletionItemsReply> {
    // Find the token at the cursor
    console.log("Calling TabNine API... maxResults=", this._settings.maxResults)
    const editor = context.editor;
    if (!editor) {
      return Promise.reject('No editor');
    }
    const position = editor.getCursorPosition();
    const currOffset = editor.getOffsetAt(position);

    const beforeStartOffset = Math.max(0, currOffset - this._settings.charLimit);
    const afterEndOffset = currOffset + this._settings.charLimit;
    const before = request.text.slice(beforeStartOffset, currOffset);
    const after = request.text.slice(currOffset, afterEndOffset);
    const data = {
      version: "3.2.71",
      request: {
        Autocomplete: {
          before: before,
          after: after,
          max_num_results: this._settings.maxResults,
          filename: "test.py",
          region_includes_beginning: currOffset === 0,
          region_includes_end: false,
        }
      }
    }
    let serverURL: string = this._settings.baseUrl;
    if (!serverURL.endsWith('/')) {
      serverURL += '/';
    }
    serverURL += 'tabnine';
    const queryString = this.buildQueryString({ 'data': JSON.stringify(data) });
    const urlWithParams = serverURL + '?' + queryString;
    let resp: Response;
    try {
      resp = await fetch(urlWithParams);
      const data: AutocompleteResult = await resp.json();

      const items: CompletionHandler.ICompletionItem[] = data.results.map(
        (res) => ({
          label: res.new_prefix,
          type: "tabnine",
          icon
        })
      )
      return {
        start: currOffset - data.old_prefix.length,
        end: currOffset,
        items
      };
    } catch (error) {
      throw error;
    }

  }


  buildQueryString(params: { [key: string]: string }): string {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  private _settings: ISettings = DEFAULT_SETTINGS; 
}
