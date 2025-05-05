import fsp from "fs/promises";
import fs from "fs";
import path from "path";
import logger from "./logwrapper";
import frontendCommunicator from "./common/frontend-communicator";
import profileManager from "./common/profile-manager";
import { SettingsManager } from "./common/settings-manager";
import webServer from "../server/http-server-manager";
import { FirebotSettingsDefaults } from "../types/settings";

export enum FontFormat {
    TrueType = "truetype",
    OpenType = "opentype",
    WOFF = "woff",
    WOFF2 = "woff2"
}

export type FirebotFont = {
    filename: string;
    path: string;
    name: string;
    format: FontFormat
}

class FontManager {
    private readonly fontCacheFile: string;
    cachedFonts: FirebotFont[] = [];
    fontCssGenerated = false;

    constructor() {
        this.fontCacheFile = path.join(this.fontsFolder, "fonts-cache.json");
        frontendCommunicator.on("fonts:get-font-folder-path", () => {
            return this.fontsFolder;
        });

        frontendCommunicator.on("fonts:get-generated-css-path", () => {
            return this.fontCssPath;
        });

        frontendCommunicator.on("fonts:get-installed-fonts", () => {
            return this.cachedFonts;
        });

        frontendCommunicator.on("fonts:get-font", (name: string) => {
            return this.getFont(name);
        });

        frontendCommunicator.onAsync("fonts:install-font", async (filepath: string) => {
            return await this.installFont(filepath);
        });

        frontendCommunicator.onAsync("fonts:remove-font", async (name: string) => {
            await this.removeFont(name);
        });
    }

    private stripFontFileType(f: string): string {
        return f.replace(/\.ttf/i, "")
            .replace(/\.woff/i, "")
            .replace(/\.woff2/i, "")
            .replace(/\.otf/i, "");
    }

    private getFontFormatFromFilename(f: string): FontFormat {
        const normalized = f.toLowerCase();
        if (normalized.endsWith(".ttf")) {
            return FontFormat.TrueType;
        }
        if (normalized.endsWith(".woff")) {
            return FontFormat.WOFF;
        }
        if (normalized.endsWith(".woff2")) {
            return FontFormat.WOFF2;
        }
        if (normalized.endsWith(".otf")) {
            return FontFormat.OpenType;
        }
    }

    get fontsFolder() {
        return profileManager.getPathInProfile("/fonts");
    }

    get fontCssPath() {
        return path.join(this.fontsFolder, "fonts.css");
    }

    async loadInstalledFonts(): Promise<void> {
        try {
            // キャッシュファイルが存在する場合は読み込む
            if (fs.existsSync(this.fontCacheFile)) {
                logger.debug("フォントキャッシュから読み込みます...");
                const cachedData = await fsp.readFile(this.fontCacheFile, 'utf8');
                this.cachedFonts = JSON.parse(cachedData);
                
                // キャッシュからの読み込みは成功したが、実際にファイルが存在するか非同期で確認する
                // これにより、起動プロセスはブロックせずに進行する
                setTimeout(async () => {
                    await this.validateAndUpdateFontCache();
                }, 10000); // 10秒後に検証（アプリが起動した後）
                
                return;
            }
        } catch (error) {
            logger.warn("フォントキャッシュの読み込みに失敗しました、通常の読み込みを行います", error);
        }
        
        // キャッシュがない場合やエラーの場合は通常通り読み込む
        await this.refreshFontCache();
    }
    
    private async refreshFontCache(): Promise<void> {
        logger.debug("フォント一覧を更新します...");
        const fonts = (await fsp.readdir(this.fontsFolder))
            .filter((f) => {
                const normalized = f.toLowerCase();
                return normalized.endsWith(".ttf")
                    || normalized.endsWith(".woff")
                    || normalized.endsWith(".woff2")
                    || normalized.endsWith(".otf");
            })
            .map((f): FirebotFont => {
                return {
                    filename: f,
                    path: path.join(this.fontsFolder, f).replace(/\\/g, "/"),
                    name: this.stripFontFileType(f),
                    format: this.getFontFormatFromFilename(f)
                };
            });

        this.cachedFonts = fonts;
        
        // キャッシュファイルを更新
        try {
            await fsp.writeFile(this.fontCacheFile, JSON.stringify(this.cachedFonts), 'utf8');
            logger.debug("フォントキャッシュを更新しました");
        } catch (error) {
            logger.error("フォントキャッシュの保存に失敗しました", error);
        }
        
        // メインウィンドウが読み込まれた後にCSSを生成する
        setTimeout(() => {
            this.generateAppFontCssFile().catch(err => {
                logger.error("フォントCSSの生成に失敗しました", err);
            });
        }, 5000); // 5秒後に遅延実行
    }
    
