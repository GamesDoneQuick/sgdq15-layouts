module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            compile: {
                files: [
                    {expand: true, cwd: 'dashboard/src/', src: ['**/*.less'], dest: 'dashboard/', ext: '.css'}
                ]
            }
        },
        watch: {
            files: ['dashboard/src/**/*.less'],
            tasks: ['less']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less']);
};
