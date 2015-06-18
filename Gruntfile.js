module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    jshint: {
      command: {
        src: ['command/movviz.js'],
        options: {
          jshintrc: '.jshintrc'
        }
      },
      server: {
        src: ['server/movviz.js', 'server/server.js', 'server/src/**/*.js', 'test/**/*.js'],
        options: {
          jshintrc: '.jshintrc' 
        }
      },
      client: {
        src: ['client/javascript/**/*.js'],
        options: {
          jshintrc: '.jshintrc' 
        }
      }
    },

    jsbeautifier: {
      command: {
        src: ['command/movviz.js']
      },
      server: {
        src: ['server/server.js', 'server/src/**/*.js', 'server/test/**/*.js'],
        options: {
          config: ".jsbeautifyrc"
        }
      },
      client: {
        src: ['client/javascript/**/*.js'],
        options: {
          config: ".jsbeautifyrc"
        }
      }
    },

    jsdoc: { 
      server: {
        src: ['server/src/**/*.js'],
        options: {
          destination: 'server/doc',
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
          'public/css/main.min.css': 'client/less/main.less'
        }
      }
    },

    copy: { // client only
      client: {
        files: [
          {
            expand:true, 
            cwd: 'client/images/',
            src: ['**/*.png'], 
            dest: 'public/images'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/angular/angular.min.js'],
            dest: 'public/vendor/angular/'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/angular-route/angular-route.min.js'],
            dest: 'public/vendor/angular-route/'
          },
          {
            expand: true,
            flatten: true,
            src: [
              'bower_components/angular-bootstrap/ui-bootstrap.min.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
            ],
            dest: 'public/vendor/angular-bootstrap/'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/jquery/dist/jquery.min.js'],
            dest: 'public/vendor/jquery/'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/bootstrap/dist/js/bootstrap.min.js'],
            dest: 'public/vendor/bootstrap/scripts/'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/bootstrap/dist/css/bootstrap.min.css'],
            dest: 'public/vendor/bootstrap/css/'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/bootstrap/fonts/*'],
            dest: 'public/vendor/bootstrap/fonts/'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/satellizer/satellizer.min.js'],
            dest: 'public/vendor/satellizer'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/bootstrap-social/bootstrap-social.css'],
            dest: 'public/vendor/bootstrap-social'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/font-awesome/css/font-awesome.min.css'],
            dest: 'public/vendor/font-awesome/css'
          },
          {
            expand: true,
            flatten: true,
            src: ['bower_components/font-awesome/fonts/*'],
            dest: 'public/vendor/font-awesome/fonts'
    
          }
        ]
      }
    },

    uglify: { // client only
      options: {
        mangle: false,
        sourceMap: true
      },
      my_target: {
        files: {
          'public/scripts/movviz.min.js': ['client/javascript/**/*.js', '!client/javascript/**/*-spec.js']
        }
      }
    },


    mochaTest: { // server & command only
      test: {
        src: ['server/test/**/*.js', 'command/test/**/*.js'],
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
        files: ['client/less/**/*.less'],
        tasks: ['less'],
        options: {
          nospawn: true
        }
      },
      jsClient: {
        files: ['client/javascript/**/*.js'],
        tasks: ['uglify']
      },
      karma: {
        files: ['client/javascript/**/*.js'],
        tasks: ['karma:unit:run']
      }, 
      js: {
        files: ['<%= jshint.client.src %>', '<%= jshint.server.src %>'],
        tasks: ['jshint']
      } 
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('command', ['jshint:command', 'jsbeautfier:command']);
  grunt.registerTask('server', ['mochaTest', 'jsbeautifier:server', 'jshint:server']);
  grunt.registerTask('client', ['jsbeautifier:client', 'jshint:client',  'uglify', 'less', 'copy', 'karma:continuous']);
  grunt.registerTask('default', ['server', 'client']);
};
