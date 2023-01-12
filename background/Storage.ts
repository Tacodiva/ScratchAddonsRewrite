export interface Storage {

    addons?: { [key: string]: AddonStorage | undefined };
}

export interface AddonStorage {

    id: string,
    enabled: boolean,
    settings: { [key: string]: AddonStorageSetting | undefined }

}

export interface AddonStorageSetting {
    id: string,
    value: any
}