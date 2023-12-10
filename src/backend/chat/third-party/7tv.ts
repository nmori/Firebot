import { ThirdPartyEmote, ThirdPartyEmoteProvider } from "./third-party-emote-provider";

type SevenTVEmotesResponse = Array<{
    name: string;
    urls: Array<[string, string]>;
    mime: string;
}>;

export class SevenTVEmoteProvider extends ThirdPartyEmoteProvider<SevenTVEmotesResponse> {
    providerName = "7TV";

    globalEmoteUrl = "https://7tv.io/v3/emotes/global";
    getChannelEmotesUrl(streamerUserId: number): string {
        return `https://7tv.io/v3/users/${streamerUserId}/emotes`;
    }

    private emoteMapper(response: SevenTVEmotesResponse): ThirdPartyEmote[] {
        return response.map(e => ({
            url: e.urls[0][1],
            code: e.name,
            animated: e.mime && e.mime.toLowerCase() === "image/gif",
            origin: this.providerName
        }));
    }

    globalEmotesMapper = this.emoteMapper;
    channelEmotesMapper = this.emoteMapper;
}