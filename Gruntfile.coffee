module.exports = (grunt) ->

  # Project configuration
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    coffee:
      build:
        options:
          bare: true
          
        files:
          'build/jquery.monitorize.js': ['src/jquery.monitorize.coffee']

    uglify:
      build:
        options:
          compress: false
          beautify: true
          mangle: false
          preserveComments: true
        
        files: 
          'build/jquery.monitorize.js': ['build/jquery.monitorize.js']
      
      deploy:
        options:
          # banner: banner
          compress:
            drop_console: true

        files:
          'dist/jquery.monitorize.min.js': ['build/jquery.monitorize.js']

    watch:
      config:
        files: ["Gruntfile.coffee"]
        tasks: ["default"]
        options:
          reload: true

      scripts:
        files: ["src/jquery.monitorize.coffee"]
        tasks: ["default"]

  # Load tasks
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-uglify"

  # Default task(s).
  grunt.registerTask "default", ["coffee", "uglify:build"]
  grunt.registerTask "deploy", ["default", "uglify:deploy"]
