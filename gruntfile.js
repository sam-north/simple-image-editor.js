module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildVariables: {
      name: '<%= pkg.name %>-<%= pkg.version %>'
    },
    concat: {
      buildJs: {
        src: ['src/**/*.js'],
        dest: 'build/<%= pkg.name %>.js',
      },
      buildCss: {
        src: ['src/**/*.css'],
        dest: 'build/<%= pkg.name %>.css',
      },
    },
    cssmin: {
      target: {
        files: {
          'build/template.min.css': ['<%= concat.buildCss.dest %>']
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
          'build/template.html': 'src/html/template.html',     // 'destination': 'source'
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> by: <%= pkg.author %>. Built on <%= grunt.template.today("mm-dd-yyyy") %> */'
      },
      dist: {
        files: {
          'dist/<%= buildVariables.name %>.min.js': ['dist/<%= pkg.name %>.js'],
          // 'versions/<%= pkg.version %>/<%= buildVariables.name %>.min.js': ['<%= concat.versionHistoryJs.dest %>'],
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
              replacement: '<%= grunt.file.read("build/template.html") %>'
            },
            {
              match: 'generatedCss',
              replacement: '<%= grunt.file.read("build/template.min.css") %>'
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