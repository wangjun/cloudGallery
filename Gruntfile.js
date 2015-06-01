'use strict';

module.exports = function (grunt) {

    var config = {
        bower: 'bower_components',
        routes: 'routes',
        public: 'public',
        views: 'views',
        assets:'assets'
    };
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,
        copy: {
            bootstrap: {
                files: [
                    {'<%= config.public %>/css/bootstrap.min.css': '<%= config.bower %>/bootstrap/dist/css/bootstrap.min.css'},
                    {'<%= config.public %>/js/bootstrap.min.js': '<%= config.bower %>/bootstrap/dist/js/bootstrap.min.js'},
                    {
                        cwd: '<%= config.bower %>/bootstrap/dist/fonts/',
                        dest: '<%= config.public %>/fonts/',
                        src: '*',
                        expand: true
                    }
                ]
            },
            jquery: {
                files: [
                    {'<%= config.public %>/js/jquery/jquery.min.js': '<%= config.bower %>/jquery/dist/jquery.min.js'},
                    {'<%= config.public %>/js/jquery/jquery.min.map': '<%= config.bower %>/jquery/dist/jquery.min.map'}
                ]
            },
            plupload: {
                files: [
                    {
                        cwd: '<%= config.bower %>/plupload/js/',
                        dest: '<%= config.public %>/js/plupload/',
                        src: '**/*',
                        expand: true
                    }
                ]
            },
            qiniu: {
                files: [
                    {'<%= config.public %>/js/qiniu/qiniu.min.js': '<%= config.bower %>/js-sdk/src/qiniu.min.js'}
                ]
            },
            livereload: {
                files: [
                    {'<%= config.public %>/js/livereload/livereload.js': '<%= config.bower %>/livereload/dist/livereload.js'}
                ]
            }
        },
        clean: {
            bootstrap: {
                src: [
                    '<%= config.public %>/css/bootstrap.min.css',
                    '<%= config.public %>/js/bootstrap.min.js',
                    '<%= config.public %>/fonts/*'
                ]
            },
            jquery: {
                src: [
                    '<%= config.public %>/js/jquery/*'
                ]
            },
            plupload: {
                src: [
                    '<%= config.public %>/js/plupload/*'
                ]
            },
            qiniu: {
                src: [
                    '<%= config.public %>/js/qiniu/*'
                ]
            },
            livereload: {
                src: [
                    '<%= config.public %>/js/livereload/*'
                ]
            }

        },
        less: {
            options: {
                strictImports: true
            },
            all: {
                files: [{
                    cwd: '<%= config.assets %>/less/',
                    dest: '<%= config.assets %>/css/',
                    ext:'.css',
                    src: '**/*.less',
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
                    ext:'.css',
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
                files: {
                    'public/css/common/common.min.css': ['assets/prefix_css/common/common.css'],
                    'public/css/index/index.min.css': ['assets/prefix_css/index/index.css'],
                    'public/css/users/login.min.css': ['assets/prefix_css/users/login.css'],
                    'public/css/admin/users/edit.min.css': ['assets/prefix_css/admin/users/edit.css'],
                    'public/css/gallery/upload.min.css': ['assets/prefix_css/gallery/upload.css']
                }
            }
        },
        uglify: {
            script: {
                files: {
                    'public/js/common/common.min.js': ['assets/js/common/common.js']
                }
            },
            index: {
                files: {
                    'public/js/index.min.js': ['assets/js/index/index.js']
                }
            },
            users_register: {
                files: {
                    'public/js/users/register.min.js': ['assets/js/users/register/register.js']
                }
            },
            gallery: {
                files: {
                    'public/js/gallery/upload.min.js': ['assets/js/gallery/upload.js']
                }
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