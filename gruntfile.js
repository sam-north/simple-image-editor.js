module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      config: {
        name: '<%= pkg.name %>-<%= pkg.version %>'
      },
      productionJs: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= concat.config.name %>.js',
      },
      versionHistoryJs: {
        src: '<%= concat.productionJs.src %>',
        dest: 'versions/<%= pkg.version %>/<%= concat.config.name %>.js',
      },
      productionCss: {
        src: ['src/**/*.css'],
        dest: 'dist/<%= concat.config.name %>.css',
      },
      versionHistoryCss: {
        src: '<%= concat.productionCss.src %>',
        dest: 'versions/<%= pkg.version %>/<%= concat.config.name %>.css',
      },
    },
    cssmin: {
      target: {
        files: {
          'dist/<%= concat.config.name %>.min.css': ['<%= concat.productionCss.dest %>'],
          'versions/<%= pkg.version %>/<%= concat.config.name %>.min.css': ['<%= concat.versionHistoryCss.dest %>']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> by: <%= pkg.author %>. Built on <%= grunt.template.today("mm-dd-yyyy") %> */'
      },
      dist: {
        files: {
          'dist/<%= concat.config.name %>.min.js': ['<%= concat.productionJs.dest %>'],
          'versions/<%= pkg.version %>/<%= concat.config.name %>.min.js': ['<%= concat.versionHistoryJs.dest %>'],
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']);
};