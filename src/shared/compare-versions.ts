/*
* This compares two semvers and determines the type of update between them, if there is one
*
* Supported semvers:
* - 1.0.0
* - 1.0   (patch version is assumed as 0)
* - 1     (minor and patch are assumed as 0)
*
* - Any leading "v"'s are ignored (ie v1.0.0 is valid)
* - Any variation can also have a prelease tag. They can be written as:
*     - 1.0.0-beta   (No version number after prereleaseTag is assumed as 1)
*     - 1.0.0-beta2
*     - 1.0.0-beta.3
*
* - Build metadata is ignored for comparison. These are also valid:
*     - 1.0.0+1
*     - 1.0.0-beta.3+local
*/
enum UpdateType {
    NONE = "none",
    PREVIOUS_VERSION = "previousversion", // 1.0.0 -> 1.1.0-beta,
    PRERELEASE = "prerelease", // 1.0.0 -> 1.1.0-beta
    OFFICIAL = "official", // 1.0.0-beta -> 1.0.0
    PATCH = "patch", // 1.0.0 -> 1.0.1
    MINOR = "minor", // 1.0.0 -> 1.1.0
    MAJOR = "major", // 1.0.0 -> 2.0.0,
    MAJOR_PRERELEASE = "majorprerelease" // 1.0.0 -> 2.0.0-beta
}

interface VersionInfo {
    major: number;
    minor?: number;
    patch?: number;
    prereleaseTag?: string;
    prereleaseVersion?: number;
    nightlyVersion?: string;
}

function isDigitsOnly(value: string): boolean {
    return value.length > 0 && value.split("").every((ch) => ch >= "0" && ch <= "9");
}

function isLettersOnly(value: string): boolean {
    return value.length > 0 && value.split("").every((ch) => {
        const lower = ch.toLowerCase();
        return lower >= "a" && lower <= "z";
    });
}

function isValidMetadata(value: string): boolean {
    if (value.length < 1) {
        return false;
    }

    return value.split("").every((ch) => {
        const lower = ch.toLowerCase();
        const isDigit = ch >= "0" && ch <= "9";
        const isLetter = lower >= "a" && lower <= "z";
        return isDigit || isLetter || ch === "." || ch === "-";
    });
}

function parsePrerelease(prerelease: string): Pick<VersionInfo, "prereleaseTag" | "prereleaseVersion" | "nightlyVersion"> {
    const dotIndex = prerelease.indexOf(".");
    const tagWithVersion = dotIndex > -1 ? prerelease.slice(0, dotIndex) : prerelease;
    const nightlyVersion = dotIndex > -1 ? prerelease.slice(dotIndex + 1) : "";

    if (nightlyVersion !== "") {
        const parts = nightlyVersion.split(".");
        if (!parts.every(isDigitsOnly)) {
            throw new Error("Invalid argument not valid semver");
        }
    }

    let splitIndex = 0;
    while (splitIndex < tagWithVersion.length && isLettersOnly(tagWithVersion[splitIndex])) {
        splitIndex += 1;
    }

    const prereleaseTag = tagWithVersion.slice(0, splitIndex);
    const prereleaseVersionText = tagWithVersion.slice(splitIndex);

    if (!isLettersOnly(prereleaseTag)) {
        throw new Error("Invalid argument not valid semver");
    }

    if (prereleaseVersionText !== "" && !isDigitsOnly(prereleaseVersionText)) {
        throw new Error("Invalid argument not valid semver");
    }

    return {
        prereleaseTag,
        prereleaseVersion: prereleaseVersionText === "" ? 1 : Number.parseInt(prereleaseVersionText, 10),
        nightlyVersion
    };
}

function validate(version: string): void {
    if (typeof version !== "string") {
        throw new TypeError("Invalid argument expected string");
    }

    parseVersion(version);
}

function normalizeVersion(version: string): string {
    return version.split("+")[0];
}

