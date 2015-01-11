module.exports = function(grunt) {

  grunt.initConfig({
	pkg : grunt.file.readJSON('package.json'),
      concurrent: {
        target: {
          tasks: ['nodemon', 'sass', 'concat', 'watch'],
          options: {
            logConcurrentOutput: true
          }
        }
      },

      nodemon: {
        dev: {
          script: 'server.js'
        }
      },
      sass: {
        dist: {
          options: {
            style: 'compressed'
          },
          files: {
            'public/styles/app.css': 'public/styles/scss/app.scss',
          }
        }
      },
      concat: {
        // Setup concat of the components some day
        // components: {
        //   src: ['public/scripts/directives/directives.header', 'public/scripts/directives/*.js'],
        //   dest: 'public/scripts/directives.js'
        // },
        css: {
          src: ['public/styles/app.css'],
          dest: 'public/styles/app.css'
        }
      },
      nggettext_extract: {
          pot: {
              files: {
                  'public/po/template.pot': ['public/*.html', 'public/*/*.html']
              }
          },
      },
      nggettext_compile: {
          all: {
              files: {
                  'public/translations.js': ['public/po/*.po']
              }
          },
      },
      watch: {
        options: {
          livereload: true,
        },
        html: {
          files: ['public/index.html', 'public/*/*.html'],
          tasks: ['nggettext_extract']
        },
        sass: {
          options: {
            livereload: false
          },
          files: ['public/styles/scss/*.scss'],
          tasks: ['sass', 'concat:css'],
        },
        css: {
          files: [],
          tasks: ['-']
        }
        // Watch js for concatenations
      },
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-gettext');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['concurrent:target']);
    grunt.registerTask('compile', ['sass', 'watch']);
};