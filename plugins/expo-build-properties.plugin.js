module.exports = {
    name: 'gradle-fix',
    version: '1.0.0',
    plugin: (config) => {
      return {
        ...config,
        android: {
          ...config.android,
          gradleProperties: [
            ...(config.android?.gradleProperties || []),
            'org.gradle.jvmargs=-Xmx4096m',
            'android.useAndroidX=true'
          ]
        }
      };
    },
  };