module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    jshint: {
      server: {
        src: ['./movviz.js', 'server.js', 'lib/**/*.js', 'test/**/*.js'],
        options: {
          jshintrc: '.jshintrc' 
        }
      },
      client: {
        src: ['assets/javascript/**/*.js'],
        options: {
          jshintrc: '.jshintrc' 
        }
      }
    },

    jsbeautifier: {
      server: {
        src: ['movviz.js', 'server.js', 'lib/**/*.js', 'test/**/*.js'],
        options: {
          config: ".jsbeautifyrc"
        }
      },
      client: {
        src: ['assets/javascript/**/*.js'],
        options: {
          config: ".jsbeautifyrc"
        }
      }
    },

    jsdoc: { 
      server: {
        src: ['lib/**/*.js'],
        options: {
          destination: 'doc',
          template:    'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure:   'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json'
        }
      }
    },

    less: { // client only
      client: {
        options: {
          compress: true,
          optimization: 2
        },
        files: {
          'public/css/main.css': 'assets/less/main.less'
        }
      }
    },

    uglify: { // client only
      options: {
        mangle: false,
        sourceMap: true
      },
      my_target: {
        files: {
          'public/scripts/movviz.min.js': [
                                            'assets/javascript/app.js', 
                                            'assets/javascript/route.config.js',
                                            'assets/javascript/movielist.controller.js',
                                            'assets/javascript/moviedetail.controller.js',
                                            'assets/javascript/components/utils/utils.directive.js',
                                            'assets/javascript/components/paginator/paginator.directive.js',
                                            'assets/javascript/components/paginator/paginator.service.js'
                                          ]
        }
      }
    },


    mochaTest: { // server only
      test: {
        src: ['test/**/*.js'],
      }
    },

    karma: { // client only
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        singleRun: false
      },
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },


    watch: {
      styles: {
        files: ['assets/less/**/*.less'],
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },
      jsClient: {
        files: ['assets/javascript/**/*.js'],
        tasks: ['uglify']
      },
      karma: {
        files: ['assets/javascript/**/*.js'],
        tasks: ['karma:unit:run']
      }, 
      js: {
        files: ['<%= jshint.client.src %>', '<?= jshint.server.src %>'],
        tasks: ['jshint']
      } 
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('server', ['mochaTest', 'jsbeautifier', 'jshint:server']);
  grunt.registerTask('client', ['karma:continuous', 'jsbeautifier', 'jshint:client',  'uglify', 'less']);
  grunt.registerTask('default', ['server', 'client']);
};
