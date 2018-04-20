/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('bower.json'),
      less: {
        all: {
          files: {
            'build/_less.css': 'public/stylesheets/*.less'
          }
        }
      },
      bower_concat: {
        all: {
          options: { separator : ';\n' },
          dest: {
            css: 'build/_bower.css',
            js: 'build/_bower.js'
          },
          mainFiles: {
            bootstrap: 'dist/css/bootstrap.css'
          }
        }
      },
      concat: {
        css: {
          src: 'build/_*.css',
          dest: 'public/bundle.css'
        },
        js: {
          src: ['build/_*.js'],
          dest: 'public/bundle.js'
        }
      }
    });
    
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-concat');
    
    grunt.registerTask('build', ['bower_concat', 'less', 'concat']);
};
