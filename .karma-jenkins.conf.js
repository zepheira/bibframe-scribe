module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'app/static/js/lib/angular.min.js',
      'app/static/js/lib/angular-resource.min.js',
      'app/static/js/lib/ui-bootstrap-tpls-0.13.4-SNAPSHOT.min.js',
      'app/static/js/lib/http-throttler.js',
      'app/static/js/lib/dropzone.min.js',
      'app/static/js/lib/rdf_store_min.js',
      'tests/angular-mocks.js',
      'app/static/js/factories/*.js',
      'app/static/js/services/*.js',
      'app/static/js/initializer.js',
      'app/static/js/directives/*.js',
      'app/static/js/controllers/*.js',
      'tests/unit/**/*.js',
      'tests/unit/*.js'
    ],

    exclude: [
      'app/static/js/lib/angular.js'
    ],

    preprocessors: {
      'app/static/js/*.js': 'coverage',
      'app/static/js/factories/*.js': 'coverage',
      'app/static/js/directives/*.js': 'coverage',
      'app/static/js/controllers/*.js': 'coverage',
      'app/static/js/services/*.js': 'coverage'
    },

    reporters: ['dots', 'junit', 'coverage'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['PhantomJS'],

    singleRun: true,

    junitReporter: {
      outputFile: 'test-results.xml'
    },

    coverageReporter: {
      type: 'cobertura',
      dir: 'coverage/'
    }
  });
};
