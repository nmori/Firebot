/*
grunt copy
    - Removes previous resource copies
    - Copies resources into /dist/pack/{platform}/resources/
*/

'use strict';
const fs = require('fs');
const path = require('path');

function remFiles(scope) {
    const dir = path.join(__dirname, `../dist/pack/Firebot-${scope}-x64/resources/`);

    fs.rmSync(path.join(dir, './overlay/'), { recursive: true, force: true });
    fs.rmSync(path.join(dir, './overlay.html'), { recursive: true, force: true });
    fs.rmSync(path.join(dir, './firebot-setup-file-icon.ico'), { recursive: true, force: true });
    fs.rmSync(path.join(dir, './kbm-java/'), { recursive: true, force: true });
    fs.rmSync(path.join(dir, './ffmpeg/'), { recursive: true, force: true });
}

module.exports = function (grunt) {
    grunt.config.merge({
        xcopy: {

            src: {
                files: [
                    {
                        expand: true,
                        dest: 'build/',
                        cwd: 'src/',
                        src: [
                            '**',
                            '!secrets.template.json',
                            '!**/*.ts',
                            '!**/*.js',
                            '**/*.min.js',
                            '!**/*.scss'
                        ],
                        filter: 'isFile'
                    }
                ]
            },

            win64: {
                files: [
                    {
                        expand: true,
                        dest: 'dist/pack/Firebot-win32-x64/resources/',
                        cwd: 'build/resources/',
                        src: ['**'],
                        filter: 'isFile'
                    }
                ]
            },
            darwin: {
                files: [
                    {
                        expand: true,
                        dest: 'dist/pack/Firebot-darwin-x64/Firebot.app/Contents/Resources/resources/',
                        cwd: 'build/resources/',
                        src: ['**'],
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        dest: 'dist/pack/Firebot-darwin-arm64/Firebot.app/Contents/Resources/resources/',
                        cwd: 'build/resources/',
                        src: ['**'],
                        filter: 'isFile'
                    }
                ]
            },

            linux: {
                files: [
                    {
                        expand: true,
                        dest: 'dist/pack/Firebot-linux-x64/resources/',
                        cwd: 'build/resources/',
                        src: ['**'],
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.task.renameTask('copy', 'xcopy');

    grunt.registerTask('copy', function () {
        const platform = grunt.config.get('platform');
        remFiles(platform);

        // Create version file for Linux (required by electron-installer-debian)
        if (platform === 'linux') {
            const electronPkg = require('../node_modules/electron/package.json');
            const packDir = path.join(__dirname, '../dist/pack/Firebot-linux-x64');
            const resourcesDir = path.join(packDir, 'resources');
            const appDir = path.join(resourcesDir, 'app');
            const versionPath = path.join(packDir, 'version');

            // Ensure directories exist
            try {
                fs.mkdirSync(appDir, { recursive: true });

                // Copy package.json to resources/app (required by electron-installer-debian)
                const packageJsonSrc = path.join(__dirname, '../package.json');
                const packageJsonDest = path.join(appDir, 'package.json');
                if (!fs.existsSync(packageJsonDest)) {
                    fs.copyFileSync(packageJsonSrc, packageJsonDest);
                    grunt.log.ok(`Copied package.json to ${packageJsonDest}`);
                }

                // Create version file
                fs.writeFileSync(versionPath, electronPkg.version, 'utf8');
                grunt.log.ok(`Created version file: ${versionPath}`);
            } catch (err) {
                grunt.log.warn(`Failed to setup Linux build: ${err.message}`);
            }
        }

        grunt.task.run(`xcopy:${platform}`);
    });

    grunt.registerTask('copysrc', function() {
        grunt.task.run('xcopy:src');
    });
};