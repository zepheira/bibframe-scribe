module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'app/static/js/lib/angular.min.js',
      'app/static/js/lib/angular-resource.min.js',
      'app/static/js/lib/ui-bootstrap-tpls-0.13.1-SNAPSHOT.min.js',
      'app/static/js/lib/http-throttler.js',
      'app/static/js/lib/dropzone.min.js',
      'app/static/js/lib/rdf_store_min.js',
      'tests/angular-mocks.js',
      'app/static/js/profile.js',
      'app/static/js/value-constraint.js',
      'app/static/js/property.js',
      'app/static/js/property-template.js',
      'app/static/js/resource-template.js',
      'app/static/js/pred-object.js',
      'app/static/js/namespace.js',
      'app/static/js/services.js',
      'app/static/js/initializer.js',
      'app/static/js/controllers.js',
      'tests/unit/*.js'
    ],

    exclude: [
      'app/static/js/lib/angular.js'
    ],

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome','Safari','Firefox'],

    singleRun: false
  });
};
