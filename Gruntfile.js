/* global require */
'use strict';

/**
 * Get and display all interfaces and their IP
 */
console.info('Interface list:');
var os = require('os');
var ifaces = os.networkInterfaces();
var availableIP = [];
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family === 'IPv4') {
      availableIP.push({
        'interface': dev,
        'ip': details.address
      });
console.info('----- '+dev+(alias?':'+alias:''), details.address);
      ++alias;
    }
  });
}

/**
 * General IP to use
 */
var myIP = availableIP[1].ip;

/**
 * GRUNTFILE
 */
module.exports = function(grunt) {

  /**
  * Load grunt tasks automatically
  * Read the dependencies/devDependencies/peerDependencies in the package.json
  * and load grunt tasks that match the provided patterns.
  */
  require('load-grunt-tasks')(grunt, {
    // pattern: 'grunt-*',
    config: 'package.json',
    scope: ['dependencies', 'devDependencies']
  });

  /**
   * Time how long tasks take.
   * Can help when optimizing build times
   */
  require('time-grunt')(grunt);

  /**
   * Define the configuration for all tasks
   */
  grunt.initConfig({

    /**
     * Watch files for changes and runs tasks based on the changed files
     * @type {Object}
     */
    watch: {
      options: {
          nospawn: true, // Will be 'spawn: false' in v6.x
          livereload: true
      },
      js: {
      files: ['app/js/{,*/}*.{js,hbs}'],
        tasks: [],
        option: {
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      sass: {
        files: 'app/scss/**/*.scss',
        tasks: ['sass:dist']
      },
      livereload: {
        options: {
          livereload: 35729
        },
        files: [
          'app/{,*/}*.html',
          'app/js/templates/{,*/}*.hbs',
          'app/js/{,*/}*.js',
          'app/js/modules/{,*/}*.js',
          'app/images/{,*/}*.{ico,gif,jpeg,jpg,png,svg,webp}'
        ]
      }
    },

    /**
     * Grunt server settings
     */
    connect: {
      options: {
        hostname: myIP,
        livereload: 35729,
        port: 9000,
        protocol: 'http' // Protocol used
      },
      livereload: {
        options: {
          open: true,
          base: 'app'
        }
      },
      dist: {
        options: {
          open: true,
          base: 'dist',
          livereload: false
        }
      }
    },

    /**
     * Empties folders to start fresh
     */
     clean: {
       dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    /**
     * C LIBSASS
     * Compiles Sass to CSS and generates necessary files if requested
     * @type {Object}
     */
    sass: {
      options: {
        loadPath: [
          'app/bower_components/bourbon/dist',
          'app/bower_components/font-awesome/scss',
          'app/bower_components/foundation/scss'
        ],
        style: 'compressed' // 'nested' (default), 'expanded', 'compact', 'compressed'
      },
      dist: {
        files: {
          'app/css/main.css': 'app/scss/main.scss'
        }
      }
    },

    /**
     * The following *-min tasks produce minified files in the dist folder
     */
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: 'dist/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '{,*/}*.svg',
          dest: 'dist/images'
        }]
      }
    },

    /**
     * USEMIN PREPARE
     * @type {Object}
     */
    useminPrepare: {
      html: 'app/index.html',
      options: {
        staging: '.tmp',
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/css/{,*/}*.css'],
      options: {
        dirs: ['dist']
      }
    },

    /**
     * Concat (use by usemin/useminPrepare)
     * @type {Object}
     */
    concat: {
      options: {
        separator: ';',
        sourceMap: false,
        sourceMapName: undefined,
        sourceMapStyle: 'embed'
      }
    },

    /**
     * UglifyJS (use by usemin/useminPrepare)
     * @type {Object}
     */
    uglify: {
      options: {
        beautify: false,
        mangle: true
      }
    },

    /**
     * Copies remaining files to places other tasks can use
     * fontawesome: copy the fontawesome font into the dist directory
     * dist: simple frontend distribution
     * @type {Object}
     */
    copy: {

      fontawesome: {
        files:[
          {
            cwd:'app/bower_components/font-awesome/fonts/',
            expand: true,
            flatten: true,
            src: '**',
            dest: 'app/fonts/'
          }
        ]
      },

      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'app',    // From
            dest: 'dist',  // To
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              //'images/{,*/}*.{jpg,gif,ico,png,txt,webp,svg}',
              'images/*.*',
              '{,*/}*.html',
              'js/{,*/}*.*', // Need to load entities
              '!js/modules', // No need to copy modules
              'css/{,*/}*.*',
              'fonts/{,*/}*.*'
            ]
          }
          ,{
            expand: true,
            flatten: true,
            src: ['app/bower_components/font-awesome/fonts/**'],
            dest: 'dist/fonts/',
            filter: 'isFile'
          }

        ]
      }
    },

    /**
     * jshint
     * Check the integrity design of code
     * @type {Object}
     */
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: '.jshintrc'
      },
      all: [
        '!Gruntfile.js',
        'app/js/{,*/}*.js'
      ]
    }

  });// END grunt.initConfig

  /**
   * SERVER TASK
   * Initializing the watch, copying styles and start compass.
   * Launch the local server and open the app in the browser.
   */
  grunt.registerTask('server', function (target) {

    // $ grunt server:dist
    if(target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'copy:fontawesome',
      'connect:livereload',
      'watch'
    ]);
  });

  /**
   * BUILD TASK
   */
  grunt.registerTask('build', [
    'clean:dist',
    'copy:dist',
    'useminPrepare',
    'usemin',
    'concat',
    'uglify',
    'imagemin',
    'clean:server'
  ]);

  /**
   * SCAN-JS
   * Scan the js with JSHINT
   */
  grunt.registerTask('scan-js', ['jshint']);

};
