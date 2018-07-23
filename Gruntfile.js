module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'client/', src: ['**'], dest: 'dist/'},
                    {expand: true, cwd: 'libs/', src: ['**'], dest: 'dist/libs/'}
                ]
            }
        },
        
        clean: {
            build: {
                src: ['dist/*']
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('build', ['clean', 'copy']);

};