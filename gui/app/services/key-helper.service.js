"use strict";

(function() {

    angular
        .module("firebotApp")
        .factory("keyHelper", function() {
            const service = {};

            // names of known key codes (0-255)
            const keyboardNameMap = [ //eslint-disable-line no-unused-vars
                "", // [0]
                "", // [1]
                "", // [2]
                "", // [3] CANCEL
                "", // [4]
                "", // [5]
                "", // [6] HELP
                "", // [7]
                "", // [8] BACK_SPACE
                "", // [9] TAB
                "", // [10]
                "", // [11]
                "", // [12] CLEAR
                "ENTER", // [13]
                "", // [14] ENTER_SPECIAL
                "", // [15]
                "", // [16] SHIFT
                "", // [17] CONTROL
                "", // [18] ALT
                "", // [19] PAUSE
                "", // [20] CAPS_LOCK
                "", // [21] KANA
                "", // [22] EISU
                "", // [23] JUNJA
                "", // [24] FINAL
                "", // [25] HANJA
                "", // [26]
                "", // [27] ESCAPE
                "", // [28] CONVERT
                "", // [29] NONCONVERT
                "", // [30] ACCEPT
                "", // [31] MODECHANGE
                "Space", // [32]
                "", // [33] PAGE_UP
                "", // [34] PAGE_DOWN
                "", // [35] END
                "", // [36] HOME
                "Left", // [37]
                "Up", // [38]
                "Right", // [39]
                "Down", // [40]
                "", // [41] SELECT
                "", // [42] PRINT
                "", // [43] EXECUTE
                "", // [44] PRINTSCREEN
                "", // [45] INSERT
                "", // [46] DELETE
                "", // [47]
                "0", // [48]
                "1", // [49]
                "2", // [50]
                "3", // [51]
                "4", // [52]
                "5", // [53]
                "6", // [54]
                "7", // [55]
                "8", // [56]
                "9", // [57]
                "", // [58] COLON
                "", // [59] SEMICOLON
                "", // [60] LESS_THAN
                "", // [61] EQUALS
                "", // [62] GREATER_THAN
                "", // [63] QUESTION_MARK
                "", // [64] AT
                "A", // [65]
                "B", // [66]
                "C", // [67]
                "D", // [68]
                "E", // [69]
                "F", // [70]
                "G", // [71]
                "H", // [72]
                "I", // [73]
                "J", // [74]
                "K", // [75]
                "L", // [76]
                "M", // [77]
                "N", // [78]
                "O", // [79]
                "P", // [80]
                "Q", // [81]
                "R", // [82]
                "S", // [83]
                "T", // [84]
                "U", // [85]
                "V", // [86]
                "W", // [87]
                "X", // [88]
                "Y", // [89]
                "Z", // [90]
                "", // [91] OS_KEY Windows Key (Windows) or Command Key (Mac)
                "", // [92]
                "", // [93] CONTEXT_MENU
                "", // [94]
                "", // [95] SLEEP
                "Numpad 0", // [96]
                "Numpad 1", // [97]
                "Numpad 2", // [98]
                "Numpad 3", // [99]
                "Numpad 4", // [100]
                "Numpad 5", // [101]
                "Numpad 6", // [102]
                "Numpad 7", // [103]
                "Numpad 8", // [104]
                "Numpad 9", // [105]
                "", // [106] MULTIPLY
                "", // [107] ADD
                "", // [108] SEPARATOR
                "", // [109] SUBTRACT
                "", // [110] DECIMAL
                "", // [111] DIVIDE
                "F1", // [112]
                "F2", // [113]
                "F3", // [114]
                "F4", // [115]
                "F5", // [116]
                "F6", // [117]
                "F7", // [118]
                "F8", // [119]
                "F9", // [120]
                "F10", // [121]
                "F11", // [122]
                "F12", // [123]
                "F13", // [124]
                "F14", // [125]
                "F15", // [126]
                "F16", // [127]
                "F17", // [128]
                "F18", // [129]
                "F19", // [130]
                "F20", // [131]
                "F21", // [132]
                "F22", // [133]
                "F23", // [134]
                "F24", // [135]
                "", // [136]
                "", // [137]
                "", // [138]
                "", // [139]
                "", // [140]
                "", // [141]
                "", // [142]
                "", // [143]
                "NUM_LOCK", // [144]
                "SCROLL_LOCK", // [145]
                "WIN_OEM_FJ_JISHO", // [146]
                "WIN_OEM_FJ_MASSHOU", // [147]
                "WIN_OEM_FJ_TOUROKU", // [148]
                "WIN_OEM_FJ_LOYA", // [149]
                "WIN_OEM_FJ_ROYA", // [150]
                "", // [151]
                "", // [152]
                "", // [153]
                "", // [154]
                "", // [155]
                "", // [156]
                "", // [157]
                "", // [158]
                "", // [159]
                "CIRCUMFLEX", // [160]
                "EXCLAMATION", // [161]
                "DOUBLE_QUOTE", // [162]
                "HASH", // [163]
                "DOLLAR", // [164]
                "PERCENT", // [165]
                "AMPERSAND", // [166]
                "UNDERSCORE", // [167]
                "OPEN_PAREN", // [168]
                "CLOSE_PAREN", // [169]
                "ASTERISK", // [170]
                "PLUS", // [171]
                "PIPE", // [172]
                "HYPHEN_MINUS", // [173]
                "OPEN_CURLY_BRACKET", // [174]
                "CLOSE_CURLY_BRACKET", // [175]
                "TILDE", // [176]
                "", // [177]
                "", // [178]
                "", // [179]
                "", // [180]
                "VOLUME_MUTE", // [181]
                "VOLUME_DOWN", // [182]
                "VOLUME_UP", // [183]
                "", // [184]
                "", // [185]
                "SEMICOLON", // [186]
                "EQUALS", // [187]
                "COMMA", // [188]
                "MINUS", // [189]
                "PERIOD", // [190]
                "SLASH", // [191]
                "BACK_QUOTE", // [192]
                "", // [193]
                "", // [194]
                "", // [195]
                "", // [196]
                "", // [197]
                "", // [198]
                "", // [199]
                "", // [200]
                "", // [201]
                "", // [202]
                "", // [203]
                "", // [204]
                "", // [205]
                "", // [206]
                "", // [207]
                "", // [208]
                "", // [209]
                "", // [210]
                "", // [211]
                "", // [212]
                "", // [213]
                "", // [214]
                "", // [215]
                "", // [216]
                "", // [217]
                "", // [218]
                "OPEN_BRACKET", // [219]
                "BACK_SLASH", // [220]
                "CLOSE_BRACKET", // [221]
                "QUOTE", // [222]
                "", // [223]
                "META", // [224]
                "ALTGR", // [225]
                "", // [226]
                "WIN_ICO_HELP", // [227]
                "WIN_ICO_00", // [228]
                "", // [229]
                "WIN_ICO_CLEAR", // [230]
                "", // [231]
                "", // [232]
                "WIN_OEM_RESET", // [233]
                "WIN_OEM_JUMP", // [234]
                "WIN_OEM_PA1", // [235]
                "WIN_OEM_PA2", // [236]
                "WIN_OEM_PA3", // [237]
                "WIN_OEM_WSCTRL", // [238]
                "WIN_OEM_CUSEL", // [239]
                "WIN_OEM_ATTN", // [240]
                "WIN_OEM_FINISH", // [241]
                "WIN_OEM_COPY", // [242]
                "WIN_OEM_AUTO", // [243]
                "WIN_OEM_ENLW", // [244]
                "WIN_OEM_BACKTAB", // [245]
                "ATTN", // [246]
                "CRSEL", // [247]
                "EXSEL", // [248]
                "EREOF", // [249]
                "PLAY", // [250]
                "ZOOM", // [251]
                "", // [252]
                "PA1", // [253]
                "WIN_OEM_CLEAR", // [254]
                "" // [255]
            ];

            // This has the UnShifted and Shifted characters that each key maps to
            // Ones that are to be ignored for character input are empty.
            const keyboardCharMap = [
                ["", ""], // [0]
                ["", ""], // [1]
                ["", ""], // [2]
                ["", ""], // [3]
                ["", ""], // [4]
                ["", ""], // [5]
                ["", ""], // [6]
                ["", ""], // [7]
                ["", ""], // [8]
                ["", ""], // [9]
                ["", ""], // [10]
                ["", ""], // [11]
                ["", ""], // [12]
                ["Enter", "Enter"], // [13]	- MOST control characters are ignored.  This one (Carriage Return, or "Enter") is significant!
                ["", ""], // [14]
                ["", ""], // [15]
                ["", ""], // [16]
                ["", ""], // [17]
                ["", ""], // [18]
                ["", ""], // [19]
                ["", ""], // [20]
                ["", ""], // [21]
                ["", ""], // [22]
                ["", ""], // [23]
                ["", ""], // [24]
                ["", ""], // [25]
                ["", ""], // [26]
                ["", ""], // [27]
                ["", ""], // [28]
                ["", ""], // [29]
                ["", ""], // [30]
                ["", ""], // [31]
                ["Space", "Space"], // [32]	// SPACE!  Don't "clean it up" and remove the space!
                ["", ""], // [33]
                ["", ""], // [34]
                ["", ""], // [35]
                ["", ""], // [36]
                ["Left", ""], // [37]
                ["Up", ""], // [38]
                ["Right", ""], // [39]
                ["Down", ""], // [40]
                ["", ""], // [41]
                ["", ""], // [42]
                ["", ""], // [43]
                ["", ""], // [44]
                ["", ""], // [45]
                ["", ""], // [46]
                ["", ""], // [47]
                ["0", ")"], // [48]
                ["1", "!"], // [49]
                ["2", "@"], // [50]
                ["3", "#"], // [51]
                ["4", "$"], // [52]
                ["5", "%"], // [53]
                ["6", "^"], // [54]
                ["7", "&"], // [55]
                ["8", "*"], // [56]
                ["9", "("], // [57]
                ["", ""], // [58]
                [";", ":"], // [59]
                ["<", ""], // [60]
                ["=", ""], // [61]
                [">", ""], // [62]
                ["?", ""], // [63]	shifted;  else "/"
                ["", ""], // [64]
                ["A", "A"], // [65]
                ["B", "B"], // [66]
                ["C", "C"], // [67]
                ["D", "D"], // [68]
                ["E", "E"], // [69]
                ["F", "F"], // [70]
                ["G", "G"], // [71]
                ["H", "H"], // [72]
                ["I", "I"], // [73]
                ["J", "J"], // [74]
                ["K", "K"], // [75]
                ["L", "L"], // [76]
                ["M", "M"], // [77]
                ["N", "N"], // [78]
                ["O", "O"], // [79]
                ["P", "P"], // [80]
                ["Q", "Q"], // [81]
                ["R", "R"], // [82]
                ["S", "S"], // [83]
                ["T", "T"], // [84]
                ["U", "U"], // [85]
                ["V", "V"], // [86]
                ["W", "W"], // [87]
                ["X", "X"], // [88]
                ["Y", "Y"], // [89]
                ["Z", "Z"], // [90]
                ["", ""], // [91] Windows Key (Windows) or Command Key (Mac)
                ["", ""], // [92]
                ["", ""], // [93]
                ["", ""], // [94]
                ["", ""], // [95]
                // Number Keypad Entries...
                ["0", ""], // [96]
                ["1", ""], // [97]
                ["2", ""], // [98]
                ["3", ""], // [99]
                ["4", ""], // [100]
                ["5", ""], // [101]
                ["6", ""], // [102]
                ["7", ""], // [103]
                ["8", ""], // [104]
                ["9", ""], // [105]
                ["*", ""], // [106]
                ["+", ""], // [107]
                ["", ""], // [108]
                ["-", ""], // [109]
                [".", ""], // [110]
                ["/", ""], // [111]

                ["", ""], // [112]
                ["", ""], // [113]
                ["", ""], // [114]
                ["", ""], // [115]
                ["", ""], // [116]
                ["", ""], // [117]
                ["", ""], // [118]
                ["", ""], // [119]
                ["", ""], // [120]
                ["", ""], // [121]
                ["", ""], // [122]
                ["", ""], // [123]
                ["", ""], // [124]
                ["", ""], // [125]
                ["", ""], // [126]
                ["", ""], // [127]
                ["", ""], // [128]
                ["", ""], // [129]
                ["", ""], // [130]
                ["", ""], // [131]
                ["", ""], // [132]
                ["", ""], // [133]
                ["", ""], // [134]
                ["", ""], // [135]
                ["", ""], // [136]
                ["", ""], // [137]
                ["", ""], // [138]
                ["", ""], // [139]
                ["", ""], // [140]
                ["", ""], // [141]
                ["", ""], // [142]
                ["", ""], // [143]
                ["", ""], // [144]
                ["", ""], // [145]
                ["", ""], // [146]
                ["", ""], // [147]
                ["", ""], // [148]
                ["", ""], // [149]
                ["", ""], // [150]
                ["", ""], // [151]
                ["", ""], // [152]
                ["", ""], // [153]
                ["", ""], // [154]
                ["", ""], // [155]
                ["", ""], // [156]
                ["", ""], // [157]
                ["", ""], // [158]
                ["", ""], // [159]
                ["", ""], // [160]
                ["", ""], // [161]
                ["", ""], // [162]
                ["", ""], // [163]
                ["", ""], // [164]
                ["", ""], // [165]
                ["", ""], // [166]
                ["", ""], // [167]
                ["", ""], // [168]
                ["", ""], // [169]
                ["", ""], // [170]
                ["", ""], // [171]
                ["", ""], // [172]
                ["", ""], // [173]
                ["", ""], // [174]
                ["", ""], // [175]
                ["", ""], // [176]
                ["", ""], // [177]
                ["", ""], // [178]
                ["", ""], // [179]
                ["", ""], // [180]
                ["", ""], // [181]
                ["", ""], // [182]
                ["", ""], // [183]
                ["", ""], // [184]
                ["", ""], // [185]
                ["", ""], // [186]
                ["=", "+"], // [187]
                [",", "<"], // [188]
                ["-", "_"], // [189]
                [".", ">"], // [190]
                ["/", "?"], // [191]
                ["`", "~"], // [192]
                ["", ""], // [193]
                ["", ""], // [194]
                ["", ""], // [195]
                ["", ""], // [196]
                ["", ""], // [197]
                ["", ""], // [198]
                ["", ""], // [199]
                ["", ""], // [200]
                ["", ""], // [201]
                ["", ""], // [202]
                ["", ""], // [203]
                ["", ""], // [204]
                ["", ""], // [205]
                ["", ""], // [206]
                ["", ""], // [207]
                ["", ""], // [208]
                ["", ""], // [209]
                ["", ""], // [210]
                ["", ""], // [211]
                ["", ""], // [212]
                ["", ""], // [213]
                ["", ""], // [214]
                ["", ""], // [215]
                ["", ""], // [216]
                ["", ""], // [217]
                ["", ""], // [218]
                ["[", "{"], // [219]
                ["\\", "|"], // [220]
                ["]", "}"], // [221]
                ["'", "\""], // [222]
                ["", ""], // [223]
                ["", ""], // [224]
                ["", ""], // [225]
                ["", ""], // [226]
                ["", ""], // [227]
                ["", ""], // [228]
                ["", ""], // [229]
                ["", ""], // [230]
                ["", ""], // [231]
                ["", ""], // [232]
                ["", ""], // [233]
                ["", ""], // [234]
                ["", ""], // [235]
                ["", ""], // [236]
                ["", ""], // [237]
                ["", ""], // [238]
                ["", ""], // [239]
                ["", ""], // [240]
                ["", ""], // [241]
                ["", ""], // [242]
                ["", ""], // [243]
                ["", ""], // [244]
                ["", ""], // [245]
                ["", ""], // [246]
                ["", ""], // [247]
                ["", ""], // [248]
                ["", ""], // [249]
                ["", ""], // [250]
                ["", ""], // [251]
                ["", ""], // [252]
                ["", ""], // [253]
                ["", ""], // [254]
                ["", ""] // [255]
            ];

            service.getKeyboardKeyName = (keyCode) => {
                // keyboardCharMap is an array of arrays, with each inner
                // array having 2 columns - un-shifted, and shifted values.
                // column = 0 is the un-shifted value, while column=1 is the shifted value.
                // See the "keyboardCharMap" for printable characters.
                const column = 0;

                const keyMap = keyboardCharMap[keyCode];
                if (!keyMap) {
                    return "";
                }

                return keyMap[column];
            };

            return service;
        });
}());