function parseVersion(version: string): VersionInfo {
    const normalizedVersion = normalizeVersion(version).toLowerCase();
    const trimmedVersion = normalizedVersion.startsWith("v") ? normalizedVersion.slice(1) : normalizedVersion;

    const plusIndex = trimmedVersion.indexOf("+");
    const coreAndPrerelease = plusIndex > -1 ? trimmedVersion.slice(0, plusIndex) : trimmedVersion;
    const metadata = plusIndex > -1 ? trimmedVersion.slice(plusIndex + 1) : "";

    if (metadata !== "" && !isValidMetadata(metadata)) {
        throw new Error("Invalid argument not valid semver");
    }

    const dashIndex = coreAndPrerelease.indexOf("-");
    const core = dashIndex > -1 ? coreAndPrerelease.slice(0, dashIndex) : coreAndPrerelease;
    const prerelease = dashIndex > -1 ? coreAndPrerelease.slice(dashIndex + 1) : "";

    const coreParts = core.split(".");
    if (coreParts.length < 1 || coreParts.length > 3 || !coreParts.every(isDigitsOnly)) {
        throw new Error("Invalid argument not valid semver");
    }

    const prereleaseInfo = prerelease === ""
        ? { prereleaseTag: "", prereleaseVersion: 1, nightlyVersion: "" }
        : parsePrerelease(prerelease);

    return {
        major: Number.parseInt(coreParts[0], 10),
        minor: coreParts[1] != null ? Number.parseInt(coreParts[1], 10) : 0,
        patch: coreParts[2] != null ? Number.parseInt(coreParts[2], 10) : 0,
        prereleaseTag: prereleaseInfo.prereleaseTag,
        prereleaseVersion: prereleaseInfo.prereleaseVersion,
        nightlyVersion: prereleaseInfo.nightlyVersion
    };
}

function compareVersions(newVersion: string, currentVersion: string): UpdateType {
    [newVersion, currentVersion].forEach(validate);

    newVersion = normalizeVersion(newVersion);
    currentVersion = normalizeVersion(currentVersion);

    let updateType = UpdateType.NONE;

    const pNewVersion = parseVersion(newVersion.toLowerCase());
    const pCurrentVersion = parseVersion(currentVersion.toLowerCase());

    const majorsAreEqual = pNewVersion.major === pCurrentVersion.major;
    const minorsAreEqual = pNewVersion.minor === pCurrentVersion.minor;
    const patchesAreEqual = pNewVersion.patch === pCurrentVersion.patch;

    // check if previous version
    if (pNewVersion.major < pCurrentVersion.major ||
        (majorsAreEqual && pNewVersion.minor < pCurrentVersion.minor) ||
        (majorsAreEqual && minorsAreEqual && pNewVersion.patch < pCurrentVersion.patch)) {
        return UpdateType.PREVIOUS_VERSION;
    }

    // Check if the new version has a greater major version
    // x.0.0
    if (pNewVersion.major > pCurrentVersion.major) {
        updateType = UpdateType.MAJOR;

    // then check the minor version
    // 1.x.0
    } else if (majorsAreEqual && pNewVersion.minor > pCurrentVersion.minor) {
        updateType = UpdateType.MINOR;

    // then check the patch(bugfix) version
    // 1.0.x
    } else if (majorsAreEqual && minorsAreEqual && pNewVersion.patch > pCurrentVersion.patch) {
        updateType = UpdateType.PATCH;
    }

    // See if the new version is also a prelease
    if (pNewVersion.prereleaseTag !== "") {
        /*We consider a new version to be a prerelease update if one of the follow condiditions is met:
        * a) the new version has a greater major, minor, or patch version. IE: 1.0.0 -> 1.0.1-beta
        * b) the new version has the same major, minor, or patch version, but a greater prerelease version
        *    IE: 1.0.0-beta2 -> 1.0.0-beta3
        */

        // NOTE(ebiggz): Right now we just validate that both the old and new versions have prerelaseTags.
        // But if we ever decide to do alphas as well as betas, we will also want to order the old and new
        // prerelaseTags alphabetically and validate that so 'alpha3' isnt considered an update to 'beta2'.
        if (updateType !== UpdateType.NONE || (pCurrentVersion.prereleaseTag !== "" &&
            majorsAreEqual &&
            minorsAreEqual &&
            patchesAreEqual &&
            pNewVersion.prereleaseVersion > pCurrentVersion.prereleaseVersion)) {

            if (majorsAreEqual) {
                updateType = UpdateType.PRERELEASE;
            } else {
                updateType = UpdateType.MAJOR_PRERELEASE;
            }
        }

    // If both versions are the same but the current version has a prelease tag and the new one doesn't,
    // we consider the new version an official release of the current.(IE 1.0.0-beta -> 1.0.0)
    } else if (majorsAreEqual && minorsAreEqual && patchesAreEqual && pCurrentVersion.prereleaseTag !== "") {
        updateType = UpdateType.OFFICIAL;
    }

    return updateType;
}

exports.UpdateType = UpdateType;
exports.compareVersions = compareVersions;