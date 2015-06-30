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
                    'public/css/users/register.min.css': ['assets/prefix_css/users/register.css'],
                    'public/css/admin/users/edit.min.css': ['assets/prefix_css/admin/users/edit.css'],
                    'public/css/gallery/upload.min.css': ['assets/prefix_css/gallery/upload.css'],
                    'public/css/gallery/gallery.min.css': ['assets/prefix_css/gallery/gallery.css'],
                    'public/css/gallery/add.min.css': ['assets/prefix_css/gallery/add.css']
                }
            }
        },
        uglify: {
            target: {
                files: {
                    'public/js/common/common.min.js' : ['assets/js/common/common.js'],
                    'public/js/common/qiniu-hash.min.js' : ['assets/js/common/qiniuHash.js'],
                    'public/js/common/qetag.js' : ['assets/js/common/qetag.js'],
                    'public/js/common/buffer.js' : ['assets/js/common/buffer.js'],
                    'public/js/index.min.js'         : ['assets/js/index/index.js'],
                    'public/js/users/register.min.js': ['assets/js/users/register/register.js'],
                    'public/js/gallery/upload.min.js': ['assets/js/gallery/upload.js'],
                    'public/js/gallery/gallery.min.js': ['assets/js/gallery/gallery.js']
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