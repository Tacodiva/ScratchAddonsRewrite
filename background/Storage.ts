export interface Storage {

    addons?: { [key: string]: AddonStorage | undefined };
}

export interface AddonStorage {

    id: string,
    enabled: any | undefined,
    settings: { [id: string]: any | undefined }

}