'use strict';

module.exports = function (grunt) {

    var config = {
        bower: 'bower_components',
        routes: 'routes',
        views: 'views',
        assets: 'assets',
        dist: 'public'
    };
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,
        less: {
            options: {
                strictImports: true
            },
            all: {
                files: [{
                    cwd: '<%= config.assets %>/less/',
                    dest: '<%= config.assets %>/css/',
                    ext: '.css',
                    src: ['**/*.less', '!variables/**/*.less', '!mixins/**/*.less'],
                    expand: true
                }]
            }
        },
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer-core')({browsers: 'last 2 version'}),
                    require('csswring')
                ]
            },
            all: {
                files: [{
                    cwd: '<%= config.assets %>/css/',
                    dest: '<%= config.assets %>/prefix_css/',
                    ext: '.css',
                    src: '**/*.css',
                    expand: true
                }]
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: [{
                    cwd: '<%= config.assets %>/prefix_css/',
                    dest: '<%= config.dist %>/css/',
                    ext: '.css',
                    src: '**/*.css',
                    expand: true
                }]
            }
        },
        uglify: {
            target: {
                files: [{
                    cwd: '<%= config.assets %>/js/',
                    dest: '<%= config.dist %>/js/',
                    ext: '.js',
                    src: '**/*.js',
                    expand: true
                }]
            }
        },
        watch: {
            options: {
                livereload: 35728
            },
            css: {
                files: ['assets/less/**/*'],
                tasks: ['css']
            },
            js: {
                files: ['assets/js/**/*'],
                tasks: ['uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //custom tasks
    grunt.registerTask('fresh', ['clean', 'copy']);
    grunt.registerTask('css', ['less', 'postcss', 'cssmin']);
    grunt.registerTask('js', ['uglify']);
    grunt.registerTask('assets', ['less', 'postcss', 'cssmin', 'uglify']);

};
