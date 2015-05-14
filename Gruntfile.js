module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    jshint: {
      files: ['movviz.js', 'lib/**/*.js', 'test/**/*.js'],
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
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask('default', ['jsbeautifier', 'jshint', 'jsdoc']);

};
