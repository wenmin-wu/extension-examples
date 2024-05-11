export type ResultEntry = {
    new_prefix: string;
    old_suffix: string;
    new_suffix: string;

    detail?: string;
};

export type AutocompleteResult = {
    old_prefix: string;
    results: ResultEntry[];
    user_message: string[];
    is_locked: boolean;
};

export interface ISettings {
    baseUrl: string;
    charLimit: number;
    maxResults: number;
};