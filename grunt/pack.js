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
        {dotfiles: true},
        {dotdirs: true},
        {path: 'build/resources'},
        {path: 'dist'},
        {path: 'doc'},
        {path: 'docs'},
        {path: 'grunt'},
        {path: 'profiles'},
        {path: 'src'},
        {path: 'Gruntfile.js', isFile: true},
        {path: 'package.lock', isFile: true},
        {path: 'README.md', isFile: true},
        {path: 'secrets.gpg', isFile: true},
        {path: 'tsconfig.json', isFile: true}
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
            packwin64: {
                command: `npx --no-install @electron/packager . Firebot --platform=win32 ${flags} --app-version=${windowsAppVersion}`
            },
            packdarwin: {
                command: `npx --no-install @electron/packager . Firebot --platform=darwin ${flags.replace('--arch=x64', '')} --arch=x64 --arch=arm64 --extend-info="extra.plist" --extra-resource="./src/resources/firebot-setup-file-icon.icns"`
            }
        }
    });

    // Linux is packaged via the @electron/packager Node API rather than a grunt-shell command.
    // The Windows runner (cmd.exe) and the Linux CI runner (/bin/sh) tokenize the backslash-heavy
    // --ignore / --executable-name flags differently, which left the Linux pack dir nearly empty on
    // CI (no app, no binary) while exiting 0 — the "could not find the Electron app binary" error
    // downstream. The API takes real values (RegExp ignores, plain strings) so there is no shell
    // quoting to misparse, and any packaging error throws instead of being swallowed.
    // electron-packager always tests ignores against POSIX, leading-slash paths (see copy-filter.js),
    // so these regexes use forward slashes.
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const buildIgnoreRegexes = (list) => list.map((item) => {
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

    grunt.registerTask('packlinux', 'Package the Linux app via the @electron/packager Node API', function () {
        const done = this.async();
        const { packager } = require('@electron/packager');
        // Linux executable names can't have spaces, so use "firebot" (electron-installer-debian
        // looks for this exact name). No --asar: electron-installer-debian can't read asar archives.
        packager({
            dir: '.',
            name: 'Firebot',
            platform: 'linux',
            arch: 'x64',
            out: './dist/pack',
            electronVersion: version,
            overwrite: true,
            prune: true,
            executableName: 'firebot',
            icon: './build/gui/images/icon_transparent.ico',
            protocols: [{ schemes: ['firebot'], name: 'Firebot' }],
            ignore: buildIgnoreRegexes(ignoreList)
        }).then((appPaths) => {
            grunt.log.ok(`Packaged Linux app to: ${appPaths.join(', ')}`);
            done();
        }).catch((err) => {
            grunt.log.error(err.stack || String(err));
            done(err);
        });
    });

    const platform = grunt.config.get('platform');
    const packTask = platform === 'linux' ? 'packlinux' : `shell:pack${platform}`;
    grunt.registerTask('pack', ['cleanup:pack', packTask, 'copy']);
};