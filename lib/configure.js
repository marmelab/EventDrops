export default (config, defaultConfig) => {
    const finalConfiguration = {};

    for (const key in defaultConfig) {
        if (!defaultConfig.hasOwnProperty(key)) {
            continue;
        }

        finalConfiguration[key] = config[key] || defaultConfig[key];
    }

    return finalConfiguration;
};
