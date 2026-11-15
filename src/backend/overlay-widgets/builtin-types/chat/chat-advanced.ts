import type {
    FirebotChatMessage,
    OverlayWidgetType,
    IOverlayWidgetEventUtils,
    WidgetOverlayEvent,
    Animation
} from "../../../../types";

import type {
    ChatWidgetState,
    ChatMessageMessageData,
    DeleteMessageMessageData,
    DeleteUserMessagesMessageData
} from "./chat";

import { livePreviewChatMessages } from "./chat-widget-shared";

export type AdvancedChatWidgetSettings = {
    cssTemplate: string;

    defaultMessageHtmlTemplate: string;

    useSeparateTemplateForActions: boolean;
    actionHtmlTemplate?: string;

    useSeparateTemplateForHighlightedMessages: boolean;
    highlightedMessageHtmlTemplate?: string;

    showSharedChatMessages: boolean;
    useSeparateTemplateForSharedMessages?: boolean;
    sharedChatMessageHtmlTemplate?: string;

    showAnnouncements: boolean;
    useSeparateTemplateForAnnouncements?: boolean;
    announcementHtmlTemplate?: string;

    delayMessages: boolean;
    messageDelay?: number;
    newMessageEntryAnimation: Animation;
    autoRemoveMessages: boolean;
    messageTimeout?: number;
    messageExitAnimation?: Animation;
    thirdPartyEmotes: string[];
    hiddenUsers: string[];
};


