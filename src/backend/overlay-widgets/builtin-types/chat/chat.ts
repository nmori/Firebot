import type {
    FirebotChatMessage,
    OverlayWidgetType,
    IOverlayWidgetEventUtils,
    WidgetOverlayEvent,
    FontOptions,
    Animation
} from "../../../../types";

import { livePreviewChatMessages } from "./chat-widget-shared";

export type ChatWidgetSettings = {
    showTimestamps: boolean;
    showAvatars: boolean;
    showBadges: boolean;
    showPronouns: boolean;
    showSharedChatMessages: boolean;
    sharedChatInfoStyle?: "none" | "avatar" | "banner";
    showAnnouncements: boolean;
    delayMessages: boolean;
    messageDelay?: number;
    newMessageEntryAnimation: Animation;
    autoRemoveMessages: boolean;
    messageTimeout?: number;
    messageExitAnimation?: Animation;
    messageStyle: "compact" | "modern";
    chatOrder: "normal" | "reversed";
    actionDisplayFormat: "modern" | "classic";
    highlightStyle: "normal" | "highlighted";
    highlightColor?: string;
    thirdPartyEmotes: string[];
    hiddenUsers: string[];
    horizontalAlignment: "left" | "right";
    verticalAlignment: "top" | "bottom";
    spaceBetweenMessages: number;
    usernameFontOptions: FontOptions;
    messageFontOptions: FontOptions;
};

export type ChatWidgetState = {
    chatMessages: Array<FirebotChatMessage>;
};

export type ChatMessageMessageData = {
    chatMessage: FirebotChatMessage;
};

export type DeleteMessageMessageData = {
    messageId: string;
    animate: boolean;
};

export type DeleteUserMessagesMessageData = {
    username: string;
};

