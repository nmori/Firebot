/*
grunt fix-macos-symlinks
    Inspects and fixes absolute symlinks in macOS .app bundles
    Converts absolute paths (from build environment) to relative paths
    Runs after pack and before compile for darwin platform
*/
'use strict';

const path = require('path');
const fsp = require('fs/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

module.exports = function (grunt) {
    grunt.registerMultiTask('fix-macos-symlinks', 'Fix absolute symlinks in macOS .app bundles', function () {
        this.requiresConfig(`${this.name}.${this.target}.appPath`);
        const config = grunt.config(`${this.name}.${this.target}`);
        const done = this.async();

        const fixSymlinks = async () => {
            const appPath = config.appPath;
            const frameworksPath = path.join(appPath, 'Contents/Frameworks');

            try {
                // Find all symlinks in Frameworks directory
                const { stdout } = await execFileAsync('find', [frameworksPath, '-type', 'l']);
                const symlinks = stdout.trim().split('\n').filter(Boolean);

                let fixedCount = 0;

                for (const link of symlinks) {
                    const target = await fsp.readlink(link);

                    // Check if symlink is absolute and starts with build machine path
                    if (target.startsWith('/Users/runner/work/')) {
                        // Extract relative path (everything after Firebot.app/)
                        const appIndex = target.indexOf('Firebot.app/');
                        if (appIndex !== -1) {
                            const newTarget = target.substring(appIndex + 'Firebot.app/'.length);

                            if (newTarget && !newTarget.startsWith('/')) {
                                // Remove old symlink and create new one with relative path
                                await fsp.unlink(link);
                                await fsp.symlink(newTarget, link);
                                grunt.log.writeln(`✓ Fixed symlink: ${path.basename(link)}`);
                                grunt.log.writeln(`  → ${newTarget}`);
                                fixedCount++;
                            }
                        }
                    }
                }

                if (fixedCount > 0) {
                    grunt.log.ok(`Fixed ${fixedCount} absolute symlink(s) in ${appPath}`);
                } else {
                    grunt.log.ok(`All symlinks are relative in ${appPath}`);
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    grunt.log.warn(`App bundle not found at ${config.appPath} - skipping symlink fix`);
                } else {
                    grunt.fail.warn(`Failed to fix symlinks: ${error.message}`);
                }
            }
        };

        fixSymlinks().then(done, done);
    });

    grunt.config.merge({
        'fix-macos-symlinks': {
            x64: { appPath: path.resolve(__dirname, '../dist/pack/Firebot-darwin-x64/Firebot.app') },
            arm64: { appPath: path.resolve(__dirname, '../dist/pack/Firebot-darwin-arm64/Firebot.app') }
        }
    });

    grunt.registerTask('fix-macos', ['fix-macos-symlinks:x64', 'fix-macos-symlinks:arm64']);
};