export const chatAdvanced: OverlayWidgetType<AdvancedChatWidgetSettings, ChatWidgetState> = {
    id: "firebot:chat-advanced",
    name: "チャット（上級者向け）",
    description: "ウィジェットの内容を生成する HTML と CSS を自分で指定する、オーバーレイ用の上級者向けチャットフィードです。",
    icon: "fa fa-comments-alt-dollar",
    userCanConfigure: {
        entryAnimation: false,
        exitAnimation: false
    },
    settingsSchema: [
        {
            name: "cssTemplate",
            title: "CSS テンプレート",
            description: `ウィジェットで使用する CSS スタイルやカスタム CSS クラスです。この値は自動的に \`<style>\` タグの中に挿入されます。

以下のフィールドは、対応する CSS クラス名に自動的に置き換えられます:
- \`{{messageContainerClass}}\`: ウィジェットが自動生成する、このウィジェットのすべてのチャットメッセージを含む \`<div>\` 要素です。新しいメッセージはこの要素の子として追加されます。
- \`{{messageClass}}\`: ウィジェットが自動生成する、1 件のメッセージを含む \`<div>\` 要素です。`,
            type: "codemirror",
            default: "",
            settings: {
                mode: "css",
                theme: "blackboard"
            }
        },
        {
            name: "defaultMessageHtmlTemplate",
            title: "デフォルトのメッセージ HTML テンプレート",
            description: `ウィジェットの生成時に使用するデフォルトのメッセージ HTML テンプレートです。

メッセージでは以下のフィールドを使用できます:
- \`{{avatarUrl}}\`: チャット参加者のアバターの URL
- \`{{badges}}\`: バッジの HTML スニペット（各バッジが \`<img>\` タグに変換されます）
- \`{{chatMessage}}\`: エモートや Cheermote を整形したチャットメッセージ（例: エモートは \`<img>\` タグに変換されます）
- \`{{chatMessageRawText}}\`: エモートや Cheermote などを整形していない、チャットメッセージの生テキスト
- \`{{pronouns}}\`: チャット参加者の代名詞（設定されている場合）
- \`{{timestamp}}\`: メッセージのタイムスタンプ
- \`{{username}}\`: チャット参加者の表示名
- \`{{usernameColor}}\`: チャット参加者のユーザー名の色（16進形式、例: \`#0066FF\`）`,
            type: "codemirror",
            default: "",
            settings: {
                mode: "htmlmixed",
                theme: "blackboard"
            },
            showBottomHr: true
        },
        {
            name: "useSeparateTemplateForActions",
            title: "アクション用に別のテンプレートを使用",
            description: "`/me` アクションに別の HTML テンプレートを使用するかどうかです",
            type: "boolean",
            default: true
        },
        {
            name: "actionHtmlTemplate",
            title: "アクションの HTML テンプレート",
            description: "`/me` アクションに使用する HTML テンプレートです。デフォルトのメッセージテンプレートと同じフィールドを使用できます。",
            type: "codemirror",
            default: "",
            settings: {
                mode: "htmlmixed",
                theme: "blackboard"
            },
            showIf: {
                useSeparateTemplateForActions: true
            },
            showBottomHr: true
        },
        {
            name: "useSeparateTemplateForHighlightedMessages",
            title: "ハイライトされたメッセージ用に別のテンプレートを使用",
            description: "チャンネルポイント報酬「メッセージをハイライト」で送信されたメッセージに別の HTML テンプレートを使用するかどうかです。",
            type: "boolean",
            default: true
        },
        {
            name: "highlightedMessageHtmlTemplate",
            title: "ハイライトされたメッセージの HTML テンプレート",
            description: "チャンネルポイント報酬「メッセージをハイライト」で送信されたメッセージに使用する HTML テンプレートです。デフォルトのメッセージテンプレートと同じフィールドを使用できます。",
            type: "codemirror",
            default: "",
            settings: {
                mode: "htmlmixed",
                theme: "blackboard"
            },
            showIf: {
                useSeparateTemplateForHighlightedMessages: true
            },
            showBottomHr: true
        },
        {
            name: "showSharedChatMessages",
            title: "共有チャットのメッセージを表示",
            description: "共有チャットセッション中に他のチャンネルから送信されたチャットメッセージを表示します",
            type: "boolean",
            default: false
        },
        {
            name: "useSeparateTemplateForSharedMessages",
            title: "共有チャットのメッセージ用に別のテンプレートを使用",
            description: "共有チャットセッション中に他のチャンネルから送信されたメッセージに別の HTML テンプレートを使用するかどうかです。",
            type: "boolean",
            default: true,
            showIf: {
                showSharedChatMessages: true
            }
        },
        {
            name: "sharedChatMessageHtmlTemplate",
            title: "共有チャットのメッセージ HTML テンプレート",
            description: `共有チャットセッション中に他のチャンネルから送信されたメッセージに使用する HTML テンプレートです。

 デフォルトのメッセージテンプレートと同じフィールドに加えて、以下のフィールドを使用できます:
 - \`{{sharedChatRoomChannel}}\`: メッセージが送信された外部チャンネルの表示名
 - \`{{sharedChatRoomAvatarUrl}}\`: メッセージが送信された外部チャンネルのアバター URL`,
            type: "codemirror",
            default: "",
            settings: {
                mode: "htmlmixed",
                theme: "blackboard"
            },
            showIf: {
                showSharedChatMessages: true,
                useSeparateTemplateForSharedMessages: true
            },
            showBottomHr: true
        },
        {
            name: "showAnnouncements",
            title: "アナウンスを表示",
            description: "配信者またはモデレーターが送信したチャットのアナウンスを表示します",
            type: "boolean",
            default: false
        },
        {
            name: "useSeparateTemplateForAnnouncements",
            title: "アナウンス用に別のテンプレートを使用",
            description: "アナウンスに別の HTML テンプレートを使用するかどうかです。",
            type: "boolean",
            default: true,
            showIf: {
                showAnnouncements: true
            }
        },
        {
            name: "announcementHtmlTemplate",
            title: "アナウンスの HTML テンプレート",
            description: `アナウンスに使用する HTML テンプレートです。

デフォルトのメッセージテンプレートと同じフィールドに加えて、以下のフィールドを使用できます:
- \`{{announcementColor}}\`: アナウンスの色の名前です。\`PRIMARY\`、\`BLUE\`、\`GREEN\`、\`ORANGE\`、\`PURPLE\` のいずれかになります。`,
            type: "codemirror",
            default: "",
            settings: {
                mode: "htmlmixed",
                theme: "blackboard"
            },
            showIf: {
                showAnnouncements: true,
                useSeparateTemplateForAnnouncements: true
            },
            showBottomHr: true
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
        eventHandler: (event: WidgetOverlayEvent<AdvancedChatWidgetSettings, ChatWidgetState>, utils: IOverlayWidgetEventUtils) => {
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

                let templateBase = config.settings.defaultMessageHtmlTemplate;

                // Don't render announcements unless we specifically want them
                if (chatMessage.isAnnouncement === true) {
                    if (config.settings.showAnnouncements !== true) {
                        return;
                    } else if (config.settings.useSeparateTemplateForAnnouncements === true) {
                        templateBase = (config.settings.announcementHtmlTemplate ?? "")
                            .replaceAll("{{announcementColor}}", chatMessage.announcementColor ?? "PRIMARY");
                    }
                }

                // Same with shared chat messages
                if (chatMessage.isSharedChatMessage === true) {
                    if (config.settings.showSharedChatMessages !== true) {
                        return;
                    } else if (config.settings.useSeparateTemplateForSharedMessages === true) {
                        templateBase = (config.settings.sharedChatMessageHtmlTemplate ?? "")
                            .replaceAll("{{sharedChatRoomChannel}}", chatMessage.sharedChatRoomDisplayName ?? chatMessage.sharedChatRoomUsername ?? "")
                            .replaceAll("{{sharedChatRoomAvatarUrl}}", chatMessage.sharedChatRoomProfilePicUrl ?? "");
                    }
                }

                if (chatMessage.action === true
                    && config.settings.useSeparateTemplateForActions === true
                ) {
                    templateBase = config.settings.actionHtmlTemplate ?? "";
                }

                if (chatMessage.isHighlighted === true
                    && config.settings.useSeparateTemplateForHighlightedMessages === true
                ) {
                    templateBase = config.settings.highlightedMessageHtmlTemplate ?? "";
                }

                const messageClass = `chat-message-${config.id}`;

                templateBase = `<div
                    class="${messageClass}"
                    data-message-id="${chatMessage.id}"
                    data-username="${chatMessage.username}"
                >${templateBase}</div>`;

                let timestampString: string;
                if (chatMessage.timestamp) {
                    const timestampAsDate = new Date(chatMessage.timestamp);
                    const hours = timestampAsDate.getHours() % 12 === 0
                        ? "12"
                        : timestampAsDate.getHours() % 12;
                    const minutes = String(timestampAsDate.getMinutes()).padStart(2, "0");

                    timestampString = `${hours}:${minutes}`;
                }

                let badgeHtml = "";
                for (const badge of chatMessage.badges) {
                    const badgeElem = document.createElement("img");
                    badgeElem.src = badge.url;
                    badgeElem.alt = badge.title;

                    badgeHtml += badgeElem.outerHTML;
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

                return templateBase
                    .replaceAll("{{timestamp}}", timestampString)
                    .replaceAll("{{avatarUrl}}", chatMessage.profilePicUrl ?? "")
                    .replaceAll("{{badges}}", badgeHtml)
                    .replaceAll("{{username}}", chatMessage.userDisplayName ?? chatMessage.username)
                    .replaceAll("{{usernameColor}}", chatMessage.color ?? "")
                    .replaceAll("{{pronouns}}", chatMessage.pronouns ?? "")
                    .replaceAll("{{chatMessage}}", chatMessagePartsHtml.join(""))
                    .replaceAll("{{chatMessageRawText}}", chatMessage.rawText);
            };

            const generateWidgetHtml = (config: typeof event["data"]["widgetConfig"]) => {
                const messageContainerClass = `chat-${event.data.widgetConfig.id}`;
                const messageClass = `chat-message-${event.data.widgetConfig.id}`;

                const cssTemplate = (config.settings.cssTemplate ?? "")
                    .replaceAll("{{messageContainerClass}}", `.${messageContainerClass}`)
                    .replaceAll("{{messageClass}}", `.${messageClass}`);

                const styleMarkup = `<style>${cssTemplate}</style>`;

                const messages: string[] = [];

                for (const chatMessage of config.state?.chatMessages ?? []) {
                    const messageHtml = generateChatMessageHtml(chatMessage, config);

                    if (!!messageHtml?.length) {
                        messages.push(messageHtml);
                    }
                }

                return `${styleMarkup}<div class="${messageContainerClass}">${messages.join("\n")}</div>`;
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