export const chat: OverlayWidgetType<ChatWidgetSettings, ChatWidgetState> = {
    id: "firebot:chat",
    name: "チャット",
    description: "オーバーレイ用の基本的なチャットフィードです",
    icon: "fa fa-comments-alt",
    userCanConfigure: {
        entryAnimation: false,
        exitAnimation: false
    },
    settingsSchema: [
        {
            name: "showTimestamps",
            title: "タイムスタンプを表示",
            type: "boolean",
            default: false
        },
        {
            name: "showAvatars",
            title: "視聴者のアバターを表示",
            type: "boolean",
            default: true
        },
        {
            name: "showBadges",
            title: "チャットバッジを表示",
            description: "ユーザー名の横にチャットバッジ（サブスク、Bits のティアなど）を表示します",
            type: "boolean",
            default: true
        },
        {
            name: "showPronouns",
            title: "代名詞を表示",
            description: "チャット参加者の代名詞を表示します（[https://pr.alejo.io/](https://pr.alejo.io/) により提供）",
            type: "boolean",
            default: false
        },
        {
            name: "showSharedChatMessages",
            title: "共有チャットのメッセージを表示",
            description: "共有チャットセッション中に他のチャンネルから送信されたチャットメッセージを表示します",
            type: "boolean",
            default: false
        },
        {
            name: "sharedChatInfoStyle",
            title: "共有チャット情報の表示スタイル",
            description: "共有チャットセッション中、チャットメッセージが送信されたチャンネルの情報を必要に応じて表示します",
            type: "radio-cards",
            default: "none",
            options: [
                {
                    value: "none",
                    label: "なし",
                    description: "共有チャットの送信元チャンネルに関する情報を表示しません",
                    iconClass: "fa-times"
                },
                {
                    value: "avatar",
                    label: "アバター",
                    description: "メッセージの横に送信元チャンネルのアバターを表示します",
                    iconClass: "fa-user-circle"
                },
                {
                    value: "banner",
                    label: "バナー",
                    description: `メッセージの上にバナーを表示します（例: 「Firebot のチャットから送信」）`,
                    iconClass: "fa-grip-lines"
                }
            ],
            settings: {
                gridColumns: 3
            },
            showIf: {
                showSharedChatMessages: true
            }
        },
        {
            name: "showAnnouncements",
            title: "アナウンスを表示",
            description: "配信者またはモデレーターが送信したチャットのアナウンスを表示します",
            type: "boolean",
            default: false
        },
        {
            name: "delayMessages",
            title: "メッセージに遅延を追加",
            description: "メッセージを受信してからウィジェットへ送信するまでに遅延を入れます。モデレーションに便利です。",
            type: "boolean",
            default: false
        },
        {
            name: "messageDelay",
            title: "メッセージの遅延（秒）",
            description: "チャットメッセージをウィジェットへ送信するまでの待ち時間（秒）です",
            type: "number",
            default: 0,
            showIf: {
                delayMessages: true
            }
        },
        {
            name: "newMessageEntryAnimation",
            title: "新着メッセージの登場アニメーション",
            description: "新しいメッセージが届いたときに使用するアニメーションです",
            type: "animation-select",
            animationType: "enter"
        },
        {
            name: "autoRemoveMessages",
            title: "メッセージを自動的に削除",
            description: "指定した時間が経過したメッセージをチャットウィジェットから削除します",
            type: "boolean",
            default: false
        },
        {
            name: "messageTimeout",
            title: "メッセージの表示時間（秒）",
            description: "チャットメッセージをウィジェットから自動的に削除するまでの時間（秒）です",
            type: "number",
            default: 10,
            showIf: {
                autoRemoveMessages: true
            }
        },
        {
            name: "messageExitAnimation",
            title: "メッセージの退場アニメーション",
            description: "メッセージがウィジェットから自動的に削除されるときに使用するアニメーションです",
            type: "animation-select",
            animationType: "exit",
            showIf: {
                autoRemoveMessages: true
            }
        },
        {
            name: "messageStyle",
            title: "メッセージのスタイル",
            type: "radio-cards",
            default: "compact",
            options: [
                {
                    value: "compact",
                    label: "コンパクト",
                    description: "ユーザー名とチャットメッセージを同じ行に表示します",
                    iconClass: "fa-horizontal-rule"
                },
                {
                    value: "modern",
                    label: "モダン（展開）",
                    description: "ユーザー名とチャットメッセージを別の行に表示します",
                    iconClass: "fa-line-height"
                }
            ]
        },
        {
            name: "chatOrder",
            title: "チャットの並び順",
            type: "radio-cards",
            default: "normal",
            options: [
                {
                    value: "normal",
                    label: "通常",
                    description: "新しいメッセージがチャットフィードの下に表示されます",
                    iconClass: "fa-sort-amount-down-alt"
                },
                {
                    value: "reversed",
                    label: "逆順",
                    description: "新しいメッセージがチャットフィードの上に表示されます",
                    iconClass: "fa-sort-amount-up"
                }
            ]
        },
        {
            name: "actionDisplayFormat",
            title: "アクションの表示形式",
            description: "`/me` アクションの表示に使用するスタイルです",
            type: "radio-cards",
            default: "modern",
            options: [
                {
                    value: "modern",
                    label: "モダン",
                    description: "現在の Twitch と同様に、アクションのテキストを通常のチャットメッセージと同じ色の斜体で表示します",
                    iconClass: "fa-italic"
                },
                {
                    value: "classic",
                    label: "クラシック",
                    description: "以前の Twitch と同様に、アクションのテキストをユーザー名と同じ色で、斜体にせず表示します",
                    iconClass: "fa-palette"
                }
            ]
        },
        {
            name: "highlightStyle",
            title: "ハイライトされたメッセージのスタイル",
            type: "radio-cards",
            default: "normal",
            options: [
                {
                    value: "normal",
                    label: "通常",
                    description: "ハイライトされたメッセージを通常のメッセージと同じ見た目で表示します",
                    iconClass: "fa-tint-slash"
                },
                {
                    value: "highlighted",
                    label: "ハイライト",
                    description: "Twitch の表示と同様に、ハイライトされたメッセージの背景色を変えて表示します",
                    iconClass: "fa-tint"
                }
            ]
        },
        {
            name: "highlightColor",
            title: "ハイライトされたメッセージの背景色",
            type: "hexcolor",
            default: "#755ebc",
            allowAlpha: true,
            validation: {
                required: true,
                pattern: "^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$"
            },
            showIf: {
                highlightStyle: "highlighted"
            }
        },
        {
            name: "thirdPartyEmotes",
            title: "有効にするサードパーティ製エモートサービス",
            description: "注意: ここで有効にしたサードパーティ製エモートサービスのエモートを表示するには、ダッシュボード設定でも同じサービスを有効にする必要があります。",
            type: "multiselect",
            default: [],
            settings: {
                options: [
                    {
                        id: "BTTV",
                        name: "BTTV"
                    },
                    {
                        id: "7TV",
                        name: "7TV"
                    },
                    {
                        id: "FFZ",
                        name: "FFZ"
                    }
                ]
            }
        },
        {
            name: "hiddenUsers",
            title: "非表示ユーザー",
            description: "チャットウィジェットにメッセージを表示しないユーザー名の一覧です",
            type: "editable-list",
            default: [],
            settings: {
                useTextArea: false,
                sortable: true,
                addLabel: "ユーザー名を追加",
                editLabel: "ユーザー名を編集",
                noneAddedText: "チャットウィジェットで非表示にしているユーザーはいません"
            }
        },
        {
            name: "horizontalAlignment",
            title: "水平揃え",
            description: "ウィジェット内のチャットメッセージの水平方向の揃えを指定します。",
            type: "radio-cards",
            default: "left",
            options: [{
                value: "left", label: "左", iconClass: "fa-align-left"
            }, {
                value: "right", label: "右", iconClass: "fa-align-right"
            }],
            settings: {
                gridColumns: 2
            }
        },
        {
            name: "verticalAlignment",
            title: "垂直揃え",
            description: "ウィジェット内のチャットメッセージの垂直方向の揃えを指定します。",
            type: "radio-cards",
            default: "top",
            options: [{
                value: "top", label: "上", iconClass: "fa-arrow-to-top"
            }, {
                value: "bottom", label: "下", iconClass: "fa-arrow-to-bottom"
            }],
            settings: {
                gridColumns: 2
            }
        },
        {
            name: "spaceBetweenMessages",
            title: "メッセージの間隔",
            description: "フィード内のメッセージ同士の間隔（ピクセル）です",
            type: "number",
            default: 5
        },
        {
            name: "usernameFontOptions",
            title: "ユーザー名のフォント設定",
            type: "font-options",
            default: {
                family: "Inter",
                weight: 700,
                size: 24,
                italic: false
            },
            allowAlpha: true,
            hideColor: true
        },
        {
            name: "messageFontOptions",
            title: "チャットメッセージのフォント設定",
            type: "font-options",
            default: {
                family: "Inter",
                weight: 400,
                size: 24,
                italic: false,
                color: "#FFFFFF"
            },
            allowAlpha: true
        }
    ],
    initialState: {
        chatMessages: []
    },
    supportsLivePreview: true,
    livePreviewState: {
        chatMessages: livePreviewChatMessages
    },
    uiActions: [
        {
            id: "clear",
            label: "チャットウィジェットをクリア",
            icon: "fa-minus-circle",
            click: () => {
                return {
                    newState: {
                        chatMessages: null
                    }
                };
            }
        }
    ],
    overlayExtension: {
        eventHandler: (event: WidgetOverlayEvent<ChatWidgetSettings, ChatWidgetState>, utils: IOverlayWidgetEventUtils) => {
            const generateAnnouncementBarStyle = (
                announcementColor: FirebotChatMessage["announcementColor"]
            ): Record<string, string> => {
                let announcementBackgroundColor: string;

                switch (announcementColor) {
                    case "BLUE":
                        announcementBackgroundColor = "linear-gradient(#00d6d6,#9146ff)";
                        break;

                    case "GREEN":
                        announcementBackgroundColor = "linear-gradient(#00db84,#57bee6)";
                        break;

                    case "ORANGE":
                        announcementBackgroundColor = "linear-gradient(#ffb31a,#e0e000)";
                        break;

                    case "PURPLE":
                        announcementBackgroundColor = "linear-gradient(#9146ff,#ff75e6)";
                        break;

                    default:
                        announcementBackgroundColor = "rgb(31, 105, 255)";
                        break;
                }

                const individualAnnouncementBarStyles: Record<string, string> = {
                    "background": announcementBackgroundColor
                };

                return individualAnnouncementBarStyles;
            };

            const generateChatMessageHtml = (
                chatMessage: FirebotChatMessage,
                config: typeof event["data"]["widgetConfig"]
            ): string | undefined => {
                // Ignore AutoModded messages that aren't approved
                if (chatMessage.autoModStatus === "pending"
                        || chatMessage.autoModStatus === "denied"
                        || chatMessage.autoModStatus === "expired") {
                    return;
                }

                // Check the ignore list
                if (config.settings.hiddenUsers?.some(u =>
                    u.toLowerCase() === chatMessage.username.toLowerCase() || u.toLowerCase() === chatMessage.userDisplayName?.toLowerCase()
                )) {
                    return;
                }

                // Don't render announcements unless we specifically want them
                if (chatMessage.isAnnouncement === true && config.settings.showAnnouncements !== true) {
                    return;
                }

                // Same with shared chat messages
                if (chatMessage.isSharedChatMessage === true && config.settings.showSharedChatMessages !== true) {
                    return;
                }

                const rootMessageElem = document.createElement("div");
                rootMessageElem.classList.add(`chat-message-root-container-${config.id}`);
                rootMessageElem.setAttribute("data-message-id", chatMessage.id);
                rootMessageElem.setAttribute("data-username", chatMessage.username);

                let messageHeaderText = "";

                const showSharedChatAvatar = config.settings.sharedChatInfoStyle === "avatar"
                    && chatMessage.sharedChatRoomProfilePicUrl;

                if (showSharedChatAvatar) {
                    const sharedChatAvatarContainerElem = document.createElement("div");

                    const sharedChatAvatarElem = document.createElement("img");
                    sharedChatAvatarElem.classList.add(`chat-avatar-${config.id}`);
                    sharedChatAvatarElem.src = chatMessage.sharedChatRoomProfilePicUrl!;

                    sharedChatAvatarContainerElem.appendChild(sharedChatAvatarElem);
                    rootMessageElem.appendChild(sharedChatAvatarContainerElem);
                }

                if (chatMessage.isAnnouncement === true) {
                    messageHeaderText = "アナウンス";

                    if (chatMessage.isSharedChatMessage && config.settings.sharedChatInfoStyle === "banner") {
                        messageHeaderText += `（${chatMessage.sharedChatRoomDisplayName} のチャットから送信）`;
                    }

                    const individualAnnouncementBarStyles = generateAnnouncementBarStyle(
                        chatMessage.announcementColor
                    );

                    const announcementBarElem = document.createElement("div");
                    announcementBarElem.classList.add(`chat-announcement-bar-${config.id}`);
                    announcementBarElem.setAttribute("style", utils.stylesToString(individualAnnouncementBarStyles));

                    rootMessageElem.appendChild(announcementBarElem);
                } else {
                    if (chatMessage.isSharedChatMessage && config.settings.sharedChatInfoStyle === "banner") {
                        messageHeaderText = `${chatMessage.sharedChatRoomDisplayName} のチャットから送信`;
                    }
                }

                const messageContainerElem = document.createElement("div");
                messageContainerElem.classList.add(`chat-message-container-${config.id}`);

                if (messageHeaderText.length > 0) {
                    const messageHeaderElem = document.createElement("div");
                    messageHeaderElem.classList.add(`chat-message-header-${config.id}`);
                    messageHeaderElem.innerText = messageHeaderText;

                    messageContainerElem.appendChild(messageHeaderElem);
                }

                const messageContentContainerElem = document.createElement("div");
                messageContentContainerElem.classList.add(`chat-message-content-container-${config.id}`);

                const messageInfoElem = document.createElement("span");

                let timestampString: string | undefined = undefined;
                if (config.settings.showTimestamps === true && chatMessage.timestamp) {
                    const timestampAsDate = new Date(chatMessage.timestamp);
                    const hours = timestampAsDate.getHours() % 12 === 0
                        ? "12"
                        : timestampAsDate.getHours() % 12;
                    const minutes = String(timestampAsDate.getMinutes()).padStart(2, "0");

                    timestampString = `[${hours}:${minutes}]`;
                }

                if (!!timestampString?.length && config.settings.messageStyle === "compact") {
                    const timestampSpan = document.createElement("span");
                    timestampSpan.classList.add(`chat-message-${config.id}`);
                    timestampSpan.innerText = `${timestampString} `;

                    messageInfoElem.appendChild(timestampSpan);
                }

                if (config.settings.showAvatars === true) {
                    const avatarElem = document.createElement("img");
                    avatarElem.classList.add(`chat-avatar-${config.id}`);
                    avatarElem.src = chatMessage.profilePicUrl!;
                    avatarElem.alt = "アバター";

                    messageInfoElem.appendChild(avatarElem);
                }

                if (config.settings.showBadges === true && !!chatMessage.badges?.length) {
                    const badgeContainerElem = document.createElement("span");
                    badgeContainerElem.classList.add(`chat-badge-container-${config.id}`);

                    for (const badge of chatMessage.badges) {
                        const badgeElem = document.createElement("img");
                        badgeElem.classList.add(`chat-badge-${config.id}`);
                        badgeElem.src = badge.url;
                        badgeElem.alt = badge.title;

                        badgeContainerElem.appendChild(badgeElem);
                    }

                    messageInfoElem.appendChild(badgeContainerElem);
                }

                if (config.settings.showPronouns === true && !!chatMessage.pronouns?.length) {
                    const pronounElem = document.createElement("span");
                    pronounElem.classList.add(`chat-pronouns-${config.id}`);
                    pronounElem.innerText = chatMessage.pronouns;

                    messageInfoElem.appendChild(pronounElem);
                }

                const individualUsernameStyles: Record<string, string> = {
                    "color": `${chatMessage.color}`
                };

                const usernameElem = document.createElement("span");
                usernameElem.classList.add(`chat-username-${config.id}`);
                usernameElem.setAttribute("style", utils.stylesToString(individualUsernameStyles));
                usernameElem.innerText = chatMessage.userDisplayName ?? chatMessage.username;

                messageInfoElem.appendChild(usernameElem);

                if (!!timestampString?.length && config.settings.messageStyle === "modern") {
                    const timestampSpan = document.createElement("span");
                    timestampSpan.classList.add(`chat-message-${config.id}`);
                    timestampSpan.innerText = ` ${timestampString}`;

                    messageInfoElem.appendChild(timestampSpan);
                }

                messageContentContainerElem.appendChild(messageInfoElem);

                const messageTextElem = document.createElement("span");
                messageTextElem.classList.add(`chat-message-${config.id}`);

                let messageText: string;

                if (chatMessage.action === true) {
                    const individualActionStyles: Record<string, string> = { };

                    if (config.settings.actionDisplayFormat === "classic") {
                        individualActionStyles["color"] = chatMessage.color!;
                    }

                    messageTextElem.classList.add(`chat-action-${config.id}`);
                    messageTextElem.setAttribute("style", utils.stylesToString(individualActionStyles));

                    messageText = config.settings.messageStyle === "modern" ? "" : " ";
                } else {
                    messageText = config.settings.messageStyle === "modern" ? "" : ": ";
                }

                if (!!messageText?.length) {
                    messageTextElem.innerText = messageText;
                }

                const innerMessageElem = document.createElement("span");
                if (chatMessage.isHighlighted === true && config.settings.highlightStyle === "highlighted") {
                    innerMessageElem.classList.add(`chat-highlighted-message-${config.id}`);
                }

                const chatMessagePartsHtml: Array<string> = [];

                for (const part of chatMessage.parts) {
                    switch (part.type) {
                        case "emote":
                            {
                                const emoteElem = document.createElement("img");
                                emoteElem.src = (part.animatedUrl ?? part.url)!;
                                emoteElem.alt = part.name!;

                                chatMessagePartsHtml.push(emoteElem.outerHTML);
                            }
                            break;

                        case "third-party-emote":
                            if (config.settings.thirdPartyEmotes.some(e => e === part.origin)) {
                                const emoteElem = document.createElement("img");
                                emoteElem.src = (part.animatedUrl ?? part.url)!;
                                emoteElem.alt = part.name!;

                                chatMessagePartsHtml.push(emoteElem.outerHTML);
                            } else {
                                chatMessagePartsHtml.push(part.name);
                            }
                            break;

                        case "cheermote":
                        case "cheer": // Back-compat with IRC chat
                            {
                                const cheermoteElem = document.createElement("img");
                                cheermoteElem.src = (part.animatedUrl ?? part.url)!;
                                cheermoteElem.alt = part.name!;

                                const cheerAmountElem = document.createElement("strong");
                                cheerAmountElem.style.color = part.color!;
                                cheerAmountElem.innerText = `${part.amount}`;

                                chatMessagePartsHtml.push(cheermoteElem.outerHTML);
                                chatMessagePartsHtml.push(cheerAmountElem.outerHTML);
                            }
                            break;

                        case "link":
                            {
                                const linkElem = document.createElement("a");
                                linkElem.href = part.url;
                                linkElem.innerText = part.text;
                                chatMessagePartsHtml.push(linkElem.outerHTML);
                            }
                            break;

                        default:
                            chatMessagePartsHtml.push(part.text);
                    }
                }

                innerMessageElem.innerHTML = chatMessagePartsHtml.join("");

                messageTextElem.appendChild(innerMessageElem);

                messageContentContainerElem.appendChild(messageTextElem);
                messageContainerElem.appendChild(messageContentContainerElem);

                rootMessageElem.appendChild(messageContainerElem);

                return rootMessageElem.outerHTML;
            };

            const generateWidgetHtml = (config: typeof event["data"]["widgetConfig"]) => {
                const usernameFontSize = (config.settings?.usernameFontOptions?.size ? `${config.settings.usernameFontOptions.size}px` : "12px");
                const messageFontSize = (config.settings?.messageFontOptions?.size ? `${config.settings.messageFontOptions.size}px` : "12px");

                let height = "auto";
                let maxHeight: string | undefined = "100%";
                let justifyContent = "end";
                let anchorToBottom = false;

                switch (config.settings.chatOrder) {
                    case "reversed":
                        switch (config.settings.verticalAlignment) {
                            case "bottom":
                                // Special snowflake
                                anchorToBottom = true;
                                height = "auto";
                                maxHeight = "100%";
                                justifyContent = "start";
                                break;

                            case "top":
                            default:
                                height = "auto";
                                maxHeight = undefined;
                                justifyContent = "start";
                                break;
                        }
                        break;

                    case "normal":
                    default:
                        switch (config.settings.verticalAlignment) {
                            case "bottom":
                                height = "100%";
                                maxHeight = "100%";
                                justifyContent = "end";
                                break;

                            case "top":
                            default:
                                // Use default values
                                break;
                        }
                        break;
                }

                const chatContainerStyles: Record<string, string> = {
                    "display": "flex",
                    "flex-direction": config.settings.chatOrder === "reversed" ? "column-reverse" : "column",
                    "align-items": config.settings.horizontalAlignment === "right" ? "end" : "start",
                    "justify-content": justifyContent,
                    "height": height,
                    "width": "100%",
                    "text-align": config.settings.horizontalAlignment
                };

                if (!!maxHeight?.length) {
                    chatContainerStyles["max-height"] = maxHeight;
                }

                if (anchorToBottom) {
                    chatContainerStyles["position"] = "absolute";
                    chatContainerStyles["bottom"] = "0";
                }

                const messageRootContainerStyles: Record<string, string> = {
                    "display": "flex",
                    "gap": "10px",
                    "flex-direction": config.settings.horizontalAlignment === "right"
                        ? "row-reverse"
                        : "row"
                };

                const announcementBarStyles: Record<string, string> = {
                    "width": "10px"
                };

                const announcementMessageContainerStyles: Record<string, string> = {
                    "display": "flex",
                    "flex-direction": "column"
                };

                const messageHeaderStyles: Record<string, string> = {
                    "font-family": (config.settings?.messageFontOptions?.family ? `"${config.settings?.messageFontOptions?.family}"` : "Inter, sans-serif"),
                    "font-size": `calc(${messageFontSize} * 0.75)`,
                    "font-weight": config.settings?.messageFontOptions?.weight?.toString() || "400",
                    "font-style": config.settings?.messageFontOptions?.italic ? "italic" : "normal",
                    "color": config.settings?.messageFontOptions?.color || "#FFFFFF",
                    "margin-bottom": "5px"
                };

                const messageContentContainerStyles: Record<string, string> = {
                    "display": "inline"
                };

                if (config.settings.messageStyle === "modern") {
                    messageContentContainerStyles["display"] = "flex";
                    messageContentContainerStyles["flex-direction"] = config.settings.messageStyle === "modern" ? "column" : "row";
                }

                const avatarStyles: Record<string, string> = {
                    "height": usernameFontSize,
                    "border-radius": "50%",
                    "margin-right": "5px"
                };

                const badgeStyles: Record<string, string> = {
                    "height": usernameFontSize
                };

                const pronounStyles: Record<string, string> = {
                    "border": `solid calc(${messageFontSize} * 0.05) ${config.settings?.messageFontOptions?.color || "#FFFFFF"}`,
                    "border-radius": `calc(${messageFontSize} * 0.25)`,
                    "font-family": (config.settings?.messageFontOptions?.family ? `"${config.settings?.messageFontOptions?.family}"` : "Inter, sans-serif"),
                    "font-size": `calc(${messageFontSize} * 0.75)`,
                    "font-weight": config.settings?.messageFontOptions?.weight?.toString() || "400",
                    "font-style": config.settings?.messageFontOptions?.italic ? "italic" : "normal",
                    "color": config.settings?.messageFontOptions?.color || "#FFFFFF",
                    "padding": `calc(${messageFontSize} * 0.15)`,
                    "margin-right": "5px"
                };

                const usernameStyles: Record<string, string> = {
                    "font-family": (config.settings?.usernameFontOptions?.family ? `"${config.settings?.usernameFontOptions?.family}"` : "Inter, sans-serif"),
                    "font-size": usernameFontSize,
                    "font-weight": config.settings?.usernameFontOptions?.weight?.toString() || "700",
                    "font-style": config.settings?.usernameFontOptions?.italic ? "italic" : "normal"
                };

                const messageStyles: Record<string, string> = {
                    "font-family": (config.settings?.messageFontOptions?.family ? `"${config.settings?.messageFontOptions?.family}"` : "Inter, sans-serif"),
                    "font-size": messageFontSize,
                    "font-weight": config.settings?.messageFontOptions?.weight?.toString() || "400",
                    "font-style": config.settings?.messageFontOptions?.italic ? "italic" : "normal",
                    "color": config.settings?.messageFontOptions?.color || "#FFFFFF"
                };

                const linkStyles: Record<string, string> = {
                    "color": config.settings?.messageFontOptions?.color || "#FFFFFF"
                };

                const highlightedMessageStyles: Record<string, string> = {
                    "background-color": `${config.settings.highlightColor}`
                };

                const actionStyles: Record<string, string> = {
                    "font-style": config.settings?.actionDisplayFormat === "classic" ? "normal" : "italic"
                };

                const styleMarkup = `
                    <style>
                        .chat-${config.id} {
                            ${utils.stylesToString(chatContainerStyles)}
                        }

                        .chat-${config.id} * {
                            vertical-align: middle;
                        }

                        .chat-${config.id} > div + div {
                            ${config.settings.chatOrder === "reversed" ? "margin-bottom" : "margin-top"}: ${config.settings.spaceBetweenMessages ?? 5}px;
                        }

                        .chat-message-root-container-${config.id} {
                            ${utils.stylesToString(messageRootContainerStyles)}
                        }

                        .chat-announcement-bar-${config.id} {
                            ${utils.stylesToString(announcementBarStyles)}
                        }

                        .chat-message-container-${config.id} {
                            ${utils.stylesToString(announcementMessageContainerStyles)}
                        }

                        .chat-highlighted-message-${config.id} {
                            ${utils.stylesToString(highlightedMessageStyles)}
                        }

                        .chat-message-header-${config.id} {
                            ${utils.stylesToString(messageHeaderStyles)}
                        }

                        .chat-message-content-container-${config.id} {
                            ${utils.stylesToString(messageContentContainerStyles)}
                        }

                        .chat-avatar-${config.id} {
                            ${utils.stylesToString(avatarStyles)}
                        }

                        .chat-badge-container-${config.id} {
                            margin-right: 5px;
                        }

                        .chat-badge-${config.id} {
                            ${utils.stylesToString(badgeStyles)}
                        }

                        .chat-pronouns-${config.id} {
                            ${utils.stylesToString(pronounStyles)}
                        }

                        .chat-username-${config.id} {
                            ${utils.stylesToString(usernameStyles)}
                        }

                        .chat-message-${config.id} {
                            ${utils.stylesToString(messageStyles)}
                        }

                        .chat-message-${config.id} a {
                            ${utils.stylesToString(linkStyles)}
                        }

                        .chat-action-${config.id} {
                            ${utils.stylesToString(actionStyles)}
                        }

                        .chat-message-${config.id} img,
                        .chat-action-${config.id} img {
                            height: ${messageFontSize};
                        }
                    </style>
                `;

                const messageDivs: string[] = [];

                for (const chatMessage of config.state?.chatMessages ?? []) {
                    const messageHtml = generateChatMessageHtml(chatMessage, config);

                    if (!!messageHtml?.length) {
                        messageDivs.push(messageHtml);
                    }
                }

                return `${styleMarkup}<div class="chat-${config.id}">${messageDivs.join("\n")}</div>`;
            };

            switch (event.name) {
                case "show":
                    utils.initializeWidget(generateWidgetHtml(event.data.widgetConfig), {
                        "overflow": "hidden"
                    });
                    break;

                case "settings-update":
                    utils.updateWidgetContent(generateWidgetHtml(event.data.widgetConfig));
                    utils.updateWidgetPosition();
                    break;

                case "message":
                    switch (event.data.messageName) {
                        case "chat-message":
                            {
                                const chatMessage = (event.data.messageData as ChatMessageMessageData).chatMessage;
                                const newMessageHtml = generateChatMessageHtml(
                                    chatMessage,
                                    event.data.widgetConfig
                                );

                                try {
                                    if (newMessageHtml) {
                                        const chatContainer = document.getElementsByClassName(`chat-${event.data.widgetConfig.id}`)[0];
                                        chatContainer.insertAdjacentHTML("beforeend", newMessageHtml);

                                        const animationClass = event.data.widgetConfig.settings.newMessageEntryAnimation?.class;
                                        const animationDuration = event.data.widgetConfig.settings.newMessageEntryAnimation?.duration;

                                        if (animationClass != null && animationClass !== "" && animationClass !== "none") {
                                            const duration = animationDuration ? `${animationDuration}s` : undefined;
                                            // @ts-ignore
                                            // eslint-disable-next-line
                                            $(`.chat-${event.data.widgetConfig.id}`).find(`[data-message-id="${chatMessage.id}"]`).animateCss(animationClass, duration);
                                        }

                                        // Trim excess
                                        while (chatContainer.childElementCount > 100) {
                                            chatContainer.removeChild(chatContainer.firstElementChild);
                                        }
                                    }
                                } catch { }
                            }
                            break;

                        case "delete-message":
                            {
                                const messageId = (event.data.messageData as DeleteMessageMessageData).messageId;
                                const animate = (event.data.messageData as DeleteMessageMessageData).animate;

                                try {
                                    const messageToRemove = document.querySelector(`[data-message-id="${messageId}"]`);
                                    const chatContainer = document.getElementsByClassName(`chat-${event.data.widgetConfig.id}`)[0];

                                    if (messageToRemove) {
                                        if (animate === true) {
                                            const animationClass = event.data.widgetConfig.settings.messageExitAnimation?.class;
                                            const animationDuration = event.data.widgetConfig.settings.messageExitAnimation?.duration;

                                            if (animationClass != null && animationClass !== "" && animationClass !== "none") {
                                                const duration = animationDuration ? `${animationDuration}s` : undefined;

                                                // @ts-ignore
                                                // eslint-disable-next-line
                                                $(`.chat-${event.data.widgetConfig.id}`).find(`[data-message-id="${messageId}"]`).animateCss(animationClass, duration, null, null, () => {
                                                    chatContainer.removeChild(messageToRemove);
                                                });
                                            } else {
                                                chatContainer.removeChild(messageToRemove);
                                            }
                                        } else {
                                            chatContainer.removeChild(messageToRemove);
                                        }
                                    }
                                } catch { }
                            }
                            break;

                        case "delete-user-messages":
                            try {
                                const messagesToRemove = document.querySelectorAll(`[data-username="${(event.data.messageData as DeleteUserMessagesMessageData).username}"]`);
                                const chatContainer = document.getElementsByClassName(`chat-${event.data.widgetConfig.id}`)[0];
                                for (const messageToRemove of messagesToRemove) {
                                    chatContainer.removeChild(messageToRemove);
                                }
                            } catch { }
                            break;
                    }
                    break;

                case "remove":
                    utils.removeWidget();
                    break;

                case "state-update":
                    // If we've set the chat message state to null, we're clearing the widget
                    if (event.data.widgetConfig.state?.chatMessages == null) {
                        utils.updateWidgetContent(generateWidgetHtml(event.data.widgetConfig));
                    }
                    break;

                default:
                    break;
            }
        }
    }
};