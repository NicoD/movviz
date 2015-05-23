module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    jshint: {
      files: ['movviz.js', 'lib/**/*.js', 'test/**/*.js',' asset/javascript/**/*.js'],
      options: {
        jshintrc: '.jshintrc' 
      }
    },

    jsbeautifier: {
      files: ['movviz.js', 'lib/**/*.js', 'test/**/*.js'],
      options: {
        config: ".jsbeautifyrc"
      }
    },

    // server only
    jsdoc: {
      dist: {
        src: ['lib/**/*.js'],
        options: {
          destination: 'doc',
          template:    'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure:   'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json'
        }
      }
    },


    less: {
      development: {
        options: {
          compress: true,
          optimization: 2
        },
        files: {
          'public/css/main.css': 'assets/less/main.less'
        }
      }
    },

    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      my_target: {
        files: {
          'public/scripts/movviz.min.js': [
                                            'assets/javascript/app.js', 
                                            'assets/javascript/controller.js'
                                          ]
        }
      }
    },

    mochaTest: {
      test: {
        src: ['test/**/*.js'],
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
      js: {
        files: ['<%= jshint.files %>'],
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

  grunt.registerTask('default', ['mochaTest', 'jsbeautifier', 'jshint', 'jsdoc', 'less']);

  grunt.registerTask('web', ['uglify', 'less']);

};
