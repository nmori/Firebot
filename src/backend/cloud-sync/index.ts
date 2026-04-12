import frontendCommunicator from "../common/frontend-communicator";
import logger from "../logwrapper";

interface ProfileSyncData {
    username: string;
    userRoles: string[];
    profilePage: "commands" | "quotes";
}

export async function sync<T = unknown>(_jsonData: T): Promise<string> {
    logger.warn("Cloud sync (DataBin) is not available in this fork.");
    return null;
}

export async function getData<T = unknown>(_shareCode: string): Promise<T> {
    logger.warn("Cloud sync (DataBin) is not available in this fork.");
    return null;
}

export async function syncProfileData(_profileSyncData: ProfileSyncData): Promise<string> {
    logger.warn("Profile data sync is not available in this fork.");
    return null;
}

frontendCommunicator.onAsync("sync-profile-data-to-crowbar-api", () => {
    return syncProfileData({
        username: undefined,
        userRoles: [],
        profilePage: "commands"
    });
});