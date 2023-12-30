"use strict";

module.exports = {
    id: "firebot:custom",
    name: "�J�X�^��",
    description: "�J�X�^���l�Ɋ�Â����� ($variables ���g���ƕ֗�)",
    comparisonTypes: ["��v", "�s��v", "�����Ɉ�v", "�����ɕs��v", "����", "�ȉ�", "����", "�ȏ�", "�܂�", "�܂܂Ȃ�", "���K�\���ň�v", "���K�\���ŕs��v"],
    leftSideValueType: "text",
    rightSideValueType: "text",
    predicate: (conditionSettings) => {

        let { comparisonType, leftSideValue, rightSideValue } = conditionSettings;

        if (comparisonType !== "is strictly" && comparisonType !== "is not strictly") {
            if (!isNaN(leftSideValue)) {
                leftSideValue = Number(leftSideValue);
            }
            if (!isNaN(rightSideValue)) {
                rightSideValue = Number(rightSideValue);
            }
        }


        switch (comparisonType) {
        case "is":
        case "��v":
            return leftSideValue == rightSideValue; //eslint-disable-line eqeqeq
        case "is not":
        case "�s��v":
            return leftSideValue != rightSideValue; //eslint-disable-line eqeqeq
        case "is strictly":
        case "�����Ɉ�v":
            return leftSideValue === rightSideValue;
        case "is not strictly":
        case "�����ɕs��v":
            return leftSideValue !== rightSideValue;
        case "is less than":
        case "����":
            return leftSideValue < rightSideValue;
        case "is less than or equal to":
        case "�ȉ�":
            return leftSideValue <= rightSideValue;
        case "is greater than":
        case "����":
            return leftSideValue > rightSideValue;
        case "is greater than or equal to":
        case "�ȏ�":
            return leftSideValue >= rightSideValue;
        case "contains":
        case "�܂�":
            return leftSideValue.toString().includes(rightSideValue);
        case "does not contain":
        case "�܂܂Ȃ�":
            return !leftSideValue.toString().includes(rightSideValue);
        case "matches regex":
        case "���K�\���ň�v": {
            const regex = new RegExp(rightSideValue, "gi");
            return regex.test(leftSideValue);
        }
        case "does not match regex":
        case "���K�\���ŕs��v": {
            const regex = new RegExp(rightSideValue, "gi");
            return !regex.test(leftSideValue);
        }
        default:
            return false;
        }
    }
};