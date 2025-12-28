import tinycolor from "tinycolor2";
import type { ReplaceVariable } from "../../../../types/variables";

const model: ReplaceVariable = {
    definition: {
        handle: "color",
        examples: [
            {
                usage: 'color[red]',
                description: "'#ff0000' を返します。"
            },
            {
                usage: 'color[red, hex]',
                description: "'#ff0000' を返します。"
            },
            {
                usage: 'color[red, hexa, 255]',
                description: "'#ff0000ff' を返します。"
            },
            {
                usage: 'color[green, ahex, 255]',
                description: "'#ff00ff00' を返します。"
            },
            {
                usage: 'color[red, rgb]',
                description: "'rgb(255, 0, 0)' を返します。"
            },
            {
                usage: 'color[red, rgbp]',
                description: "'rgb(100%, 0, 0)' を返します。"
            },

            {
                usage: 'color[#00ff00, hsl]',
                description: "'hsl(0, 100%, 50%)' を返します。"
            },
            {
                usage: 'color[#ff00ff00, hsv, 0.5]',
                description: "'hsv(0, 100%, 100%)' を返します。"
            },
            {
                usage: 'color[#ff00ff00, dec]',
                description: "10 進数の値を返します。"
            }
        ],
        description: "指定した形式で色を出力します。",
        possibleDataOutput: ["text"]
    },
    evaluator: (
        _,
        colorString: string,
        type: string,
        alpha: null | number | string = 1
    ) => {
        const color = tinycolor(colorString);
        alpha = Number(alpha) > 1 ? Number(alpha) / 255 : Number(alpha);
        color.setAlpha(Number(alpha));
        let hexColor = color.toHex8String();
        let output: string | number;
        switch (type) {
            case "hex":
                output = color.toHexString();
                break;
            case "hexa":
                output = hexColor;
                break;
            case "ahex":
                hexColor = hexColor.replace("#", "");
                output = `#${hexColor.substring(6, 8)}${hexColor.substring(0, 2)}${hexColor.substring(2, 4)}${hexColor.substring(4, 6)}`;
                break;
            case "rgb":
                output = color.toRgbString();
                break;
            case "rgbp":
                output = color.toPercentageRgbString();
                break;
            case "hsl":
                output = color.toHslString();
                break;
            case "hsv":
                output = color.toHsvString();
                break;
            case "dec":
                hexColor = hexColor.replace("#", "");
                output = parseInt(hexColor, 16);
                break;
            default:
                output = color.toHexString();
                break;
        }
        return output;
    }
};

export default model;