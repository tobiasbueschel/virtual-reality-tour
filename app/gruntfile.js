module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    paths: ["css"]
                },
                files: {
                    "css/app.css": "less/app.less"
                },
                cleancss: true
            }
        },
        csssplit: {
            your_target: {
                src: ['css/app.css'],
                dest: 'css/app.min.css',
                options: {
                    maxSelectors: 4095,
                    suffix: '.'
                }
            }
        },
        ngtemplates: {
          nibbl: {
            src: ['template/**.html', 'template/**/**.html'],
            dest: 'js/services/templates.js',
            options: {
              htmlmin: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true
              }
            }
          }
        },
        connect:{
            server: {
                options: {
                    hostname: 'localhost',
                    port: 3000,
                    livereload: true
                }
            }

        },
        watch: {
            options: {
                spawn: false,
                livereload: true
            },
            a: {
                files: ['less/**/*.less'], // which files to watch
                tasks: ['less', 'csssplit'],
                options: {
                    nospawn: true
                }
            },
            b: {
                files: ['template/**/*.html'], // which files to watch
                tasks: ['ngtemplates'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    // Load the plugin that provides the "less" task.
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-csssplit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-connect');


    // Default task(s).
    grunt.registerTask('default', [
        'less',
        'csssplit',
        'ngtemplates',
        'connect',
        'watch'
    ]);

};
