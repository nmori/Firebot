/*
grunt pack
    Removes the /dist/pack/ directory
    Runs electron packager for the current platform
    Copies Resources into /dist/pack/{platform}/resources/
*/
'use strict';

const formatIgnoreList = (ignoreList) => {
    return ignoreList.map((item) => {
        if (item.dotfiles) {
            return '--ignore="^[\\\\\\/]?\\.[^\\\\\\/]+$"';
        }
        if (item.dotdirs) {
            return '--ignore="^[\\\\\\/]?\\.[^\\\\\\/]+[\\\\\\/]"';
        }

        if (item.path == null) {
            throw new Error('invalid ignore path');
        }

        const escapedPath = item.path.replace(/[()[\]{}.?+*\\/^$]/g, char => (`\\${char}`));

        return `--ignore="^[\\\\\\/]?${escapedPath}${item.isFile ? '$"' : '(?:$|[\\\\\\/])"'}`;
    });
};

module.exports = function (grunt) {
    const { version } = grunt.file.readJSON('./node_modules/electron/package.json');

    const ignoreList = [
        { dotfiles: true },
        { dotdirs: true },
        { path: 'build/resources' },
        { path: 'dist' },
        { path: 'doc' },
        { path: 'docs' },
        { path: 'grunt' },
        { path: 'profiles' },
        { path: 'src' },
        { path: 'Gruntfile.js', isFile: true },
        { path: 'package.lock', isFile: true },
        { path: 'README.md', isFile: true },
        { path: 'secrets.gpg', isFile: true },
        { path: 'tsconfig.json', isFile: true }
    ];

    let ignoreFlags;
    try {
        ignoreFlags = formatIgnoreList(ignoreList);
    } catch (err) {
        grunt.fail.fatal(err);
        return;
    }

    const flags = [
        '--out="./dist/pack"',
        '--arch=x64',
        `--electronVersion=${version}`,
        '--asar',
        '--prune',
        '--overwrite',
        '--version-string.ProductName="Firebot v5"',
        '--executable-name="Firebot v5"',
        '--icon="./build/gui/images/icon_transparent.ico"',
        '--protocol=firebot',
        '--protocol-name="Firebot"',
        ...ignoreFlags
    ].join(' ');

    const appPackageJson = grunt.file.readJSON('./package.json');

    // electron-packager doesn't like prerelease tags with dots in them for the Windows target
    // see: https://github.com/electron/packager/issues/1714
    const [appVersion, prereleaseTag] = appPackageJson.version.split('-');
    const windowsAppVersion = appVersion + (prereleaseTag ? `-${prereleaseTag.replace(/\./g, '')}` : '');

    grunt.config.merge({
        shell: {
            // macOS stays on grunt-shell: its multi-arch + --extend-info / --extra-resource flags
            // pack correctly on the macOS runner (the .app is then ad-hoc signed in fix-macos-symlinks).
            packdarwin: {
                command: `npx --no-install @electron/packager . Firebot --platform=darwin ${flags.replace('--arch=x64', '')} --arch=x64 --arch=arm64 --extend-info="extra.plist" --extra-resource="./src/resources/firebot-setup-file-icon.icns"`
            }
        }
    });

    // Windows and Linux are packaged via the @electron/packager Node API instead of a grunt-shell
    // command string. Handing a command string to a shell made packaging depend on how the CI
    // runner's shell (cmd.exe on Windows, /bin/sh on Linux) tokenizes the backslash-heavy --ignore
    // regexes and quoted flags. On the runners this silently produced an incomplete pack (no asar /
    // no app / no binary) while exiting 0 — surfacing later as "could not find the Electron app
    // binary" (Linux) or a missing resources/app/package.json (Windows). The API takes real values
    // (RegExp ignores, plain strings) so there is no shell quoting to misparse, and any packaging
    // error throws instead of being swallowed.
    // electron-packager tests ignores against POSIX, leading-slash paths (see copy-filter.js),
    // so these regexes use forward slashes.
    const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const buildIgnoreRegexes = list => list.map((item) => {
        if (item.dotfiles) {
            return /^\/?\.[^/]+$/;
        }
        if (item.dotdirs) {
            return /^\/?\.[^/]+\//;
        }
        if (item.path == null) {
            throw new Error('invalid ignore path');
        }
        const escaped = escapeRegex(item.path);
        return new RegExp(item.isFile ? `^/?${escaped}$` : `^/?${escaped}(?:$|/)`);
    });

    const basePackagerOpts = {
        dir: '.',
        name: 'Firebot',
        out: './dist/pack',
        electronVersion: version,
        overwrite: true,
        prune: true,
        icon: './build/gui/images/icon_transparent.ico',
        protocols: [{ schemes: ['firebot'], name: 'Firebot' }],
        ignore: buildIgnoreRegexes(ignoreList)
    };

    const runPackager = (done, opts) => {
        const { packager } = require('@electron/packager');
        // Keep the Node event loop alive until packaging settles. On the Windows and Linux CI
        // runners the grunt process was exiting 0 immediately after "Packaging app for platform
        // ..." with the packager promise still pending — no "Packaged app to:", no error, and the
        // pack dir left empty (so create-windows-installer found no app.asar and the Linux
        // installers found no binary). That is the classic symptom of the event loop draining
        // while only a Promise (not an active libuv handle) is outstanding: a pending Promise does
        // not, by itself, keep Node running. An interval is an active handle that prevents the
        // premature exit; it is cleared as soon as packaging resolves or rejects.
        const keepAlive = setInterval(() => {}, 60000);
        packager(opts)
            .then((appPaths) => {
                clearInterval(keepAlive);
                grunt.log.ok(`Packaged app to: ${appPaths.join(', ')}`);
                done();
            })
            .catch((err) => {
                clearInterval(keepAlive);
                grunt.log.error(err.stack || String(err));
                done(err);
            });
    };

    grunt.registerTask('packwin64', 'Package the Windows app via the @electron/packager Node API', function () {
        runPackager(this.async(), {
            ...basePackagerOpts,
            platform: 'win32',
            arch: 'x64',
            asar: true,
            executableName: 'Firebot v5',
            // Squirrel/electron-packager rejects prerelease tags containing dots on Windows.
            appVersion: windowsAppVersion,
            win32metadata: { ProductName: 'Firebot v5' }
        });
    });

    grunt.registerTask('packlinux', 'Package the Linux app via the @electron/packager Node API', function () {
        // Linux executable names can't have spaces, so use "firebot" (electron-installer-debian
        // looks for this exact name). No asar: electron-installer-debian can't read asar archives.
        runPackager(this.async(), {
            ...basePackagerOpts,
            platform: 'linux',
            arch: 'x64',
            executableName: 'firebot'
        });
    });

    const platform = grunt.config.get('platform');
    const apiPackTasks = { win64: 'packwin64', linux: 'packlinux' };
    const packTask = apiPackTasks[platform] || `shell:pack${platform}`;
    grunt.registerTask('pack', ['cleanup:pack', packTask, 'copy']);
};