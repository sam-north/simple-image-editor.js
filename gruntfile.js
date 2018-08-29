module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      buildJs: {
        src: ['src/js/<%= pkg.name %>.js'],
        dest: 'build/<%= pkg.name %>.js',
      }
    },
    cssmin: {
      target: {
        files: {
          'build/build.min.css': ['src/css/<%= pkg.name %>.css']
        }
      }
    },
    htmlmin: {                                     // Task
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: {                                   // Dictionary of files
          'build/build.min.html': 'src/html/<%= pkg.name %>.html',     // 'destination': 'source'
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> by: <%= pkg.author %>. Built on <%= grunt.template.today("mm-dd-yyyy") %> */'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js'],
          'versions/<%= pkg.version %>/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js'],
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        },

      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'generatedHTML',
              replacement: '<%= grunt.file.read("build/build.min.html") %>'
            },
            {
              match: 'generatedCss',
              replacement: '<%= grunt.file.read("build/build.min.css") %>'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['build/<%= pkg.name %>.js'], dest: 'dist/' }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-replace');

  grunt.registerTask('default', ['jshint',
    'concat',
    'cssmin',
    'htmlmin',
    'replace',
    'uglify'
  ]);
};