    private async validateAndUpdateFontCache(): Promise<void> {
        try {
            // ディレクトリからファイル一覧を取得
            const files = await fsp.readdir(this.fontsFolder);
            const fontFiles = files.filter(f => {
                const normalized = f.toLowerCase();
                return normalized.endsWith(".ttf")
                    || normalized.endsWith(".woff")
                    || normalized.endsWith(".woff2")
                    || normalized.endsWith(".otf");
            });
            
            // キャッシュと実際のファイル一覧を比較
            const cachedFilenames = this.cachedFonts.map(f => f.filename);
            const needsUpdate = 
                fontFiles.length !== cachedFilenames.length ||
                fontFiles.some(file => !cachedFilenames.includes(file)) ||
                cachedFilenames.some(file => !fontFiles.includes(file));
            
            if (needsUpdate) {
                logger.info("フォントファイルとキャッシュに不一致があるため、更新します");
                await this.refreshFontCache();
            } else if (!this.fontCssGenerated) {
                // CSSがまだ生成されていない場合は生成する
                await this.generateAppFontCssFile();
            }
        } catch (error) {
            logger.error("フォントキャッシュの検証に失敗しました", error);
        }
    }

    getFont(name: string): FirebotFont {
        const font = this.cachedFonts.find(f => f.name === name);
        return font;
    }

    async installFont(filepath: string): Promise<boolean> {
        try {
            const filename = path.parse(filepath).base;
            const destination = path.join(this.fontsFolder, filename);

            await fsp.cp(filepath, destination);
            this.cachedFonts.push({
                filename: filename,
                path: destination.replace(/\\/g, "/"),
                name: this.stripFontFileType(filename),
                format: this.getFontFormatFromFilename(filename)
            });
            logger.info(`Font ${filename} installed`);

            // キャッシュファイルを更新
            await fsp.writeFile(this.fontCacheFile, JSON.stringify(this.cachedFonts), 'utf8');

            await this.generateAppFontCssFile();

            return true;
        } catch (error) {
            logger.error(`Error installing font from ${path}`, error);
            return false;
        }
    }

    async removeFont(name: string): Promise<void> {
        const font = this.cachedFonts.find(f => f.name === name);

        if (font != null) {
            if (SettingsManager.getSetting("ChatCustomFontFamily") === name) {
                SettingsManager.saveSetting("ChatCustomFontFamily", FirebotSettingsDefaults.ChatCustomFontFamily);
                SettingsManager.saveSetting("ChatCustomFontFamilyEnabled", false);
            }

            try {
                await fsp.unlink(font.path);
                this.cachedFonts.splice(this.cachedFonts.indexOf(font), 1);
                logger.info(`Font ${name} removed`);

                // キャッシュファイルを更新
                await fsp.writeFile(this.fontCacheFile, JSON.stringify(this.cachedFonts), 'utf8');

                await this.generateAppFontCssFile();
            } catch (error) {
                logger.error(`Error removing font ${name}`, error);
            }
        }
    }

    async generateAppFontCssFile(): Promise<void> {
        this.fontCssGenerated = true;
        try {
            let cssFileRaw = "";

            this.cachedFonts.forEach((font) => {
                const fontPath = `file:///${font.path}`;

                cssFileRaw +=
                    `@font-face {
                        font-family: '${font.name}';
                        src: url('${fontPath}') format('${font.format}')
                    }
                    `;
            });

            await fsp.writeFile(this.fontCssPath, cssFileRaw, { encoding: "utf8" });

            frontendCommunicator.send("fonts:reload-font-css");
            webServer.sendToOverlay("OVERLAY:RELOAD_FONTS");

            logger.info("Font CSS file generated");
        } catch (error) {
            logger.error("Error generated font CSS file", error);
        }
    }
}

const fontManager = new FontManager();

export { fontManager as FontManager };
