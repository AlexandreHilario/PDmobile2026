// O Expo carrega app.json primeiro; este arquivo acrescenta os valores do .env.
module.exports = ({ config }) => {
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || config.extra?.eas?.projectId;
  return ({
  ...config,
  ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
  ...(projectId ? {
    extra: { ...config.extra, eas: { ...config.extra?.eas, projectId } },
    updates: { ...config.updates, url: `https://u.expo.dev/${projectId}` },
  } : {})
  });
};
