"use strict";

/**
 * The firebot event source
 */
const firebotEventSource = {
    id: "firebot",
    name: "Firebot",
    description: "Firebot ���Ŕ�������\���̂���d�v�ȃC�x���g",
    events: [
        {
            id: "chat-connected",
            name: "Twitch �ڑ���",
            description: "Firebot��Twitch�ɐڑ������Ƃ�",
            cached: false,
            activityFeed: {
                icon: "fad fa-plug",
                getMessage: () => {
                    return `Twitch �ɐڑ����܂���`;
                }
            }
        },
        {
            id: "view-time-update",
            name: "���ԏ��X�V��",
            description: "�������Ԃ��X�V���ꂽ�Ƃ�",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                previousViewTime: 1,
                newViewTime: 2
            }
        },
        {
            id: "currency-update",
            name: "�ʉݍX�V��",
            description: "�����҂̒ʉ݂��ς�����Ƃ�",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                currencyName: "�R�C��",
                previousCurrencyAmount: 1,
                newCurrencyAmount: 2
            }
        },
        {
            id: "viewer-created",
            name: "�����ҏ��ǉ���",
            description: "�����҂��ŏ��Ɏ����҃f�[�^�x�[�X�ɕۑ������Ƃ�",
            cached: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "firebot-started",
            name: "Firebot �N����",
            description: "Firebot���N�������Ƃ�",
            cached: false
        },
        {
            id: "custom-variable-expired",
            name: "�J�X�^���ϐ��̗L�������؂ꎞ",
            description: "�J�X�^���ϐ��̗L���������؂ꂽ�Ƃ�",
            cached: false
        },
        {
            id: "custom-variable-set",
            name: "�J�X�^���ϐ��̍쐬��",
            description: "�J�X�^���ϐ����쐬���ꂽ�Ƃ�",
            cached: false
        },
        {
            id: "highlight-message",
            name: "�`���b�g���b�Z�[�W�n�C���C�g��",
            description: "�I�[�o�[���C��Ń��b�Z�[�W���n�C���C�g���ꂽ��",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                messageText: "�e�X�g���b�Z�[�W"
            }
        },
        {
            id: "category-changed",
            name: "�J�e�S���[�ύX��",
            description: "�_�b�V���{�[�h�Ŕz�M�J�e�S���[��ύX������",
            cached: false,
            manualMetadata: {
                category: "Just Chatting"
            }
        },
        {
            id: "effect-queue-cleared",
            name: "Effect Queue Cleared",
            description: "When an effect queue finishes running and is cleared.",
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting"
            }
        }
    ]
};

module.exports = firebotEventSource;
